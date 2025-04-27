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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const bookingSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "Selecione o usuário"),
  courtId: z.string().min(1, "Selecione a quadra"),
  availabilityId: z.string().min(1, "Selecione o horário"),
  status: z.enum(["PENDENTE", "CONFIRMADO", "CANCELADO"]),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Reserva {
  id?: string;
  user?: { name: string, id?: string };
  court: { name: string, pricePerHour: number, id?: string };
  availability: { startTime: string; endTime: string; date: string, id?: string };
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
}
interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  booking?: Reserva;
}

export default function BookingDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  booking,
}: BookingDialogProps) {
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      userId: "",
      courtId: "",
      availabilityId: "",
      status: "PENDENTE",
    },
  });

  const fetchData = async () => {
    const [usersRes, courtsRes, availabilitiesRes] = await Promise.all([
      fetch("/api/admin/users").then(res => res.json()),
      fetch("/api/admin/courts").then(res => res.json()),
      fetch("/api/admin/availabilities").then(res => res.json()),
    ]);

    setUsers(usersRes.users || []);
    setCourts(courtsRes.courts || []);
    setAvailabilities(availabilitiesRes.availabilities || []);
  };

  useEffect(() => {
    if (open) {
      fetchData();
      if (isEditing && booking) {
        reset(booking);
      } else {
        reset();
      }
      setError("");
    }
  }, [open]);

  const onSubmit = async (data: BookingForm) => {
    try {
      const response = await fetch(
        isEditing ? `/api/admin/bookings/${data.id}` : "/api/admin/bookings",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar agendamento");

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
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label>Usuário</label>
            <Select onValueChange={(val) => setValue("userId", val)} defaultValue={booking?.user?.id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.userId && <p className="text-destructive">{errors.userId.message}</p>}
          </div>

          <div>
            <label>Quadra</label>
            <Select onValueChange={(val) => setValue("courtId", val)} defaultValue={booking?.court.id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a quadra" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court: any) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.courtId && <p className="text-destructive">{errors.courtId.message}</p>}
          </div>

          <div>
            <label>Horário</label>
            <Select onValueChange={(val) => setValue("availabilityId", val)} defaultValue={booking?.availability.id || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {availabilities.map((av: any) => (
                  <SelectItem key={av.id} value={av.id}>
                    {`${av.date} ${av.startTime}–${av.endTime}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.availabilityId && <p className="text-destructive">{errors.availabilityId.message}</p>}
          </div>

          <div>
            <label>Status</label>
            <Select onValueChange={(val: "PENDENTE" | "CONFIRMADO" | "CANCELADO") => setValue("status", val)} defaultValue={booking?.status || "PENDENTE"}>

              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-destructive">{errors.status.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-green-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Salvando..." : "Criando...") : isEditing ? "Salvar" : "Criar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export { bookingSchema }