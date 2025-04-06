"use client"
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HeaderNonAuth from "@/components/header-non-auth";
import Loading from "./loading-password";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "A senha deve ter  no mínimo 6 caracteres"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true); // Para verificar o token antes de mostrar a tela

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const validateToken = useCallback(async () => {
        try {
            const response = await fetch("/api/recovery/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email }),
            });

            if (response.status !== 200) {
                router.push("/recovery-password");
            } else {
                setLoading(false);
            }
        } catch {
            router.push("/recovery-password");
        }
    }, [token, email, router]);

    useEffect(() => {
        if (!token || !email) {
            router.push("/recovery-password");
        } else {
            validateToken();
        }
    }, [validateToken, token, email, router]);

    const onSubmit = async (data: ResetPasswordForm) => {
        try {
            const response = await fetch("/api/recovery/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, email, password: data.password }),
            });

            if (!response.ok) {
                throw new Error("Erro ao redefinir a senha");
            }

            setSuccess(true);
            setTimeout(() => router.push("/auth/login"), 2000);
        } catch (err) {
            setError("Não foi possível redefinir a senha. Tente novamente.");
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (

        <Card className="w-full max-w-md border-0">

            <CardHeader>
                <h2 className=" text-2xl font-bold text-center">Redefinir Senha</h2>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert variant="default">
                            <AlertDescription>Senha redefinida com sucesso!</AlertDescription>
                        </Alert>
                    )}
                    <div>
                        <Input
                            type="password"
                            placeholder="Nova senha"
                            {...register("password")}
                            className={errors.password ? "border-destructive" : ""}
                        />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <div>
                        <Input
                            type="password"
                            placeholder="Confirmar senha"
                            {...register("confirmPassword")}
                            className={errors.confirmPassword ? "border-destructive" : ""}
                        />
                        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
                    </Button>
                </CardFooter>
            </form>
        </Card>

    );
}