"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreVertical, Edit, Trash } from "lucide-react";
import UserDialog from "@/components/user-dialog";
import UserDialogSenha from "@/components/user-dialog-senha";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Loading from "@/loading";
import { FaClosedCaptioning } from "react-icons/fa";
import { withRole } from "@/components/withRole";

const UserRegistrationPage = () => {
    const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id?: string; name: string; email: string; password?: string; role: "ADMINISTRADOR" | "CLIENTE" | "OPERADOR" } | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    const [isDialogOpenSenha, setIsDialogOpenSenha] = useState(false);
    const [selectedUserSenha, setSelectedUserSenha] = useState<{ id?: string; password?: string; } | undefined>(undefined);
    const [isEditingSenha, setIsEditingSenha] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
            const data = await response.json();
            setUsers(data.users);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        }
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsEditing(true);
        setIsDialogOpen(true);
    };
    const handleEditSenha = (user: any) => {
        setSelectedUserSenha(user);
        setIsEditingSenha(true);
        setIsDialogOpenSenha(true);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
            try {
                await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
                fetchUsers();
            } catch (error) {
                console.error("Erro ao excluir usuário:", error);
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Suspense fallback={<Loading></Loading>}>
            <div className="space-y-6">
                <p className="text-gray-600">Aqui você pode visualizar todos os usuarios do sistema.</p>
                <h1 className="text-3xl font-bold">Lista dos Usuários</h1>

                <hr className="border-gray-300" />
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-light">Usuários</h2>
                    <Button className="bg-blue-600 text-white" onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Usuário
                    </Button>
                </div>
                <hr></hr>
                <Card className="shadow-md border-1">
                    <CardHeader>

                        <p className="text-sm text-gray-500">Lista de usuários cadastrados no sistema.</p>
                    </CardHeader>
                    <CardContent>
                        <Table className="w-full text-sm text-left text-gray-500 border-0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <Suspense fallback={<Loading></Loading>}>
                                    {currentUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Edit className="w-4 h-4 mr-2" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(user.id)}>
                                                            <Trash className="w-4 h-4 mr-2 text-red-500" /> Excluir
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditSenha(user)}>
                                                            <FaClosedCaptioning className="w-4 h-4 mr-2 text-red-500" /> Alterar senha
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </Suspense>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center mt-4">
                    <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        Anterior
                    </Button>
                    <span>Página {currentPage} de {Math.ceil(users.length / itemsPerPage)}</span>
                    <Button disabled={currentPage >= Math.ceil(users.length / itemsPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>
                        Próximo
                    </Button>
                </div>
            </div>
            <Suspense fallback={<Loading />}>
                <UserDialog
                    open={isDialogOpen}
                    isEditing={isEditing}
                    user={selectedUser || undefined}
                    onOpenChange={setIsDialogOpen}
                    onSuccess={() => {
                        fetchUsers();
                        setIsDialogOpen(false);
                    }}
                />
                <UserDialogSenha
                    open={isDialogOpenSenha}
                    isEditing={isEditingSenha}
                    user={selectedUserSenha || undefined}
                    onOpenChange={setIsDialogOpenSenha}
                    onSuccess={() => {
                        fetchUsers();
                        setIsDialogOpenSenha(false);
                    }}
                />
            </Suspense>
        </Suspense>
    );
};

export default withRole(UserRegistrationPage, ["administrador"])
