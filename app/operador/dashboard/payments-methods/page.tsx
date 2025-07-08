"use client"

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, Edit, MoreVertical, Plus, Trash } from "lucide-react";
import PaymentMethodDialog, { Ipaymenthods } from "@/components/payment-method-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Loading from "@/loading";

const PaymentMethodsPage = () => {
    const [methods, setmethods] = useState<Ipaymenthods[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Ipaymenthods | undefined>(undefined);

    useEffect(() => {
        fetchmethods();
    }, []);

    const fetchmethods = async () => {
        try {
            const response = await fetch("/api/payments-methods");
            const data = await response.json();
            setmethods(data.methods);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    };
    const handleEdit = (category: Ipaymenthods): void => {
        setSelectedTransaction(category);
        setIsEditing(true);
        setIsDialogOpen(true);
    };
    const handleDelete = async (methods: Ipaymenthods): Promise<void> => {
        if (window.confirm(`Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.`)) {
            try {
                await fetch(`/api/payments-methods/${methods.id}`, { method: "DELETE" });
                fetchmethods();
            } catch (error) {
                console.error("Erro ao excluir transação:", error);
            }
        }
    };
    return (

        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Lista dos métodos de pagamento</h1>
                    <p className="text-gray-600">Aqui você pode visualizar todos os métodos de pagamento.</p>
                </div>
                <Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Criar novo método
                </Button>
            </div>
            <hr></hr>
            <Card className=" border-1">

                <CardContent>
                    <Suspense fallback={<Loading></Loading>}>
                        <Table>
                            <TableHeader>
                                <TableRow>

                                    <TableHead>Nome</TableHead>

                                    <TableHead>Acções</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {methods.map((meth, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{meth.name}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(meth)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(meth)}>
                                                        <Trash className="w-4 h-4 mr-2 text-red-500" /> Excluir
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
                <PaymentMethodDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    isEditing={isEditing}
                    paymenthods={selectedTransaction}
                    onSuccess={fetchmethods}
                />
            </Suspense>
        </div>
    );
};

export default PaymentMethodsPage;
