"use client";

import { Suspense, useEffect, useState } from "react";
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
import { formatarDisponibilidade, formatCurrency } from "@/lib/utils";
import { PaymentStatus } from "@prisma/client";
import Loading from "@/loading";
import toast from "react-hot-toast";

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
  status: z.string().optional(),
  telefone: z.string().min(9, "Telefone deve ter 9 dígitos"),
  bookingId: z.string().min(1, "Reserva é obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  methodId: z.string().min(1, "Método de pagamento é obrigatório"),
  description: z.string().optional().default("N/A"),
  expectedAmount: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.amount < (data.expectedAmount ?? 0)) {
    ctx.addIssue({
      path: ["amount"],
      code: "custom",
      message: `O valor pago não pode ser menor que o valor a pagar (${formatCurrency(data.expectedAmount ?? 0)})`,
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
  const [amountOriginal, setAmountOriginal] = useState<number | null>(null);

  const [methodPayments, setMethodPayments] = useState<{ id: string; name: string }[]>([]);
  const [books, setBooks] = useState<{
    id: string;
    name: string;
    user: { name: string };
    availability: { startTime: string; endTime: string };
    court: { name: string; pricePerHour: number };
  }[]>([]);

  const defaultValues = {
    amount: 0,
    methodId: "",
    description: "",
    bookingId: "",
    expectedAmount: 0,
    status: "PENDENTE",
  }

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
    defaultValues,
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData?.message || errorData?.error || "Erro ao deletar reserva. Tente novamente.");
      }

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
      setMethodPayments(data.methods);
    } catch (err) {
      console.error("Erro ao buscar métodos:", err);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      setBooks(data.data.filter((b: any) => b.payment?.status !== "CONCLUIDO"));
    } catch (err) {
      console.error("Erro ao buscar reservas:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
      fetchBooks();
      if (isEditing && payment) {
        reset(payment);
      } else {
        reset(defaultValues);
      }
    }
  }, [open, isEditing, payment, reset]);

  return (
    <Suspense fallback={<Loading />}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar pagamento" : "Registrar pagamento"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}

            {/* Estado do pagamento */}
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Estado do Pagamento</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Estado do Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PaymentStatus).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {value}
                        </SelectItem>
                      ))}

                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Cliente */}
            <div>
              <label>Cliente</label>
              <Input type="text" {...register("cliente")} />
            </div>

            {/* Telefone */}
            <div>
              <label>Telefone</label>
              <Input
                type="text"
                {...register("telefone")}
                onInput={(e) => {
                  const input = e.currentTarget;
                  input.value = input.value.replace(/\D/g, "");
                }}
              />
              {errors.telefone && <p className="text-destructive">{errors.telefone.message}</p>}
            </div>

            {/* Reserva */}
            <div>
              <label>Reserva</label>
              <Controller
                name="bookingId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      
                        field.onChange(val);
                        const selected = books.find((b) => b.id === val);
                        let amount = 0;
                        if (selected) {
                        const start = new Date(selected.availability.startTime);
                        const end = new Date(selected.availability.endTime);
                        const diffMs = end.getTime() - start.getTime();
                        const diffHoras = diffMs / (1000 * 60 * 60);
                        amount = (selected.court?.pricePerHour ?? 0) * diffHoras;
                        }
                        setAmountOriginal(amount);
                        setValue("expectedAmount", amount);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.user.name} - {b.court?.name} - {formatarDisponibilidade(new Date(b.availability.startTime), new Date(b.availability.endTime))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.bookingId && <p className="text-destructive">{errors.bookingId.message}</p>}
            </div>

            {/* Valor esperado */}
            {amountOriginal !== null && (
              <div>
                <label>Valor a Pagar</label>
                <Input disabled value={formatCurrency(amountOriginal)} />
              </div>
            )}

            {/* Valor pago */}
            <Controller
              name="amount"
              control={control}
              render={({ field: { onChange, value, ...rest } }) => (
                <div>
                  <label>Valor (KZ)</label>
                  <Input
                    type="text"
                    value={typeof value === "number" && !isNaN(value) ? formatCurrency(value) : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
                      onChange(Number(raw));
                    }}
                    {...rest}
                  />
                  {errors.amount && <p className="text-destructive">{errors.amount.message}</p>}
                </div>
              )}
            />

            {/* Troco */}
            {amountOriginal !== null && watch("amount") > amountOriginal && (
              <div className="text-green-600 text-sm">
                Troco: {formatCurrency(watch("amount") - amountOriginal)}
              </div>
            )}

            {/* Método de pagamento */}
            <div>
              <label>Método de Pagamento</label>
              <Controller
                name="methodId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o método" />
                    </SelectTrigger>
                    <SelectContent>
                      {methodPayments.map((meth) => (
                        <SelectItem key={meth.id} value={meth.id}>
                          {meth.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.methodId && <p className="text-destructive">{errors.methodId.message}</p>}
            </div>

            {/* Data de hoje */}
            <div>
              <label>Data do Pagamento</label>
              <Input
                type="date"
                disabled
                value={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Descrição */}
            <div>
              <label>Descrição (opcional)</label>
              <Textarea {...register("description")} />
            </div>

            {/* Botão */}
            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white">
              {isSubmitting ? (isEditing ? "Atualizando..." : "Registrando...") : isEditing ? "Atualizar" : "Registrar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
}
