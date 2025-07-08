"use client";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { bookingSchema, bookingSchemaEdit } from "@/app/perfil/reservas/schema/bookSchema";
import { Input } from "./ui/input";
import { formatarDisponibilidade } from "@/lib/utils";
import { Description } from "@radix-ui/react-dialog";
import Loading from "@/loading";
import toast from "react-hot-toast";

type BookingForm = z.infer<typeof bookingSchemaEdit>;

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchemaEdit),
    defaultValues: {
      availabilityId: "",
      status: "PENDENTE",
    },
  });

  const selectedAvailabilityId = watch("availabilityId");
  const selectedStatus = watch("status");

  const fetchData = async () => {
    const [usersRes, courtsRes, availabilitiesRes] = await Promise.all([
      fetch("/api/admin/users").then((res) => res.json()),
      fetch("/api/admin/courts").then((res) => res.json()),
      fetch(`/api/admin/courts/${booking?.court?.id}/availiabilities`).then((res) => res.json()),
    ]);

    setUsers(usersRes.users || []);
    setCourts(courtsRes.courts || []);
    setAvailabilities(availabilitiesRes.availabilities || []);
  };

  useEffect(() => {
    if (open) {
      fetchData();
      if (isEditing && booking) {
        reset(
          {
            availabilityId: booking.availability?.id || "",
            status:
              booking.status === "PENDENTE" ||
                booking.status === "CONFIRMADO" ||
                booking.status === "CANCELADO"
                ? booking.status
                : "PENDENTE",
          },
          { keepDirtyValues: false }
        );
      } else {
        reset();
      }
      setError("");
    }
  }, [open]);

  console.log("Disponbilidades", availabilities);

  const onSubmit = async (data: BookingForm) => {
    try {
      const response = await fetch(
        `/api/bookings/${booking?.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.message || errorData?.error || "Erro ao deletar reserva. Tente novamente.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error)?.message || "Erro ao atualizar agendamento. Tente novamente.");
    }
  };

  return (
    <Suspense fallback={<Loading />}>
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
              <label>Cliente/Usuario</label>
              <Input readOnly defaultValue={booking?.user?.name || "N/A"}></Input>
            </div>

            <div>
              <label>Quadra</label>
              <Input readOnly defaultValue={booking?.court?.name || "N/A"}></Input>

            </div>

            <Description className="text-sm text-muted-foreground leading-relaxed border rounded-md p-3 bg-muted/50">
              {booking?.availability?.startTime && booking?.availability?.endTime
                ? formatarDisponibilidade(booking.availability.startTime, booking.availability.endTime)
                : "N/A"}
            </Description>

            <div>
              <label>Horário</label>
              <Select value={selectedAvailabilityId} onValueChange={(val) => setValue("availabilityId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {availabilities?.map((av: any) => (
                    <SelectItem key={av.id} value={av.id}>
                      {av?.startTime && av?.endTime
                        ? formatarDisponibilidade(av.startTime, av.endTime)
                        : "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.availabilityId && <p className="text-destructive">{errors.availabilityId.message}</p>}
            </div>

            <div>
              <label>Status</label>
              <Select value={selectedStatus} onValueChange={(val) => setValue("status", val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-destructive">{errors.status.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-green-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? (isEditing && "Editando...") : isEditing && "Editar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
