import { toZonedTime, format, fromZonedTime } from "date-fns-tz";
import { parseISO, addDays, isBefore } from "date-fns";

const TIMEZONE = "Africa/Luanda";

type AvailabilityInput = {
    date: string; // ex: "2025-04-07"
    startTime: string; // ex: "22:00"
    endTime: string;   // ex: "01:00"
    active: boolean;
};

/**
 * Converte data e hora local para objetos Date em UTC, tratando dia seguinte.
 */
export function parseAvailabilityToUTC({ date, startTime, endTime }: AvailabilityInput) {
    const startZoned = `${date}T${startTime}:00`;
    const endZoned = `${date}T${endTime}:00`;

    let startDateUTC = fromZonedTime(startZoned, TIMEZONE);
    let endDateUTC = fromZonedTime(endZoned, TIMEZONE);

    // Trata caso onde o fim é no dia seguinte (ex: 22:00 até 01:00)
    if (isBefore(endDateUTC, startDateUTC)) {
        endDateUTC = addDays(endDateUTC, 1);
    }

    return { startDateUTC, endDateUTC };
}

/**
 * Formata uma data UTC para o fuso local, retornando { date, time }
 */
export function formatUTCToLocal(utcDate: Date) {
    const zoned = toZonedTime(utcDate, TIMEZONE);
    const date = format(zoned, "yyyy-MM-dd", { timeZone: TIMEZONE });
    const time = format(zoned, "HH:mm", { timeZone: TIMEZONE });

    return { date, time };
}
