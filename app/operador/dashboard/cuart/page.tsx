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
import CourtAvailabilityDialog from "@/components/quadra-avaliability-dialog"
import CourtImagesDialog from "@/components/quadra-images-dialog"

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
  availabilities?: [{
    id: string;
    courtId: string;
    userId: string | null;
    startTime: string;
    date: string;
    period: string;
    endTime: string;
  }];
  courtImages?: string[]
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
    category?: [{
      name: string,
      id: string
    }]
  }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedQuadra, setSelectedQuadra] = useState<Quadra | undefined>(undefined);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedQuadraId, setSelectedQuadraId] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [openAvaliability, setOpenAvaliability] = useState(false);
  const [openImagem, setOpenImagem] = useState(false);
  const [court, setCourt] = useState<Quadra | null>(null);
  const [error, setError] = useState("");

  const handleOpenAvailability = (quadra: Quadra) => {
    setCourt(quadra);
    setOpenAvaliability(true);
  };

  const handleOpenImagem = (quadra: Quadra) => {
    setCourt(quadra);
    setOpenImagem(true);
  };
  const handleSaveAvailability = async (courtId: string, newAvailability: any[]) => {
    try {
      const response = await fetch(`/api/admin/courts/${courtId}/availiabilities`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAvailability),
      });
      const resJson = await response.json()

      if (response.ok) {
        console.log("availabilities atualizadas com sucesso.");
        setOpenAvaliability(false)
        fetchQuadras(); // Atualiza a lista de quadras
      } if (!response.ok) {
        // Se o backend enviou erros detalhados, exiba
        if (resJson.issues) {
          // Pode mapear as issues para mensagens amigáveis
          const messages = resJson.issues.map((issue: any) => `${issue.path.join(".")}: ${issue.message}`);
          setError(messages.join(" | "));
        } else if (resJson.message) {
          setError(resJson.message);
        } else {
          setError("Erro desconhecido ao salvar.");
        }
        return;
      }

    } catch (error) {
      console.error("Erro ao salvar availabilities:", error);
    }
  };

  const handleSaveImagens = async (courtId?: string, newImages?: File[]) => {
    try {
      if (courtId && newImages) {
        const response = await fetch(`/api/admin/courts/${courtId}/images`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courtImages: newImages }),
        });
        if (response.ok) {
          console.log("imagens atualizadas com sucesso.");
          fetchQuadras(); // Atualiza a lista de quadras
        } else {
          console.error("Erro ao atualizar imagens.");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar imagens:", error);
    }
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
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
  const [courtImages, setCourtImages] = useState<string[]>(court?.courtImages ?? []);

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
    if (statusFilter && statusFilter !== "todos(as)" && !quadra.category?.some((category) => category.id === statusFilter)) {
      return false;
    }
    return true;
  });

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
          {/* <Input
            autoComplete="new-password" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" />
          <Input
            autoComplete="new-password" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" /> */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos(as)">All</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="shadow-none border-1">

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>

                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço por Hora</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuadras.map((quadra) => (
                <TableRow key={quadra.id}>

                  <TableCell>{quadra.name}</TableCell>
                  <TableCell>{quadra.address}</TableCell>
                  <TableCell>{quadra.city}</TableCell>
                  <TableCell>
                    {quadra?.category?.map((category) => (
                      <span key={category.id}>
                        {category.name}
                      </span>
                    ))}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenAvailability(quadra)}>
                          <Plus className="w-4 h-4 mr-2 text-blue-500" /> Disponibilidade
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenImagem(quadra)}>
                          <Plus className="w-4 h-4 mr-2 text-blue-500" /> Imagens
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
      {court && (
        <CourtAvailabilityDialog
          error={error}
          setError={setError}
          open={openAvaliability}
          onOpenChange={setOpenAvaliability}
          courtId={court.id!}
          initialAvailability={court.availabilities || []}
          onSave={(newAvailability) => handleSaveAvailability(court.id!, newAvailability)}
        />
      )}

      {court && (
        <CourtImagesDialog
          open={openImagem}
          onOpenChange={setOpenImagem}
          courtId={court?.id}
          initialImages={court.courtImages
            ? (typeof court.courtImages[0] === "string"
              ? court.courtImages
              : court.courtImages.map((img: any) => img.url))
            : []}
          onSave={(newImages) => handleSaveImagens(court.id, newImages)}
        />
      )}
      <QuadraDialog
        court={
          selectedQuadra
            ? {
                ...selectedQuadra,
                categoryId: selectedQuadra.categoryId ?? "",
              }
            : undefined
        }
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        onSuccess={fetchQuadras}
      />
    </div>
  )
}
