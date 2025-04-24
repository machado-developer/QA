"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash } from "lucide-react";

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
}

export default function CourtAvailabilityDialog({
    open,
    onOpenChange,
    courtId,
    initialAvailability = [],
    onSave,
}: CourtAvailabilityDialogProps) {
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [newDate, setNewDate] = useState("");
    const [newStartTime, setNewStartTime] = useState("");
    const [newEndTime, setNewEndTime] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setAvailability(initialAvailability);
            setError("");
        }
    }, [open, initialAvailability]);

    const addAvailability = () => {
        if (!newDate || !newStartTime || !newEndTime) {
            setError("Todos os campos são obrigatórios.");
            return;
        }

        const startDateTime = new Date(`${newDate}T${newStartTime}`);
        const endDateTime = new Date(`${newDate}T${newEndTime}`);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            setError("Formato de data ou hora inválido.");
            return;
        }

        setAvailability((prev) => [
            ...prev,
            { date: newDate, startTime: newStartTime, endTime: newEndTime },
        ]);

        setNewDate("");
        setNewStartTime("");
        setNewEndTime("");
        setError("");
    };

    const removeAvailability = (index: number) => {
        setAvailability((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(availability);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Disponibilidades da Quadra</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                    />
                    <Input
                        type="time"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                    />
                    <Input
                        type="time"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                    />
                    <Button type="button" onClick={addAvailability} variant="outline">
                        + Adicionar
                    </Button>
                </div>
                {availability.length > 0 && (
                    <ul className="mt-4 space-y-1 text-lg">
                        {availability.map((slot, index) => (
                            <li key={index} className="flex justify-between">
                                <span>
                                {format(new Date(slot.date), "dd/MM/yyyy")} –{" "}
                                {format(new Date(slot.startTime), "HH:mm")}–{format(new Date(slot.endTime), "HH:mm")}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAvailability(index)}
                                    className="text-red-500 text-xs"
                                >
                                   <Trash></Trash>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}


                <Button onClick={handleSave} className="w-full bg-green-600 text-white">
                    Salvar Disponibilidades
                </Button>
            </DialogContent>
        </Dialog>
    );
}
