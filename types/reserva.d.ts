const statusBook = [
    "PENDENTE",
    "CONFIRMADO",
    "CANCELADO",
    "CONCLUIDO"
]
interface Reserva {
    id?: string;
    user?: { name: string, id: string, email: string };
    court: { id?: string; name: string, pricePerHour: number };
    availability: { id?: string; startTime: string; endTime: string; date: string };
    status: (typeof statusBook)[number];
    actve?: boolean
}


