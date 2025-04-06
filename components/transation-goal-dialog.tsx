import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface TransactionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goalId: string
    onSuccess: () => void
}

const transactionSchema = z.object({
    amount: z.coerce.number().positive("O valor deve ser maior que zero"),
})

type TransactionForm = z.infer<typeof transactionSchema>

export default function TransactionGoalDialog({ open, onOpenChange, goalId, onSuccess }: TransactionDialogProps) {
    const [error, setError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TransactionForm>({
        resolver: zodResolver(transactionSchema),
        defaultValues: { amount: 0 },
    })

    const handleSaveTransaction = async (data: TransactionForm) => {
        try {
            const response = await fetch(`/api/goals/${goalId}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: data.amount }),
            })

            if (!response.ok) {
                if (response.status === 400) {
                    const { error } = await response.json()
                    throw new Error(error || "Falha ao realizar a transação")
                }
                throw new Error("Falha ao realizar a transação")
            }

            reset()
            onOpenChange(false)
            onSuccess() // Atualiza a lista de metas
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ocorreu um erro")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Transação</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleSaveTransaction)} className="space-y-4">
                    <div>
                        <Input
                            autoComplete="new-password"
                            {...register("amount")}
                            type="number"
                            placeholder="Valor da transação"
                            className={errors.amount ? "border-destructive" : ""}
                        />
                        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Salvando..." : "Salvar Transação"}
                    </Button>
                </form>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </DialogContent>
        </Dialog>
    )
}
