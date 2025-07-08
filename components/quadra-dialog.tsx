'use client'
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast";


interface CourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  court?: CourtForm;
}

const courtSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome obrigatório"),
  address: z.string().min(1, "Endereço obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().positive("Preço deve ser positivo"),
  featuredImage: z.string().url("URL de imagem inválida"),
  categoryId: z.string().min(1, "Categoria obrigatoria"),
  category: z.array(z.object({ id: z.string().min(1, "Categoria obrigatoria").min(1), }).optional()).optional()
});
let msg
type CourtForm = z.infer<typeof courtSchema>;

interface Availability {
  date: string;
  startTime: string;
  endTime: string;
}

export default function CourtDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  court,
}: CourtDialogProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  console.log("quadra selectionada", court);

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const defaultValues = {
    name: "",
    address: "",
    city: "",
    description: "",
    pricePerHour: 0,
    featuredImage: "",
    categoryId: court?.categoryId,
  }
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CourtForm>({
    resolver: zodResolver(courtSchema),
    defaultValues
  });

  const featuredImage = watch("featuredImage");

  // Disponibilidade
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value < today) {
      msg = "A data não pode estar no passado."
      toast.error(msg)
      setError(msg);
      setNewDate("");
      return;
    }
    setError("");
    setNewDate(value);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (newDate) {
      const now = new Date();
      const selectedDateTime = new Date(`${newDate}T${value}`);
      const minDateTime = new Date(now.getTime() + 90 * 60 * 1000);
      if (selectedDateTime < minDateTime) {
        msg = "A hora de início deve ser pelo menos 1h30 à frente da hora atual."
        toast.error(msg);
        setError(msg);
        setNewStartTime("");
        return;
      }
    }
    setError("");
    setNewStartTime(value);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (newDate && newStartTime) {
      const start = new Date(`${newDate}T${newStartTime}`);
      const end = new Date(`${newDate}T${value}`);
      if (end <= start) {
        msg = "A hora de fim deve ser depois da hora de início."
        toast.error(msg)
        setError(msg);

        setNewEndTime("");
        return;
      }
    }
    setError("");
    setNewEndTime(value);
  };

  const addAvailability = () => {
    if (!newDate || !newStartTime || !newEndTime) {
      msg = "Preencha todos os campos de disponibilidade"
      toast.error(msg);
      setError(msg);

      return;
    }

    // Valida se a data não está no passado
    const now = new Date();
    const selectedDate = new Date(newDate);
    if (selectedDate < new Date(format(now, "yyyy-MM-dd"))) {
      let msg = "A data não pode estar no passado."
      toast.error(msg);
      setError(msg);
      return;
    }
    // Valida se o horário de início é pelo menos 1h30 à frente da hora atual (se for hoje)
    if (newDate === format(now, "yyyy-MM-dd")) {
      const startDateTime = new Date(`${newDate}T${newStartTime}`);
      const minStartDateTime = new Date(now.getTime() + 90 * 60 * 1000);
      if (startDateTime < minStartDateTime) {
        let msg = "A data não pode estar no passado."
        toast.error(msg);
        setError(msg);
        return;
      }
    }

    // Valida se o horário de fim é pelo menos 1 hora depois do início
    const start = new Date(`${newDate}T${newStartTime}`);
    const end = new Date(`${newDate}T${newEndTime}`);

    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours < 1) {
      let msg = "A diferença entre início e fim deve ser de pelo menos 1 hora.";
      toast.error(msg);
      setError(msg);
      return;
    }


    // Valida se já existe disponibilidade igual
    const exists = availability.some(
      (slot) =>
        slot.date === newDate &&
        slot.startTime === newStartTime &&
        slot.endTime === newEndTime
    );
    if (exists) {
      let msg = "Já existe uma disponibilidade com esses dados."
      toast.error(msg);
      setError(msg);

      return;
    }

    const startDateTime = new Date(`${newDate}T${newStartTime}`);
    const endDateTime = new Date(`${newDate}T${newEndTime}`);

    // Verifica distância mínima de 20 minutos de outros horários
    const hasTooClose = availability.some((slot) => {
      if (slot.date !== newDate) return false;
      const slotStart = new Date(`${slot.date}T${slot.startTime}`);
      const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
      // Verifica se o novo início ou fim está a menos de 20 minutos do início ou fim de outro slot
      const minDiffMs = 20 * 60 * 1000;
      return (
        Math.abs(startDateTime.getTime() - slotEnd.getTime()) < minDiffMs ||
        Math.abs(endDateTime.getTime() - slotStart.getTime()) < minDiffMs
      );
    });
    if (hasTooClose) {
      const msg = "Deve haver pelo menos 20 minutos de intervalo entre horários.";
      toast.error(msg);
      setError(msg);
      return;
    }

    // Duração mínima de 1 hora
    ;
    if (diffMs < 60 * 60 * 1000) {
      const msg = "A diferença entre início e fim deve ser de pelo menos 1 hora.";
      toast.error(msg);
      setError(msg);
      return;
    }

    // Duplicata exata
    const alreadyexists = availability.some(
      (slot) =>
        slot.date === newDate &&
        slot.startTime === newStartTime &&
        slot.endTime === newEndTime
    );
    if (alreadyexists) {
      const msg = "Já existe uma disponibilidade com esses dados.";
      toast.error(msg);
      setError(msg);
      return;
    }


    setAvailability((prev) => [
      ...prev,
      { date: newDate, startTime: newStartTime, endTime: newEndTime },
    ]);

    setNewDate("");
    setNewStartTime("");
    setNewEndTime("");
    setError("");
  };

  const removeAvailability = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro no upload");

      setValue("featuredImage", data.url);
    } catch (err) {
      console.error(err);
      msg = "Falha no upload da imagem.";
      toast.error(msg);
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      console.log("QUADRA SELETC ", court)
      return data.categories || [];

    } catch (err) {
      msg = String(err);
      toast.error(msg);
      setError(msg);
      console.error(err);
      return [];
    }
  };

  const onSubmit = async (data: CourtForm) => {
    try {
      const payload = { ...data, availabilities: availability };

      const response = await fetch(
        isEditing ? `/api/admin/courts/${data.id}` : "/api/admin/courts",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const resJson = await response.json();
      if (!response.ok) {
        msg = String(resJson.message | resJson.error)
        toast.error(msg);
        setError(msg);
        return;
      }

      reset();
      setAvailability([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      msg = String(error instanceof Error ? error.message : "Erro desconhecido");
      toast.error(msg);
      setError(msg);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  useEffect(() => {
    if (open && isEditing && court) {
      reset({
        id: court.id,
        name: court.name,
        address: court.address,
        city: court.city,
        description: court.description,
        pricePerHour: court.pricePerHour,
        featuredImage: court.featuredImage,
        categoryId: court?.category?.[0]?.id ?? "",
      });
      setAvailability((court as any).availability || []);
    } else if (open && !isEditing) {
      reset(defaultValues);
      setAvailability([]);
    }
  }, [open, isEditing, court, reset]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };

    load();
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timeout);
    }
  }, [error]);


  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Quadra" : "Nova Quadra"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[80vh]">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <label htmlFor="name">Nome</label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-destructive">{errors.name.message}</p>}

            <label htmlFor="address">Endereço</label>
            <Input id="address" {...register("address")} />
            {errors.address && <p className="text-destructive">{errors.address.message}</p>}

            <label htmlFor="city">Cidade</label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-destructive">{errors.city.message}</p>}

            <Textarea placeholder="Descrição..." {...register("description")} />

            <div>
              <label>Categoria</label>
              <Select onValueChange={(val) => setValue("categoryId", val)} defaultValue={court?.category?.[0]?.id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label>Preço por hora (KZ)</label>
              <Input type="number" step="0.01" {...register("pricePerHour")} />
              {errors.pricePerHour && <p className="text-destructive">{errors.pricePerHour.message}</p>}
            </div>

            <div>
              <label>Imagem principal</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {uploading && <p>Enviando imagem...</p>}
              {featuredImage && (
                <img src={featuredImage} alt="Preview" className="h-32 mt-2 rounded" />
              )}
              {errors.featuredImage && <p className="text-destructive">{errors.featuredImage.message}</p>}
            </div>

            {!isEditing && (
              <div className="border p-4 rounded">
                <h3 className="font-semibold mb-2">Disponibilidades</h3>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Input type="date" min={today} value={newDate} onInput={handleDateChange} />
                  <Input type="time" value={newStartTime} onInput={handleStartTimeChange} />
                  <Input type="time" value={newEndTime} onInput={handleEndTimeChange} />
                  <Button type="button" onClick={addAvailability} disabled={!newDate || !newStartTime || !newEndTime}>
                    + Adicionar
                  </Button>
                </div>

                {availability.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {availability.map((slot, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {format(new Date(slot.date), "dd/MM/yyyy")} - {slot.startTime} às {slot.endTime}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAvailability(index)}
                          className="text-red-500 text-xs"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 text-white" disabled={isSubmitting || uploading}>
              {isSubmitting
                ? isEditing
                  ? "Actualizando..."
                  : "Registando..."
                : isEditing
                  ? "Actualizar"
                  : "Registar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
