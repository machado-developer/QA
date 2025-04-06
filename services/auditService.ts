import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function logAction(userId: string, action: string, details: string) {
    await prisma.log.create({
        data: {
            userId,
            action,
            details,
        },
    });
}

export default logAction;
//     })
//      },