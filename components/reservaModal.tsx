'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { formatarDisponibilidade } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Horario = {
  startTime: string
  endTime: string
  id: string
  disponivel: boolean
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
      const data = await response.json();

      // Supondo que a API retorne um array de objetos com 'date' e 'availabilities'
      const datas = data.availabilities?.filter((d: any) => d?.availabilities?.map((d: any) => new Date(d.date)));

      setDatasDisponiveis(datas);
    } catch (error) {
      console.error("Erro ao buscar datas disponíveis:", error);
    }
  };

  useEffect(() => {
    fetchTodasDisponibilidades()
  }, [isOpen]);

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
        alert(`Erro: ${err.message}`);
        return;
      }


      alert(
        `✅ Quadra: ${quadraNome}\n📅 Data: ${format(dataSelecionada, 'dd/MM/yyyy')}\n⏰ Horário: ${availabilitySelecionada?.intervalo ?? 'Indisponível'}`
      );
      onClose();
    } catch (error) {
      console.error("Erro ao reservar:", error);
      alert("Erro ao reservar horário");
    }
  };

  return (
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
            className="rounded-md border"
            modifiers={{
              disponivel: datasDisponiveis ?? [],
            }}
            modifiersClassNames={{
              disponivel: 'border border-green-500 rounded-full',
            }}
          />

          {dataSelecionada && (
            <>
              <label className="text-sm font-medium text-gray-700 mt-4">Horários disponíveis</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {horarios.map(({ id, startTime, endTime, disponivel }) => {
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
  )
}
