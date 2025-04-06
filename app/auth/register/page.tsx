"use client"

import HeaderNonAuth from '@/components/header-non-auth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState("")
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      router.push("/auth/login")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }
  }

  return (
    <Card className="w-full max-w-md border-0">

      <CardHeader className="space-y-1">
        <motion.h1
          className="text-2xl font-bold tracking-tight text-gradient-to-r from-green-600 to-green-800"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Registre-se agora
        </motion.h1>
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Se registe para ter acesso a todos os
          recursos da plataforma
        </motion.p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col justify-between">
        <CardContent className="space-y-4 flex-grow">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Input
              placeholder="Nome"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-green-800 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline ">
              Iniciar sessão
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
