"use client"

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const budgetSchema = z.object({
  amount: z.string().min(1, "O valor é obrigatório"),
  type: z.enum(["INCOME", "EXPENSE"], { required_error: "Selecione um tipo" }),
  category: z.string().min(1, "A categoria é obrigatória"),
  description: z.string().optional(),
  date: z.string().min(1, "A data é obrigatória"),
  id: z.string().optional(),
});

type BudgetForm = z.infer<typeof budgetSchema>;

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  budget?: BudgetForm | null;
}

export default function DialogBudget({
  open,
  onOpenChange,
  onSuccess,
  budget,
}: BudgetDialogProps) {
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {},
  });

  useEffect(() => {
    if (budget) {
      reset(budget);
    }
  }, [budget, reset]);

  const onSubmit = async (data: BudgetForm) => {
    try {
      const response = await fetch(budget ? `/api/budgets/${budget.id}` : "/api/budgets", {
        method: budget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar orçamento");
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{budget ? "Editar Orçamento" : "Adicionar Novo Orçamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              autoComplete="new-password" placeholder="Valor" {...register("amount")} className={errors.amount ? "border-destructive" : ""} />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Select onValueChange={(value) => setValue("type", value as "INCOME" | "EXPENSE")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Receita</SelectItem>
                <SelectItem value="EXPENSE">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Input
              autoComplete="new-password" placeholder="Categoria" {...register("category")} className={errors.category ? "border-destructive" : ""} />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Input
              autoComplete="new-password" placeholder="Descrição (opcional)" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Input
              autoComplete="new-password" type="date" {...register("date")} className={errors.date ? "border-destructive" : ""} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? (budget ? "Atualizando..." : "Adicionando...") : budget ? "Atualizar Orçamento" : "Adicionar Orçamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
