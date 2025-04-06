"use client";

import HeaderNonAuth from '@/components/header-non-auth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from 'framer-motion';
import { signIn } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import goalImage from "@/app/assets/image/goal.svg";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError("Email ou senha incorretos");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  };

  return (

    <Card className="w-full max-w-md border-0">

      <CardHeader className="space-y-1">
        <motion.h1 className="text-3xl md:text-4xl font-extrabold" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Entrar
        </motion.h1>
        <motion.p className="text-sm md:text-base text-muted-foreground" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          Insira suas credenciais para acessar sua conta
        </motion.p>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <Input type="email" placeholder="Email" {...register("email")} className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          <Input type="password" placeholder="Senha" {...register("password")} className={errors.password ? "border-destructive" : ""} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-green-800 hover:bg-green-700" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</Button>
          <p className="text-sm text-center text-muted-foreground">
            Não tem uma conta? <Link href="/auth//register" className="text-primary hover:underline">Cadastre-se</Link>
          </p>
          <p className="text-sm text-center text-muted-foreground">
            <Link href="/auth/recovery-password" className="text-primary hover:underline">Esqueceu a senha?</Link>
          </p>
        </CardFooter>
      </form>
    </Card>

  );
}
