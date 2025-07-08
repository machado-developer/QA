"use client";

import { Suspense, useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/loading";

const userSchema = z.object({
    id: z.string().optional(),
    password: z.string().min(1),
    new_password: z.string().min(6, "A senha nova deve ter pelo menos 6 caracteres"),

});

type UserForm = z.infer<typeof userSchema>;

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    isEditing?: boolean;
    user?: {
        id?: string,
        password?: string;

    };
}

export default function UserDialogSenha({
    open,
    onOpenChange,
    onSuccess,
    isEditing = false,
    user,
}: UserDialogProps) {
    const [error, setError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        control,
    } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: user || {

            password: "",
            new_password: "",
        },
    });


    useEffect(() => {
        if (isEditing && user) {
            reset({ new_password: "", password: "" });
        } else {
            reset({ password: "", new_password: "" });
        }
    }, [isEditing, user, reset]);

    const onSubmit = async (data: UserForm) => {
        console.log("USE PASS", data);

        try {
            const response = await fetch(
                `/api/admin/users/${user?.id}/edit-password`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ocorreu um erro desconhecido");
            }

            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ocorreu um erro");
        }
    };

    console.log("RECEBIDO O USER", user);


    return (
        <Suspense fallback={<Loading />}>
            <Dialog open={open} onOpenChange={onOpenChange} >

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            Senha
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Input
                            autoComplete="new-passworddd"
                            type="password"
                            placeholder="Senha"
                            {...register("password")}
                            className={errors.password ? "border-destructive" : ""}
                        />
                        <Input
                            autoComplete="new-passwordd"
                            type="password"
                            placeholder="Senha Nova"
                            {...register("new_password")}
                            className={errors.new_password ? "border-destructive" : ""}
                        />

                        <Button type="submit" className="w-full bg-blue-600 text-white" disabled={isSubmitting}>
                            {isSubmitting
                                ? isEditing
                                && "Atualizando..."

                                : isEditing
                                && "Atualizar"
                            }
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Suspense>
    );
}
