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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const investmentSchema = z.object({
    name: z.string().min(1, "O nome do investimento é obrigatório"),
    type: z.enum(["Ações", "CDB", "Tesouro Direto", "Fundos"], {
        required_error: "Selecione um tipo de investimento",
    }),
    amount: z.string().min(1, "O valor é obrigatório"),
    returnRate: z.string().optional(),
    startDate: z.string().min(1, "A data de início é obrigatória"),
    endDate: z.string().optional(),
});

type InvestmentForm = z.infer<typeof investmentSchema>;

interface InvestmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function DialogInvestment({ open, onOpenChange, onSuccess }: InvestmentDialogProps) {
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<InvestmentForm>({
        resolver: zodResolver(investmentSchema),
    });

    const onSubmit = async (data: InvestmentForm) => {
        try {
            const response = await fetch("/api/investments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Falha ao adicionar investimento");
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
                    <DialogTitle>Adicionar Novo Investimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                   <input 
autoComplete="new-password" placeholder="Nome do Investimento" {...register("name")} className={errors.name ? "border-destructive" : ""} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}

                    <Select onValueChange={(value) => setValue("type", value as "Ações" | "CDB" | "Tesouro Direto" | "Fundos")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Ações">Ações</SelectItem>
                            <SelectItem value="CDB">CDB</SelectItem>
                            <SelectItem value="Tesouro Direto">Tesouro Direto</SelectItem>
                            <SelectItem value="Fundos">Fundos</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}

                   <input 
autoComplete="new-password" type="number" placeholder="Valor Investido" {...register("amount")} className={errors.amount ? "border-destructive" : ""} />
                    {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}

                   <input 
autoComplete="new-password" type="number" placeholder="Taxa de Retorno (%)" {...register("returnRate")} />

                   <input 
autoComplete="new-password" type="date" placeholder="Data de Início" {...register("startDate")} className={errors.startDate ? "border-destructive" : ""} />
                    {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}

                   <input 
autoComplete="new-password" type="date" placeholder="Data de Resgate (Opcional)" {...register("endDate")} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Adicionando..." : "Adicionar Investimento"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
