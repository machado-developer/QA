'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import PaymentDialog from '@/components/payment-dialog';

export default function PagamentoPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

    useEffect(() => {
        fetchPagamentos()
    }, [])

    const fetchPagamentos = async () => {
        try {
            const response = await fetch("/api/payments")
            const data = await response.json()
         

            setPayments(data.payments || [])
        } catch (error) {
            console.error("Error fetching payments:", error)

        }
    }

    const handleEdit = (payment: any) => {
        setSelectedPayment(payment);
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleSuccess = (newPayment: any) => {
        setIsDialogOpen(false);
        setSelectedPayment(null);
        setIsEditing(false);

        // Atualiza a lista de pagamentos
        if (isEditing) {
            setPayments((prev) =>
                prev.map((p) => (p.id === newPayment.id ? newPayment : p))
            );
        } else {
            setPayments((prev) => [...prev, newPayment]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Lista de pagamentos</h1>
                    <p className="text-gray-600">Aqui você pode visualizar todos os pagamentos realizados</p>
                </div>

                <Button
                    className="bg-blue-600 text-white"
                    onClick={() => {
                        setSelectedPayment(null);
                        setIsEditing(false);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Registrar novo pagamento
                </Button>
            </div>

            <hr className="border-gray-300" />

            <Card className="shadow-none border-1">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Funcionário</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((pagamento) => (
                                <TableRow key={pagamento.id}>
                                    <TableCell>{pagamento?.cliente || "N/A"}</TableCell>
                                    <TableCell>{pagamento?.funcionario || "N/A"}</TableCell>
                                    <TableCell>{formatCurrency(pagamento?.total)}</TableCell>
                                    <TableCell>{new Date(pagamento?.data).toLocaleDateString() || "N/A"}</TableCell>
                                    <TableCell>{pagamento?.status || "PENDENTE"}</TableCell>
                                    <TableCell>{pagamento?.method?.name || "N/A"}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(pagamento)}>
                                                    <Edit className="w-4 h-4 mr-2 text-green-500" /> Ver / Editar
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

            <PaymentDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                payment={selectedPayment}
                isEditing={isEditing}
                onSuccess={
                    fetchPagamentos
                }
            />
        </div>
    );
}
