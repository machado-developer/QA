"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
// Importações no topo...
import { format } from "date-fns";

interface CourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  court?: CourtForm;
}


const courtSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "O nome é obrigatório"),
  address: z.string().min(1, "Endereço obrigatório"),
  city: z.string().min(1, "Cidade obrigatória"),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().positive("Preço deve ser positivo"),
  featuredImage: z.string().url("Imagem inválida"),
  categoryId: z.string().optional(),
});

type CourtForm = z.infer<typeof courtSchema>;

interface Disponibilidade {
  data: string; // yyyy-MM-dd
  horarios: string[];
}

export default function CourtDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  court,
}: CourtDialogProps) {
  // ESTADO EXTRA
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [horariosTemp, setHorariosTemp] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  // ... estados e hooks originais

  const adicionarHorarioTemp = () => {
    if (!novoHorario) return;
    setHorariosTemp((prev) => [...prev, novoHorario]);
    setNovoHorario("");
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CourtForm>({
    resolver: zodResolver(courtSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      description: "",
      pricePerHour: 0,
      featuredImage: "",
      categoryId: "",
    },
  });
  const adicionarDisponibilidade = () => {
    if (!novaData || horariosTemp.length === 0) return;

    setDisponibilidades((prev) => [
      ...prev,
      { data: novaData, horarios: horariosTemp },
    ]);
    setNovaData("");
    setHorariosTemp([]);
  };

  const removerDisponibilidade = (index: number) => {
    setDisponibilidades((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CourtForm) => {
    try {
      const payload = {
        ...data,
        disponibilidades,
      };

      const response = await fetch(
        isEditing ? `/api/courts/${data.id}` : "/api/courts",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar quadra");

      reset();
      setDisponibilidades([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Quadra" : "Cadastrar Nova Quadra"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto max-h-[80vh]">
          {/* ... Campos anteriores */}

          {/* 🟢 CAMPO DE DISPONIBILIDADE */}
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Disponibilidades</h3>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={novoHorario}
                  onChange={(e) => setNovoHorario(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={adicionarHorarioTemp}>
                  + Horário
                </Button>
              </div>
            </div>

            {/* Horários adicionados à data */}
            {horariosTemp.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Horários: {horariosTemp.join(", ")}
              </div>
            )}

            <Button type="button" onClick={adicionarDisponibilidade} className="mt-2">
              Adicionar Data
            </Button>

            {/* Lista de disponibilidades adicionadas */}
            {disponibilidades.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {disponibilidades.map((disp, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {format(new Date(disp.data), "dd/MM/yyyy")} – {disp.horarios.join(", ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerDisponibilidade(index)}
                      className="text-red-500 text-xs"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full bg-green-600 text-white"
          >
            {isSubmitting
              ? isEditing
                ? "Atualizando..."
                : "Registrando..."
              : isEditing
                ? "Atualizar Quadra"
                : "Cadastrar Quadra"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
