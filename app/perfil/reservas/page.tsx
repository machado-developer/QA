"use client";
import { useState, useEffect } from "react";
import { Plus, ArrowUpCircle, ArrowDownCircle, MoreVertical, Edit, Trash, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "react-day-picker";

export default function ReservasPage() {
    const [reservas, setreservas] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const fetchReservas = async () => {
        // Fetch reservas from your API or database
        const response = await fetch("/api/reservas");
        const data = await response.json();
        setreservas(data);
    };


    const handleDelete = async (reserva: { id: string }) => {
        // Delete reserva logic
        await fetch(`/api/reservas/${reserva.id}`, { method: "DELETE" });
        fetchReservas();
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    return (
        <div className="space-y-6">


            <Card className="shadow-md border-1">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Minhas reservas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                               
                                <TableHead>Tipo</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Quadra</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservas.map((reserva, index) => (
                                <TableRow key={index}>
                                    {/* <TableCell>{reserva.quadra.nome}</TableCell>
                                        <TableCell className="flex items-center gap-2">
                                            {reserva.status === "RECEITA" ? (
                                                <ArrowUpCircle className="text-green-500 w-5 h-5" />
                                            ) : (
                                                <ArrowDownCircle className="text-red-500 w-5 h-5" />
                                            )}
                                            {reserva.type}
                                        </TableCell> */}
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">

                                                <DropdownMenuItem onClick={() => handleDelete(reserva)}>
                                                    <Trash className="w-4 h-4 mr-2 text-red-500" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}