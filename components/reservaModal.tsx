'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Suspense, useEffect, useState } from 'react'
import clsx from 'clsx'
import { durationInHours, formatarDisponibilidade, formatCurrency, formatDate, formatHour } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Loading from '@/loading'
import toast from 'react-hot-toast'
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf'
import { logo } from "@/app/assets/image/logo";
import QRCode from 'qrcode'
import { Quadra } from '../types/quadra';
import { useSession } from 'next-auth/react'
type Horario = {
  startTime: string
  endTime: string
  id: string
  active: boolean
}

interface ReservaModalProps {
  isOpen: boolean
  onClose: () => void
  quadraId: string
  quadraNome: string
}


export default function ReservaModal({ isOpen, onClose, quadraId, quadraNome }: ReservaModalProps) {
  const router = useRouter()
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [horarioId, setHorarioId] = useState<string>("")
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null)
  const [datasDisponiveis, setDatasDisponiveis] = useState<Date[]>([])
  const [usuario, setUsuario] = useState<{ nome: string, email: string } | null>(null);
  const [quadra, setQuadra] = useState<Quadra | null>(null)
      const { data: session, status } = useSession();
  
  
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUsuario({ nome: data.name, email: data.email || "Usuário" });
        }
      } catch (error) {
        setUsuario(null);
      }
    };
    fetchUsuario();
  }, []);
  const [availabilitySelecionada, setAvailabilitySelecionada] = useState<{
    id: string;
    intervalo: string;
  } | null>(null);
  // Simula busca de horários baseados na data

  
  useEffect(() => {
    if (!dataSelecionada) return

    const dia = dataSelecionada.getDate()

    const fetchDisponibilidades = async () => {
      if (!dataSelecionada || !quadraId) return;

      try {
        const response = await fetch(
          `/api/admin/courts/${quadraId}/availiabilities?date=${dataSelecionada.toISOString()}`
        );

        const data = await response.json();
        setHorarios(data.availabilities);

        setAvailabilitySelecionada(null);
      } catch (error) {
        console.error("Erro ao buscar disponibilidades:", error);
      }
    };

    fetchDisponibilidades();
    setHorarioSelecionado(null)
  }, [dataSelecionada])

  const fetchTodasDisponibilidades = async () => {
    try {
      const response = await fetch(`/api/admin/courts/${quadraId}/availiabilities`);
      const resq = await fetch(`/api/admin/courts/${quadraId}/`)
      const dataquadra = await resq.json()
      setQuadra(dataquadra.court)
      const data = await response.json();

      const agendamentos = data?.availabilities?.filter((d: any) => d?.startTime && d?.endTime);

      // Função para extrair os dias disponíveis

      const datasDisponiveis = getDiasDisponiveis(agendamentos);
      console.log("DAAATA DO MESMO", datasDisponiveis);
      setDatasDisponiveis(datasDisponiveis);
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
    }
  };

  useEffect(() => {
    fetchTodasDisponibilidades()
  }, [isOpen]);

  // Função para buscar o intervalo de horário selecionado
  function buscarIntervaloHorario(horarios: Horario[], horarioSelecionado: string | null) {
    if (!horarioSelecionado) return null;
    const horario = horarios.find(
      h => `${h.startTime} - ${h.endTime}` === horarioSelecionado
    );
    return horario ? `${horario.startTime} - ${horario.endTime}` : null;
  }

  const handleReservar = async () => {

    if (!dataSelecionada || !horarioSelecionado) return;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: quadraId,
          availabilityId: horarioId ?? '',
        }),
      });

      if (response.status === 401) {
        router.push("/auth/login");
        router.refresh();
      }
      if (!response.ok) {
        const err = await response.json();
        toast.error(`Erro: ${err.message}`);
        return;
      }
      toast.success(`✅ Quadra: ${quadraNome}\n📅 
        Data: ${format(dataSelecionada, 'dd/MM/yyyy')}\n⏰ 
        Horário: ${availabilitySelecionada?.intervalo ?? 'Indisponível'}`)
      // Gerar comprovativo em PDF da reserva
      const exportFaturaAgendamentoPDF = (agendamento: any) => {
        const doc = new jsPDF();
        // Logo
        if (agendamento.logoBase64) {
          doc.addImage(agendamento.logoBase64, 'PNG', 14, 10, 30, 30);
        }
        const precoBase = agendamento.preco;
const iva = precoBase * 0.14;
const total = precoBase + iva;


        // Cabeçalho da empresa
        doc.setFontSize(12);
        doc.text("QA- agendamentos de quadra", 200, 15, { align: "right" });
        doc.text("Tala tona,", 200, 21, { align: "right" });
        doc.text("NIF: 123456789", 200, 27, { align: "right" });
        doc.text("Tel: 999-999-999", 200, 33, { align: "right" });

        // Título da Fatura
        doc.setFontSize(16);
        doc.text("FATURA DE AGENDAMENTO", 105, 50, { align: "center" });

        // Dados do cliente e fatura
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 60);
        doc.text(`Nome do Cliente: ${agendamento.clienteNome}`, 14, 68);
        doc.text(`Email: ${agendamento.clienteEmail}`, 14, 76);
        doc.text(`Referência da Reserva: ${agendamento.referencia}`, 14, 84);

        // Tabela com dados do agendamento
       const autoTableResult = autoTable(doc, {
        startY: 95,
        head: [["Item", "Descrição", "Preço Unitário", "Preço Total"]],
        body: [
          [
            agendamento.servico,
            agendamento.data,
            agendamento.preco ? `${Number(agendamento.preco)} Kz` : "N/A",
            agendamento.precoT ? `${Number(agendamento.precoT)} Kz` : "N/A",
          ],
        ],
        foot: [
          ["","", "Subtotal:", `${agendamento.precoT} Kz`],
          ["","", "IVA :", `0,00 Kz`],
          ["", " ","Total: ` ${agendamento.precoT} Kz`"],
        ],
        footStyles: {
          fontStyle: 'bold',
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          halign: 'right',
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'right' },
          2: { halign: 'right' },
        },
});

        // Totais detalhados
        // Totais
        const totalY = (autoTableResult as any)?.finalY ? (autoTableResult as any).finalY + 10 : 105;
        doc.setFontSize(12);
       

        // Observações
        doc.setFontSize(10);
        doc.text("Obrigado por escolher os nossos serviços!", 14, totalY + 70);

        // Salvar
        doc.save(`Fatura_Agendamento_${agendamento.referencia}.pdf`);
      };

      // Exemplo de uso:
      const [start, end] = horarioSelecionado.split(' - ');
      const inicio = new Date(start);
      const fim = new Date(end);
      const diffMs = fim.getTime() - inicio.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      const intervaloSelecionado = diffHoras;
      exportFaturaAgendamentoPDF({
        logoBase64: logo,
        clienteNome: session?.user.name || "Usuário",
        clienteEmail: session?.user.email || "Usuário",
        servico: quadraNome,
        data: formatarDisponibilidade(horarioSelecionado.split(' - ')[0], horarioSelecionado.split(' - ')[1]),
        preco:  formatCurrency( quadra?.pricePerHour || 0),
        precoT: formatCurrency(durationInHours(inicio,fim)* (quadra?.pricePerHour || 0)),
        referencia: `RES-${Math.floor(Math.random() * 1000000)}`, // Referência aleatória
      });
      onClose();

      router.push(`/perfil/reservas`)
    } catch (error) {
      console.error("Erro ao reservar:", error);
      alert("Erro ao reservar horário");
    }
  };


  return (
    <Suspense fallback={<Loading />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reservar {quadraNome}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <label className="text-sm font-medium text-gray-700">Selecione uma data</label>
            <Calendar

              mode="single"
              selected={dataSelecionada}
              onSelect={setDataSelecionada}
              locale={ptBR}
              className="rounded-md border w-full"
              modifiers={{
                active: datasDisponiveis,
              }}
              modifiersClassNames={{
                active: 'border border-green-500 rounded-full',
              }}
            />

            {dataSelecionada && (
              <>
                <label className="text-sm font-medium text-gray-700 mt-4">Horários disponíveis</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {horarios.filter(h => h.active).map(({ id, startTime, endTime, }) => {

                    const intervalo = `${startTime} - ${endTime}`
                    const selecionado = horarioSelecionado === intervalo

                    return (
                      <button
                        key={intervalo}

                        onClick={() => {
                          setHorarioSelecionado(intervalo)
                          setHorarioId(prev => id)
                        }}
                        className={clsx(
                          'px-3 py-2 rounded-lg text-sm font-medium border',
                          {
                            'bg-green-100 text-green-700 border-green-400 hover:bg-green-200':
                              !selecionado,
                            'bg-green-600 text-white border-green-700': selecionado,

                          }
                        )}
                      >
                        {formatarDisponibilidade(startTime, endTime)}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={handleReservar} disabled={!horarioSelecionado}>
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Suspense>
  )
}
function getDiasDisponiveis(agendamentos: { startTime: string; endTime: string }[]) {
  const dias: Date[] = [];

  for (const agendamento of agendamentos) {
    const inicio = new Date(agendamento.startTime);
    const fim = new Date(agendamento.endTime);

    // Começa no início do dia
    let atual = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const dataFinal = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate());

    while (atual <= dataFinal) {
      dias.push(new Date(atual)); // Clona a data
      atual.setDate(atual.getDate() + 1);
    }
  }

  // Remove datas duplicadas
  const diasUnicos = Array.from(new Set(dias.map(d => d.toDateString()))).map(d => new Date(d));
  return diasUnicos;
}