"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"



const paymentmethodSchema = z.object({
  name: z.string().min(1, "O nome da método de pagamento é obrigatório"),
})

type MethodForm = z.infer<typeof paymentmethodSchema>

export interface Ipaymenthods {
  id: string
  name: string
  createdAt?: string
}
interface PaymentMethodsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  isEditing?: boolean
  paymenthods?: Ipaymenthods
}

export default function paymenthodsDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  paymenthods,
}: PaymentMethodsDialogProps) {
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MethodForm>({
    resolver: zodResolver(paymentmethodSchema),
  })

  useEffect(() => {
    if (isEditing && paymenthods) {
      setValue("name", paymenthods.name)

    } else {
      reset()
    }
  }, [isEditing, paymenthods, setValue, reset])

  const onSubmit = async (data: MethodForm) => {
    try {
      const url = isEditing ? `/api/payments-methods/${paymenthods?.id}` : "/api/payments-methods"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(isEditing ? "Falha ao atualizar método de pagamento" : "Falha ao criar método de pagamento")
      }

      reset()
      setError("")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    }

  }

  useEffect(() => {
      
      setError("")
    }, [open])
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar método de pagamento" : "Adicionar Nova método de pagamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              autoComplete="new-password"
              placeholder="Nome da método de pagamento"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Atualizando..." : "Adicionando...") : isEditing ? "Atualizar método de pagamento" : "Adicionar método de pagamento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
