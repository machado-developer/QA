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

const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  type: z.enum(["RECEITA", "DESPESA"], { required_error: "Selecione um tipo" }),
})

type CategoryForm = z.infer<typeof categorySchema>

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  isEditing?: boolean
  category?: ICategory
}

export default function CategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditing = false,
  category,
}: CategoryDialogProps) {
  const [error, setError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  useEffect(() => {
    if (isEditing && category) {
      setValue("name", category.name)
      setValue("type", category.type)
    } else {
      reset()
    }
  }, [isEditing, category, setValue, reset])

  const onSubmit = async (data: CategoryForm) => {
    try {
      const url = isEditing ? `/api/categories/${category?.id}` : "/api/categories"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(isEditing ? "Falha ao atualizar categoria" : "Falha ao criar categoria")
      }

      reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ocorreu um erro")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Categoria" : "Adicionar Nova Categoria"}</DialogTitle>
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
              placeholder="Nome da Categoria"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Select onValueChange={(value) => setValue("type", value as "RECEITA" | "DESPESA")} defaultValue={category?.type}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEITA">Receita</SelectItem>
                <SelectItem value="DESPESA">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Atualizando..." : "Adicionando...") : isEditing ? "Atualizar Categoria" : "Adicionar Categoria"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
