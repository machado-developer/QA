"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, MoreVertical, TimerIcon } from "lucide-react"
import { formatarDisponibilidade, formatCurrency, formatDate, formatTimeToLocal } from "@/lib/utils"

import { jsPDF } from "jspdf";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReservaModal from "@/components/reservaModal"
import BookingDialog from "@/components/booking-dialog"
import { useRouter } from "next/navigation"
import { format } from "path"
import { logo } from "@/app/assets/image/logo"
import autoTable from "jspdf-autotable"


export default function reservasPage() {
    useSession()
    const handleConfirmarReserva = async (reservaId: string) => {
        const confirm = window.confirm("Tem certeza que deseja confirmar esta reserva? Após confirmação, o comprovante será gerado.")
        if (!confirm) return;

        try {
            // Atualizando o status para "CONFIRMADO"
            const response = await fetch(`/api/bookings/${reservaId}`, {
                method: "PUT", // ou PATCH dependendo da API
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: "CONFIRMADO" })
            });

            if (response.ok) {
                setIsconclude((prev) => prev = true)
                // Buscar as reservas novamente após confirmação
                fetchReservas();

                // Gerar o comprovante após confirmação
                const reservaConfirmada = reservas.find((reserva) => reserva.id === reservaId);
                if (reservaConfirmada) {
                    exportBookingToPDF(reservaConfirmada); // Gerar o comprovante em PDF
                }
            }
        } catch (error) {
            console.error("Erro ao confirmar reserva:", error);
        }
    };

    const [reservas, setReservas] = useState<Reserva[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedreserva, setSelectedReserva] = useState<Reserva | undefined>(undefined)
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
    const [selectedreservaId, setSelectedReservaId] = useState<string | undefined>()
    const { data: session, status } = useSession();

    const router = useRouter();


    useEffect(() => {
        const perfil = session?.user.role
        console.log("PERFIL LOG", perfil);

        if (perfil === "ADMINISTRADOR") {
            router.push("/dashboard/admin")
        }
    }, [])
    useEffect(() => {
        fetchReservas()
    }, [])

    const fetchReservas = async () => {
        try {
            const response = await fetch("/api/bookings/cliente")
            const data = await response.json()

            setReservas(data.bookings || [])
        } catch (error) {
            console.error("Erro ao buscar reservas:", error)
        }
    }

    const handleEdit = (reserva: Reserva) => {
        setSelectedReserva(reserva)
        setIsEditing(true)
        setIsDialogOpen(true)
    }
    const [isConclude, setIsconclude] = useState(false)

    const handleCancelar = async (reservaId: string) => {

        try {
            const resd = await fetch(`/api/bookings/${reservaId}`);
            const reservas = await resd.json();
            console.log("RESERVA SELECIONADA", reservas);

            const confirm = window.confirm("Tem certeza que deseja cancelar  esta reserva? Esta ação é irreversível.")
            if (!confirm) return

            // Buscar a reserva para incluir no comprovativo
            const res = await fetch(`/api/bookings/${reservaId}`);
            const reserva = await res.json();
            console.log("RESERVA PARA CANCELAMENTO", reserva);
            

            await fetch(`/api/bookings/${reservaId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "CANCELADO",
                }),
            });

            exportCancelamentoToPDF( {court: reserva.court, availability: reserva.availability, user: reserva.user, status: "CANCELADO", id: reserva.id} as Reserva);
            fetchReservas()
        } catch (error) {
            console.error("Erro ao deletar reserva:", error)
        }
    }

    const handleReagendar = async (quadraId: string) => {
        router.push(`/quadras/${quadraId}`)
    }

    const reservasFiltradas = reservas.filter((reserva) => {
        const dataReserva = new Date(reserva.availability.date).toISOString().split("T")[0]

        const dentroDoIntervalo = (!startTime || dataReserva >= startTime) &&
            (!endTime || dataReserva <= endTime)

        const statusValido = statusFilter === "" || statusFilter === "all" || reserva.status === statusFilter

        return dentroDoIntervalo && statusValido
    })
    
    // Função auxiliar de formatação (certifique-se de que essas estão implementadas)
const formatCurrency = (valor: number) => `${valor.toFixed(2)} Kz`;
      // Removido código inválido relacionado a booking.availability fora de contexto
const exportCancelamentoToPDF = (booking: Reserva) => {
  const doc = new jsPDF();

  console.log("Booking data for PDF:", booking);

  // Logo
  doc.addImage(logo, 'PNG', 14, 10, 30, 30);

  // Cálculos
  const precoBase = booking.court?.pricePerHour || 0;
  const iva = precoBase * 0.14;
  const total = precoBase + iva;
  
    
      const inicio = new Date(`1970-01-01T${booking.availability.startTime}:00`);
      const fim = new Date(`1970-01-01T${booking.availability.endTime}:00`);
      const diffMs = fim.getTime() - inicio.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

  // Cabeçalho da empresa
  doc.setFontSize(12);
  doc.text("QA - Agendamentos de Quadra", 200, 15, { align: "right" });
  doc.text("Tala Tona,", 200, 21, { align: "right" });
  doc.text("NIF: 123456789", 200, 27, { align: "right" });
  doc.text("Tel: 999-999-999", 200, 33, { align: "right" });

  // Título da Fatura
  doc.setFontSize(16);
  doc.text("FATURA DE CANCELAMENTO", 105, 50, { align: "center" });

  // Dados do cliente e da reserva
  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString()} dif:  ${diffHoras}`, 14, 60);
  doc.text(`Nome do Cliente: ${booking.user?.name || "N/A"}`, 14, 68);
  doc.text(`Email: ${booking.user?.email || "N/A"}`, 14, 76);
  doc.text(`Referência da Reserva: XXXXXXXXXXXXXXXXXX`, 14, 84);

  // Tabela com detalhes
  const autoTableResult = autoTable(doc, {
    startY: 95,
    head: [["Quadra", "Descrição", "Status", "Preço Uni", "Preço Total"]],
    body: [[
      booking.court?.name || "N/A",
      formatarDisponibilidade(booking.availability?.startTime, booking.availability?.endTime),
      "CANCELADO",
      formatCurrency(precoBase),
      booking.court.pricePerHour * diffHoras ? formatCurrency(booking.court.pricePerHour * diffHoras) : "0,00 Kz"
    ]],
    foot: [
      ["", "","", "Subtotal:", booking.court.pricePerHour ? formatCurrency(booking.court.pricePerHour) : "0,00 Kz"],
      ["", "","", "IVA :", "0,00 Kz"],
      ["", "","", "Total:", formatCurrency(booking.court.pricePerHour * diffHoras)],
    ],
    footStyles: {
      fontStyle: "bold",
      halign: "right",
    },
    theme: 'grid',
    styles: {
      fontSize: 11,
    },
  });

  // Observações finais
  const finalY = (autoTableResult as any)?.finalY || 120;
  doc.setFontSize(10);
  
    doc.text("Obrigado por escolher a QA - Agendamentos de Quadra!", 14, finalY + 84);


  // Salvar o PDF
  doc.save(`cancelamento_${booking.user?.name || "reserva"}.pdf`);
};


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Lista de Reservas</h1>
                    <p className="text-gray-600">Visualize todas as reservas cadastradas</p>
                </div>
                {/* 
        <Button onClick={() => { setIsEditing(false); setIsDialogOpen(true) }} className="bg-blue-600 text-white">
          <Plus className="mr-2 h-4 w-4" /> Adicionar reserva
        </Button> 
        */}
            </div>

            <hr className="border-gray-300" />

            <Card className="shadow-none border-1 p-4">
                <div className="flex gap-4 mb-4">
                    <Input
                        type="date"
                        autoComplete="off"
                        value={startTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
                        placeholder="Data de início"
                    />
                    <Input
                        type="date"
                        autoComplete="off"
                        value={endTime}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
                        placeholder="Data de fim"
                    />
                    <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>

                        </SelectContent>

                    </Select>
                </div>
            </Card>

            <Card className="shadow-none border-1">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>reserva</TableHead>
                                <TableHead>Horario</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservasFiltradas.map((reserva) => (
                                <TableRow key={reserva.id}>
                                    <TableCell>{reserva.court.name}</TableCell>
                                    <TableCell>{`${formatTimeToLocal(new Date(reserva.availability.startTime))} - ${formatTimeToLocal(new Date(reserva.availability.endTime))}`}</TableCell>
                                    <TableCell>{formatDate(new Date(reserva.availability.date))}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-md font-medium text-sm
                        ${reserva.status === "PENDENTE" ? "bg-yellow-200 text-yellow-800" :
                                                reserva.status === "CONFIRMADO" ? "bg-blue-200 text-blue-800" :
                                                    reserva.status === "CANCELADO" ? "bg-red-200 text-red-800" :
                                                        "bg-green-200 text-green-800"}`}>
                                            {reserva.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatCurrency(reserva.court.pricePerHour)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost">
                                                    <MoreVertical className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {/* <DropdownMenuItem onClick={() => handleEdit(reserva as unknown as Reserva)}>
                                                    <Edit className="w-4 h-4 mr-2 text-green-500" /> Editar
                                                </DropdownMenuItem> */}
                                                {(reserva.status === "CANCELADO" || reserva.status === "CONCLUIDO") ? (
                                                    <DropdownMenuItem onClick={() => {
                                                        if (reserva?.court?.id) handleReagendar(reserva.court.id)
                                                    }} >
                                                        <TimerIcon className="w-4 h-4 mr-2 text-red-500" /> reagendar
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => reserva?.id && handleCancelar(reserva.id)}>
                                                        <Trash className="w-4 h-4 mr-2 text-red-500" /> cancelar
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <BookingDialog
                open={isBookingDialogOpen}

                onOpenChange={setIsBookingDialogOpen}
                booking={selectedreserva}
                onSuccess={fetchReservas}
            />
        </div>
    )
}

const exportBookingToPDF = (booking: Reserva) => {
    const doc = new jsPDF();

    // Logo (opcional - caso tenha a logo da empresa em base64 ou URL)
    // Adapte para a sua logo
    doc.addImage(logo, 'PNG', 14, 10, 30, 30); // (x, y, width, height)
    // Posição da tabela após a inserção
    const tableFinalY = doc.table.length - 1; // Pega a posição final da tabela

    // Informações da empresa
    doc.setFontSize(12);
    // Número da fatura
    doc.text("AQ Agendamento de Quadras", 50, 15);
    doc.text("NIF: 123456789", 50, 22);
    doc.text("Departamento: Finanças", 50, 29);
    doc.text("Contacto: +244 999 999 999 | geral@aq.com", 50, 36);

    // Título da fatura
    doc.setFontSize(16);
    doc.text("Fatura de Pagamento", 14, 50);
    doc.setFontSize(16);
    doc.text("Comprovativo de Agendamento", 14, 50);

    // Dados do cliente
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Cliente: ${booking.user?.name || "N/A"}`, 14, 60);
    doc.text(`Email: ${booking.user?.email || "N/A"}`, 14, 74);

    // Dados do agendamento
    doc.text(`Quadra: ${booking.court?.name || "N/A"}`, 14, 81);
    doc.text(`Data: ${formatDate(new Date(booking.availability?.date || ""))}`, 14, 88);
    doc.text(`Horário: ${booking.availability?.startTime || "N/A"} às ${booking.availability?.endTime || "N/A"}`, 14, 95);
    doc.text(`Status: ${booking.status}`, 14, 102);

    // Preço
    doc.text(`Valor Hora: ${formatCurrency(booking.court?.pricePerHour || 0)}`, 14, 109);

    // Data de emissão
    const date = formatDate(new Date());
    doc.setFontSize(10);
    doc.text(`Emitido em: ${date}`, 14, 116);

    // Salvar PDF
    doc.save(`comprovativo_${booking.user?.name || "reserva"}.pdf`);

};