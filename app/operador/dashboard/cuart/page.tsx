"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, MoreVertical } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import QuadraDialog from "@/components/quadra-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Quadra {
  id?: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  pricePerHour: number;
  featuredImage: string;
  categoryId?: string;
  user?: { name: string };
  disponibilidades?: any[]; // se tiver
}

export default function QuadrasPage() {
  useSession()
  const [quadras, setQuadras] = useState<{
    id?: string;
    name: string;
    address: string;
    city: string;
    description?: string;
    pricePerHour: number;
    featuredImage: string;
    categoryId?: string;
    user?: { name: string };
  }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | undefined>(undefined);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedQuadraId, setSelectedQuadraId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchQuadras()
  }, [])

  const fetchQuadras = async () => {
    try {
      const response = await fetch("/api/admin/courts")
      const data = await response.json()
      console.log("Quadras data:", data)

      setQuadras(data.courts || [])
    } catch (error) {
      console.error("Error fetching quadras:", error)

    }
  }

  const handleEdit = (quadra: Quadra): void => {
    setSelectedQuadra(quadra);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (quadraId: string) => {
    if (window.confirm("Are you sure you want to delete this quadra? This action cannot be undone.")) {
      try {
        await fetch(`/api/admin/courts/${quadraId}`, { method: "DELETE" })
        fetchQuadras()
      } catch (error) {
        console.error("Error deleting quadra:", error)
      }
    }
  }

  const filteredQuadras = quadras.filter((quadra) => {
    // const progress = (quadra.savedAmount / quadra.targetAmount) * 100
    // const isCompleted = progress >= 100
    // const quadraDate = new Date(quadra.deadline)

    // if (startDate && quadraDate < new Date(startDate)) return false
    // if (endDate && quadraDate > new Date(endDate)) return false
    // if (statusFilter === "completed" && !isCompleted) return false
    // if (statusFilter === "pending" && isCompleted) return false

    return true
  })

  return (
    <div className="space-y-6">


      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lista das quadras</h1>
          <p className="text-gray-600">Aqui você pode visualizar todas quadras</p>
        </div>

        <Button className="bg-blue-600 text-white" onClick={() => { setIsEditing(false); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Quadra
        </Button>
      </div>
      <hr className="border-gray-300" />

      {/*  */}
      <Card className="shadow-none border-1 p-4">
        <div className="flex gap-4 mb-4">
          <Input
            autoComplete="new-password" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
          <Input
            autoComplete="new-password" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-none border-1">

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Preço por Hora</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuadras.map((quadra) => (
                <TableRow key={quadra.id}>
                  <TableCell>{quadra?.user?.name || "N/A"}</TableCell>
                  <TableCell>{quadra.name}</TableCell>
                  <TableCell>{quadra.address}</TableCell>
                  <TableCell>{quadra.city}</TableCell>
                  <TableCell>{formatCurrency(quadra.pricePerHour)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(quadra)}>
                          <Edit className="w-4 h-4 mr-2 text-green-500" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => quadra?.id && handleDelete(quadra.id)}>
                          <Trash className="w-4 h-4 mr-2 text-red-500" /> Deletar
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
      {/* {selectedQuadraId && (
        <QuadraDialog
          open={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
          quadraId={selectedQuadraId}
          onSuccess={fetchQuadras}
        />
      )} */}

      <QuadraDialog court={selectedQuadra} open={isDialogOpen} onOpenChange={setIsDialogOpen} isEditing={isEditing} onSuccess={fetchQuadras} />
    </div>
  )
}
