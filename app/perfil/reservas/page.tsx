"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, MoreVertical } from "lucide-react"
import { formatCurrency, formatDate, formatTimeToLocal } from "@/lib/utils"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReservaModal from "@/components/reservaModal"
import BookingDialog from "@/components/booking-dialog"
import { Booking } from "@prisma/client"





interface Reserva {
    id?: string;
    user?: { name: string, id?: string };
    court: { name: string, pricePerHour: number };
    availability: { startTime: string; endTime: string; date: string };
    status: "PENDENTE" | "CONFIRMADO" | "CANCELADO"
}

export default function reservasPage() {
    useSession()

    const [reservas, setReservas] = useState<Reserva[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [selectedreserva, setSelectedReserva] = useState<Reserva | undefined>(undefined)
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
    const [selectedreservaId, setSelectedReservaId] = useState<string | undefined>()

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

    const handleCancelar = async (reservaId: string) => {
        const confirm = window.confirm("Tem certeza que deseja cancelar  esta reserva? Esta ação é irreversível.")
        if (!confirm) return

        try {
            await fetch(`/api/bookings/${reservaId}`, { method: "DELETE" })
            fetchReservas()
        } catch (error) {
            console.error("Erro ao deletar reserva:", error)
        }
    }

    const reservasFiltradas = reservas.filter((reserva) => {
        const dataReserva = new Date(reserva.availability.date).toISOString().split("T")[0]

        const dentroDoIntervalo = (!startTime || dataReserva >= startTime) &&
            (!endTime || dataReserva <= endTime)

        const statusValido = statusFilter === "" || statusFilter === "all" || reserva.status === statusFilter

        return dentroDoIntervalo && statusValido
    })


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
                            <SelectItem value="PAGO">Pago</SelectItem>
                            <SelectItem value="AGUARDANDO_PAGAMENTO">Aguardando pagamento</SelectItem>
                            <SelectItem value="CANCELADO">Cancelado</SelectItem>
                            <SelectItem value="CONCLUIDO">Concluído</SelectItem>
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
                                                <DropdownMenuItem onClick={() => handleEdit(reserva as unknown as Reserva)}>
                                                    <Edit className="w-4 h-4 mr-2 text-green-500" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => reserva?.id && handleCancelar(reserva.id)}>
                                                    <Trash className="w-4 h-4 mr-2 text-red-500" /> cancelar
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

            <BookingDialog
                open={isBookingDialogOpen}
                onOpenChange={setIsBookingDialogOpen}
                booking={selectedreserva}
                onSuccess={fetchReservas}
            />
        </div>
    )
}
