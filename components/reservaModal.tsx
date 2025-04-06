'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

type Horario = {
  inicio: string
  fim: string
  disponivel: boolean
}

interface ReservaModalProps {
  isOpen: boolean
  onClose: () => void
  quadraId: string
  quadraNome: string
}

export default function ReservaModal({ isOpen, onClose, quadraId, quadraNome }: ReservaModalProps) {
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null)

  // Simula busca de horários baseados na data
  useEffect(() => {
    if (!dataSelecionada) return

    const dia = dataSelecionada.getDate()

    const horariosSimulados: Horario[] =
      dia % 2 === 0
        ? [
            { inicio: '08:00', fim: '09:00', disponivel: true },
            { inicio: '09:00', fim: '10:00', disponivel: false },
            { inicio: '10:00', fim: '11:00', disponivel: true },
            { inicio: '11:00', fim: '12:00', disponivel: false },
          ]
        : [
            { inicio: '14:00', fim: '15:00', disponivel: true },
            { inicio: '15:00', fim: '16:00', disponivel: true },
            { inicio: '16:00', fim: '17:00', disponivel: false },
          ]

    setHorarios(horariosSimulados)
    setHorarioSelecionado(null)
  }, [dataSelecionada])

  const handleReservar = () => {
    if (!dataSelecionada || !horarioSelecionado) return
    alert(
      `✅ Quadra: ${quadraNome}\n📅 Data: ${format(dataSelecionada, 'dd/MM/yyyy')}\n⏰ Horário: ${horarioSelecionado}`
    )
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
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
          />

          {dataSelecionada && (
            <>
              <label className="text-sm font-medium text-gray-700 mt-4">Horários disponíveis</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {horarios.map(({ inicio, fim, disponivel }) => {
                  const intervalo = `${inicio} - ${fim}`
                  const selecionado = horarioSelecionado === intervalo

                  return (
                    <button
                      key={intervalo}
                      disabled={!disponivel}
                      onClick={() => setHorarioSelecionado(intervalo)}
                      className={clsx(
                        'px-3 py-2 rounded-lg text-sm font-medium border',
                        {
                          'bg-green-100 text-green-700 border-green-400 hover:bg-green-200':
                            disponivel && !selecionado,
                          'bg-green-600 text-white border-green-700':
                            disponivel && selecionado,
                          'bg-red-100 text-red-500 border-red-400 line-through cursor-not-allowed':
                            !disponivel,
                        }
                      )}
                    >
                      {intervalo}
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
