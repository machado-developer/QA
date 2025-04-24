"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownCircle, ArrowUpCircle, Edit, MoreVertical, Plus, Trash } from "lucide-react";
import CategoryDialog, { ICategory } from "@/components/category-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const CategoriesPage = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<ICategory | undefined>(undefined);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("/api/admin/categories");
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    };
    const handleEdit = (category: ICategory): void => {
        setSelectedTransaction(category);
        setIsEditing(true);
        setIsDialogOpen(true);
    };
    const handleDelete = async (categories: ICategory): Promise<void> => {
        if (window.confirm(`Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.`)) {
            try {
                await fetch(`/api/admin/categories/${categories.id}`, { method: "DELETE" });
                fetchCategories();
            } catch (error) {
                console.error("Erro ao excluir transação:", error);
            }
        }
    };
    return (
        <div className="space-y-6">



            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Lista das categorias</h1>
                    <p className="text-gray-600">Aqui você pode visualizar todas as categorias.</p>
                </div>
                <Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Criar nova Categoria
                </Button>
            </div>
            <hr></hr>
            <Card className=" border-1">

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                
                                <TableHead>Nome</TableHead>

                                <TableHead>Acções</TableHead>

                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={index}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(category)}>
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

            <CategoryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                isEditing={isEditing}
                category={selectedTransaction}
                onSuccess={fetchCategories}
            />
        </div>
    );
};

export default CategoriesPage;
