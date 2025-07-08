import { z } from "zod";

export const bookingSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),
    courtId: z.string(),
    availabilityId: z.string(),
    status: z.enum(["PENDENTE", "CONFIRMADO", "CANCELADO", "CONCLUIDO"]),
    createdById: z.string(),
    updatedById: z.string().optional(),
});


export const bookingSchemaEdit = z.object({
    availabilityId: z.string(),
    status: z.enum(["PENDENTE", "CONFIRMADO", "CANCELADO", "CONCLUIDO"]),
});