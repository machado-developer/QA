"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { formatarDisponibilidade, formatCurrency } from "@/lib/utils";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  payment?: PaymentForm;
}

const paymentSchema = z.object({
  id: z.string().optional(),
  cliente: z.string().optional(),
  telefone: z.string().min(9, "9 digitos no minimo"),
  bookingId: z.string().min(1, "Funcionário é obrigatório"),
  amount: z.coerce.number().positive("O amount deve ser positivo"),
  methodId: z.string().min(1, "Método de pagamento é obrigatório"),
  description: z.string().optional(),
  expectedAmount: z.number(), // <- novo campo só pra validação, não será enviado ao backend
}).superRefine((data, ctx) => {
  if (data.amount < data.expectedAmount) {
    ctx.addIssue({
      path: ["amount"],
      code: "custom",
      message: `O valor pago não pode ser menor que o valor  a pagar (${formatCurrency(data.expectedAmount)})`,
    });
  }
});


type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  payment,
}: PaymentDialogProps) {
  const [error, setError] = useState("");
  const [amountOriginal, setamountOriginal] = useState<number | null>(null);

  const [cliente, setCliente] = useState<{ id: string; name: string }[]>([]);
  const [methodPayments, setMetPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [books, setBooks] = useState<{
    id: string; name: string, user: { name: string }, availability: {
      startTime: string,
      endTime: string
    }, court: { name: string, pricePerHour: number }
  }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      methodId: "",
      description: "",
      bookingId: "",
      expectedAmount: 0,
    },
  });

  const onSubmit = async (data: PaymentForm) => {
    try {
      const response = await fetch(
        isEditing ? `/api/payments/${data.id}` : "/api/payments",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Erro ao registrar pagamento");

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payments-methods");
      const data = await response.json();
      setMetPaymentMethods(data.methods);
    } catch (err) {
      console.error("Erro ao buscar metods:", err);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBooks(data.bookings);
    } catch (err) {
      console.error("Erro ao buscar books:", err);
    }
  };

  useEffect(() => {
    if (open) { fetchPaymentMethods(); fetchBooks() }
    if (open && isEditing && payment) {
      reset(payment);
    } else if (open && !isEditing) {
      reset();
    }
  }, [open, isEditing, payment, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar pagamento" : "Registrar pagamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <label>Cliente</label>
            <Input

              type="text"
              {...register("cliente")}
            />

          </div>
          <div>
            <label>Telefone</label>
            <Input
              type="text"
              {...register("telefone")}
            />

          </div>
          <div>

            <label>Reserva</label>
            <Select
              onValueChange={(val) => {
                setValue("bookingId", val);
                const selected = books.find((b) => b.id === val);
                const amount = selected?.court?.pricePerHour ?? null;
                setamountOriginal(amount ?? null);
                setValue("expectedAmount", amount ?? 0);
              }}
              defaultValue={payment?.bookingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a reserva" />
              </SelectTrigger>
              <SelectContent>
                {books.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.user.name}-{b.court?.name}-{formatarDisponibilidade(new Date(b.availability?.startTime), (new Date(b.availability?.endTime)))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bookingId && <p className="text-destructive">{errors.bookingId.message}</p>}
          </div>
          {amountOriginal !== null && (
            <div>
              <label>amount a Pagar</label>
              <Input
                disabled
                value={formatCurrency(amountOriginal)}
              />
            </div>
          )}
          {amountOriginal !== null && watch("amount") > amountOriginal && (
            <div className="text-green-600 text-sm">
              Troco: {formatCurrency(watch("amount") - amountOriginal)}
            </div>
          )}
          <Controller
            name="amount"
            control={control}

            render={({ field: { onChange, value, ...fieldProps } }) => (
              <div>
                <label>amount (KZ)</label>
                <Input
                  type="text"
                  value={
                    typeof value === "number"
                      ? formatCurrency(value)
                      : value
                  }
                  onChange={(e) => {
                    const rawValue = e.target.value
                      .replace(/[^\d,]/g, "") // Remove tudo que não for número ou vírgula
                      .replace(",", "."); // Converte vírgula para ponto

                    onChange(Number(rawValue));
                  }}
                  {...fieldProps}
                />
                {errors.amount && (
                  <p className="text-destructive">{errors.amount.message}</p>
                )}
              </div>
            )}
          />

          <div>
            <label>Método de Pagamento</label>
            <Select onValueChange={(val) => setValue("methodId", val)} defaultValue={payment?.methodId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha o método" />
              </SelectTrigger>
              <SelectContent>
                {methodPayments.map((meth) => (
                  <SelectItem key={meth.id} value={meth.id}>{meth.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.methodId && <p className="text-destructive">{errors.methodId.message}</p>}
          </div>

          <div>
            <label>Data do Pagamento</label>
            <Input
              disabled
              type="date"
              value={new Date().toISOString().split("T")[0]}
            />

          </div>

          <div>
            <label>Descrição (opcional)</label>
            <Textarea {...register("description")} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white">
            {isSubmitting ? (isEditing ? "Atualizando..." : "Registrando...") : isEditing ? "Atualizar" : "Registrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
