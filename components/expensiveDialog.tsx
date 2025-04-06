import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const expenseSchema = z.object({
  description: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  amount: z.number().positive("O valor deve ser positivo"),
  date: z.string(),
});

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ExpenseDialog = ({ open, onOpenChange, onSuccess }: ExpenseDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(expenseSchema),
  });

  const [loading, setLoading] = useState(false);

  interface FormData {
    description: string;
    amount: number;
    date: string;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Despesa cadastrada com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("Erro ao cadastrar despesa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              autoComplete="new-password" id="description" {...register("description")} placeholder="Ex: Conta de luz" />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="amount">Valor</Label>
            <Input
              autoComplete="new-password" id="amount" type="number" {...register("amount", { valueAsNumber: true })} placeholder="Ex: 100" />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="date">Data</Label>
            <Input
              autoComplete="new-password" id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600">
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
