"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatHour } from "@/lib/utils";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";
import { logo } from "@/app/assets/image/logo";
import Loading from "@/loading";

const UserLogPage = () => {
    const [logs, setLogs] = useState<UserLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<UserLog[]>([]);
    const [searchAction, setSearchAction] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await fetch("/api/user-logs");
            const data = await response.json();
            setLogs(data.logs);
        } catch (error) {
            console.error("Erro ao buscar logs dos usuários:", error);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    interface UserLog {
        id: string;
        action: string;
        details: string;
        createdAt: string;
        user: {
            name: string;
        };
    }

    const applyFilters = useCallback(() => {
        let filtered = logs;

        if (searchAction) {
            filtered = filtered.filter(log =>
                log.action.toLowerCase().includes(searchAction.toLowerCase())
            );
        }

        if (selectedUser) {
            filtered = filtered.filter(log => log.user.name === selectedUser);
        }

        if (selectedDate) {
            filtered = filtered.filter(log =>
                formatDate(new Date(log.createdAt)) === selectedDate
            );
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [logs, searchAction, selectedUser, selectedDate]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const handleDelete = async (log: UserLog): Promise<void> => {
        if (window.confirm(`Tem certeza que deseja excluir este log? Essa ação não pode ser desfeita.`)) {
            try {
                await fetch(`/api/user-logs/${log.id}`, { method: "DELETE" });
                fetchLogs();
            } catch (error) {
                console.error("Erro ao excluir log:", error);
            }
        }
    };

    const exportToCSV = () => {
        const csv = Papa.unparse(filteredLogs.map(log => ({
            Ação: log.action,
            Detalhe: log.details,
            Usuário: log.user.name,
            Data: formatDate(new Date(log.createdAt)),
            Hora: formatHour(new Date(log.createdAt))
        })));

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "logs.csv";
        link.click();
    };



    const exportToPDF = () => {
        const doc = new jsPDF();

        // Adicionando a logo (base64 ou URL)


        doc.addImage(logo, 'PNG', 14, 10, 30, 30); // (x, y, width, height)

        // Cabeçalho de texto
        doc.setFontSize(12);
        doc.text("AQ Agendamento  de Quadras", 50, 15);
        doc.text("NIF: 123456789", 50, 22);
        doc.text("Departamento: Administração", 50, 29);
        doc.text("Contacto: +244 999 999 999 | geral@aq.com", 50, 36);

        // Título da Tabela
        doc.setFontSize(14);
        doc.text("CONTROLO DE AUDITORIA  E INSPEÇÃO DE ACTIVIDADE", 14, 50);

        // Tabela
        autoTable(doc, {
            startY: 55, // Início abaixo do cabeçalho
            head: [["Ação", "Detalhe", "Usuário", "Data", "Hora"]],
            body: filteredLogs.map(log => [
                log.action,
                log.details,
                log.user.name,
                formatDate(new Date(log.createdAt)),
                formatHour(new Date(log.createdAt))
            ])
        });

        doc.save("logs.pdf");
    };


    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);


    return (
        <Suspense fallback={<Loading />}>

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">Auditória </h1>
            <p className="text-gray-600">Aqui você pode visualizar as operções realizadas pelos os usuários e gerar um relatorio em pdf.</p>

            <hr className="border-gray-300" />
            <h2 className="text-2xl font-light">Operações realizadas</h2>

            {/* Filtros */}
            <div className="flex justify-between mb-4">
                <div className="flex space-x-4">
                    <Input
                        placeholder="Filtrar por ação..."
                        value={searchAction}
                        onChange={(e) => setSearchAction(e.target.value)}
                        className="w-1/3"
                        />
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-1/4"
                    />
                    <Button className="bg-gray-600  hover:bg-gray-500" onClick={() => {
                        setSearchAction("");
                        setSelectedUser("");
                        setSelectedDate("");
                    }}>
                        Limpar
                    </Button>
                </div>
                <div className="flex space-x-2">

                    <Button className="bg-blue-600 hover:bg-blue-500" onClick={exportToPDF}><Download></Download> Exportar PDF</Button>
                </div>
            </div>
            <hr>
            </hr>

            <Card className="shadow-md border-1">

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ação</TableHead>
                                <TableHead>Detalhe</TableHead>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Hora</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentLogs.map((log, index) => (
                                <TableRow
                                    key={index}
                                    className={index % 2 === 0 ? "bg-blue-100" : "bg-gray-100"}
                                    >
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                    <TableCell>{log.user.name}</TableCell>
                                    <TableCell>{formatDate(new Date(log.createdAt))}</TableCell>
                                    <TableCell>{formatHour(new Date(log.createdAt))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Controles de Paginação */}
            <div className="flex justify-center space-x-2 mt-4">
                <Button className="bg-blue-600" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Anterior</Button>
                <span>Página {currentPage} de {totalPages}</span>
                <Button className="bg-blue-600" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Próximo</Button>
            </div>
        </div>
                            </Suspense>
    );
};

export default UserLogPage;