import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = (await params).id; // Não é necessário await, params já é um objeto

        const data = await prisma.passwordResetToken.findUnique({
            where: {
                id: userId, // assuming userId is the id you want to search by
                token: 'your-token-here' // replace with the actual token value
            },
            select: {
                id: true,
                userId: true
            },
        });

        return Response.json(data, { status: 200 });
    } catch (error) {
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
