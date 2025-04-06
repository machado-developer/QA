"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().positive(),
  type: z.enum(["RECEITA", "DESPESA"]),
  description: z.string().min(1),
  categoryId: z.string().min(1).optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isEditing?: boolean;
  transaction?: {
    amount: number;
    type: "RECEITA" | "DESPESA";
    description: string;
    categoryId?: string;
    id?: string;
  };
}

export default function TransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  transaction,
}: TransactionDialogProps) {
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string; type: "RECEITA" | "DESPESA" }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction || {
      amount: 0,
      type: "RECEITA",
      description: "",
      categoryId: "",
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const selectedCategory = useWatch({ control, name: "categoryId" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing && transaction) {
      reset(transaction);
    } else {
      reset({ amount: 0, type: "RECEITA", description: "", categoryId: "" });
    }
  }, [isEditing, transaction, reset]);

  const onSubmit = async (data: TransactionForm) => {
    try {
      const response = await fetch(
        isEditing ? `/api/transations/${data.id}` : "/api/transations",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          isEditing ? "Falha ao atualizar transação" : "Falha ao criar transação"
        );
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
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Adicionar Transação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Input
            autoComplete="new-password"
            type="number"
            step="0.01"
            placeholder="Valor"
            {...register("amount", { valueAsNumber: true })}
            className={errors.amount ? "border-destructive" : ""}
          />

          {/* Tipo de Transação */}
          <Select
            value={selectedType}
            onValueChange={(value) => setValue("type", value as "RECEITA" | "DESPESA")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECEITA">Receita</SelectItem>
              <SelectItem value="DESPESA">Despesa</SelectItem>
            </SelectContent>
          </Select>

          {/* Categoria filtrada pelo tipo */}
          <Select
            value={selectedCategory}
            onValueChange={(value) => setValue("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((category) => category.type === selectedType)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Input
            autoComplete="new-password"
            placeholder="Descrição"
            {...register("description")}
            className={errors.description ? "border-destructive" : ""}
          />
          <Button type="submit" className="w-full bg-green-600 text-white" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? "Atualizando..."
                : "Adicionando..."
              : isEditing
                ? "Atualizar Transação"
                : "Adicionar Transação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
