"use client";

import { useState, useEffect, Suspense } from "react";
import { format, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";
import Loading from "@/loading";

interface Availability {
    date: string;
    startTime: string;
    endTime: string;
}

interface CourtAvailabilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courtId: string;
    initialAvailability?: Availability[];
    onSave: (availabilities: Availability[]) => void;
    error: string;
    setError: (error: string) => void;
}

const today = format(new Date(), "yyyy-MM-dd");

export default function CourtAvailabilityDialog({
    open,
    onOpenChange,
    courtId,
    initialAvailability = [],
    onSave,
    error,
    setError,
}: CourtAvailabilityDialogProps) {
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [newDate, setNewDate] = useState("");
    const [newStartTime, setNewStartTime] = useState("");
    const [newEndTime, setNewEndTime] = useState("");

    useEffect(() => {
        if (open) {
            const formatted = initialAvailability.map((slot) => ({
                date: format(parseISO(slot.date), "yyyy-MM-dd"),
                startTime: format(parseISO(slot.startTime), "HH:mm"),
                endTime: format(parseISO(slot.endTime), "HH:mm"),
            }));
            setAvailability(formatted);
            setError("");
        } else {
            // reset on close
            setAvailability([]);
            setNewDate("");
            setNewStartTime("");
            setNewEndTime("");
            setError("");
        }
    }, [open, initialAvailability]);

    const removeAvailability = (index: number) => {
        setAvailability((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value < today) {
            const msg = "A data não pode estar no passado.";
            toast.error(msg);
            setError(msg);
            setNewDate("");
            return;
        }
        setError("");
        setNewDate(value);
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (newDate) {
            const now = new Date();
            const selectedDateTime = new Date(`${newDate}T${value}`);
            const minDateTime = new Date(now.getTime() + 90 * 60 * 1000);
            if (selectedDateTime < minDateTime) {
                const msg = "A hora de início deve ser pelo menos 1h30 à frente da hora atual.";
                toast.error(msg);
                setError(msg);
                setNewStartTime("");
                return;
            }
        }
        setError("");
        setNewStartTime(value);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (newDate && newStartTime) {
            const start = new Date(`${newDate}T${newStartTime}`);
            const end = new Date(`${newDate}T${value}`);
            if (end <= start) {
                const msg = "A hora de fim deve ser depois da hora de início.";
                toast.error(msg);
                setError(msg);
                setNewEndTime("");
                return;
            }
        }
        setError("");
        setNewEndTime(value);
    };

    const addAvailability = () => {
        if (!newDate || !newStartTime || !newEndTime) {
            const msg = "Preencha todos os campos de disponibilidade.";
            toast.error(msg);
            setError(msg);
            return;
        }

        const startDateTime = new Date(`${newDate}T${newStartTime}`);
        const endDateTime = new Date(`${newDate}T${newEndTime}`);
        const now = new Date();

        // Validar conflitos
        // Verifica sobreposição
        const hasOverlap = availability.some((slot) => {
            const slotStart = new Date(`${slot.date}T${slot.startTime}`);
            const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
            return slot.date === newDate && startDateTime < slotEnd && endDateTime > slotStart;
        });
        if (hasOverlap) {
            const msg = "Este horário conflita com outro já adicionado.";
            toast.error(msg);
            setError(msg);
            return;
        }

        // Verifica distância mínima de 20 minutos de outros horários
        const hasTooClose = availability.some((slot) => {
            if (slot.date !== newDate) return false;
            const slotStart = new Date(`${slot.date}T${slot.startTime}`);
            const slotEnd = new Date(`${slot.date}T${slot.endTime}`);
            // Verifica se o novo início ou fim está a menos de 20 minutos do início ou fim de outro slot
            const minDiffMs = 20 * 60 * 1000;
            return (
                Math.abs(startDateTime.getTime() - slotEnd.getTime()) < minDiffMs ||
                Math.abs(endDateTime.getTime() - slotStart.getTime()) < minDiffMs
            );
        });
        if (hasTooClose) {
            const msg = "Deve haver pelo menos 20 minutos de intervalo entre horários.";
            toast.error(msg);
            setError(msg);
            return;
        }

        // Duração mínima de 1 hora
        const diffMs = endDateTime.getTime() - startDateTime.getTime();
        if (diffMs < 60 * 60 * 1000) {
            const msg = "A diferença entre início e fim deve ser de pelo menos 1 hora.";
            toast.error(msg);
            setError(msg);
            return;
        }

        // Duplicata exata
        const exists = availability.some(
            (slot) =>
                slot.date === newDate &&
                slot.startTime === newStartTime &&
                slot.endTime === newEndTime
        );
        if (exists) {
            const msg = "Já existe uma disponibilidade com esses dados.";
            toast.error(msg);
            setError(msg);
            return;
        }

        // Adiciona
        setAvailability((prev) => [
            ...prev,
            { date: newDate, startTime: newStartTime, endTime: newEndTime },
        ]);
        setNewDate("");
        setNewStartTime("");
        setNewEndTime("");
        setError("");
    };

    const handleSave = () => {
        onSave(availability);
    };

    return (
        <Suspense fallback={<Loading />}>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Disponibilidades da Quadra</DialogTitle>
                    </DialogHeader>

                    <form className="space-y-4 overflow-y-auto max-h-[80vh]">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                            <Input type="date" min={today} value={newDate} onInput={handleDateChange} />
                            <Input type="time" value={newStartTime} onInput={handleStartTimeChange} />
                            <Input type="time" value={newEndTime} onInput={handleEndTimeChange} />
                            <Button type="button" onClick={addAvailability}>
                                + Adicionar
                            </Button>
                        </div>

                        {availability.length > 0 && (
                            <ul className="mt-4 space-y-1 text-sm">
                                {availability.map((slot, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center text-xs p-4 border-b rounded-md"
                                    >
                                        <span>
                                            {format(new Date(slot.date), "dd/MM/yyyy")} - {slot.startTime} às{" "}
                                            {slot.endTime}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeAvailability(index)}
                                            className="text-red-500 text-xs"
                                        >
                                            Remover
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Button type="button" onClick={handleSave} className="w-full bg-green-600 text-white">
                            Salvar Disponibilidades
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Suspense>
    );
}
