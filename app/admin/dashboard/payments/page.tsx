'use client';

import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import PaymentDialog from '@/components/payment-dialog';
import jsPDF from 'jspdf';
import { logo } from '@/app/assets/image/logo';
import autoTable from 'jspdf-autotable';
import { Money } from 'phosphor-react';
import Link from 'next/link';
import Loading from '@/loading';
import { withRole } from '@/components/withRole';

function PagamentoPage() {
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
            console.error("erro payments:", error)

        }
    }


    const exportToPDF = (payment: any) => {
        const doc = new jsPDF();

        // Logo (opcional - caso tenha a logo da empresa em base64 ou URL)
        // Adapte para a sua logo
        doc.addImage(logo, 'PNG', 14, 10, 30, 30); // (x, y, width, height)
        // Posição da tabela após a inserção
        const tableFinalY = doc.table.length - 1; // Pega a posição final da tabela

        // Informações da empresa
        doc.setFontSize(12);
        // Número da fatura
        doc.text(`Fatura nº ${payment.codigo}`, 14, tableFinalY + 40);
        doc.text("AQ Agendamento de Quadras", 50, 15);
        doc.text("NIF: 123456789", 50, 22);
        doc.text("Departamento: Finanças", 50, 29);
        doc.text("Contacto: +244 999 999 999 | geral@aq.com", 50, 36);

        // Título da fatura
        doc.setFontSize(16);
        doc.text("Fatura de Pagamento", 14, 50);

        // Dados do cliente (supondo que você tenha os dados do pagamento selecionado)
        doc.setFontSize(12);
        doc.text(`Cliente: ${payment.cliente}`, 14, 60);
        doc.text(`Telefone: ${payment.telefone}`, 14, 67);

        // Data de emissão
        const date = new Date().toLocaleDateString();
        doc.text(`Data de Emissão: ${date}`, 14, 81);

        // Tabela com detalhes do pagamento
        const tableBody = [
            [`Reserva de Quadra \n ${payment.booking?.courtId}\n `, "1", formatCurrency(payment.amount), formatCurrency(payment.amount)]
        ];

        autoTable(doc, {
            startY: 90, // Início abaixo do cabeçalho
            head: [["Descrição", "Quantidade", "Preço Unitário", "Total"]],
            body: tableBody,
        });


        // Total
        const totalAmount = payment.amount; // ou calcular o total se precisar
        doc.setFontSize(12);
        doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, tableFinalY + 10);



        // Salvar como PDF
        doc.save(`fatura_${payment.codigo}.pdf`);
    };

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
                <div>
                    <Button asChild variant="outline">
                        <Link href="/admin/dashboard/payments-methods" className="gap-2 mr-4">
                            <Plus className="w-4 h-4" />
                            Métodos
                        </Link>
                    </Button>
                    <Suspense fallback={<Loading></Loading>}>
                        <Button
                            className="bg-blue-600 text-white"
                            onClick={() => {
                                setSelectedPayment(null);
                                setIsEditing(false);
                                setIsDialogOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />  novo pagamento
                        </Button>
                    </Suspense>
                </div>
            </div>

            <hr className="border-gray-300" />

            <Card className="shadow-none border-1">
                <CardContent>
                    <Suspense fallback={<Loading></Loading>}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ref</TableHead>
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

                                        <TableCell>{pagamento?.codigo || "N/A"}</TableCell>
                                        <TableCell>{pagamento?.cliente || "N/A"}</TableCell>
                                        <TableCell>{pagamento?.creatorName || "N/A"}</TableCell>
                                        <TableCell>{formatCurrency(pagamento?.amount)}</TableCell>
                                        <TableCell>{new Date(pagamento?.createdAt).toLocaleDateString() || "N/A"}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-md font-medium text-sm
                        ${pagamento.status === "PENDENTE" ? "bg-yellow-200 text-yellow-800" :
                                                    pagamento.status === "CONCLUIDO" ? "bg-green-200 text-green-800" :
                                                        pagamento.status === "CANCELADO" ? "bg-red-200 text-red-800" :
                                                            "bg-green-200 text-green-800"}`}>
                                                {pagamento.status}
                                            </span>
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => exportToPDF(pagamento)}>
                                                        <Plus className="w-4 h-4 mr-2 text-blue-500" /> Comprovativo
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>

                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Suspense>
                </CardContent>
            </Card>
            <Suspense>
                <PaymentDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    payment={selectedPayment}
                    isEditing={isEditing}
                    onSuccess={
                        fetchPagamentos
                    }
                />
            </Suspense>
        </div>

    );
}

export default withRole(PagamentoPage, ["administrador", "operador"],)