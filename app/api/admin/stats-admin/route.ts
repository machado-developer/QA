import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "ADMINISTRADOR" && session.user.role !== "OPERADOR")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalCourts,
      bookings,
      paymentsConcluidos,
      latestBookings,
      totalReviews,
      // unreadNotifications,
      // activePaymentMethods
    ] = await Promise.all([
      prisma.user.count(),
      prisma.court.count(),
      prisma.booking.findMany(),
      prisma.payment.findMany({
        where: { status: "CONCLUIDO" },
        include: {
          booking: {
            include: {
              court: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          court: true,
        },
      }),
      prisma.review.count(),
      // prisma.notification.count({
      //   where: {
      //     read: false,
      //   },
      // }),
      // prisma.paymentMethod.findMany({
      //   where: {
      //     active: true,
      //   },
      // }),
    ]);

    const bookingStatusCount = {
      TOTAL: bookings.length,
      PENDENTE: bookings.filter((b) => b.status === "PENDENTE").length,
      CONFIRMADO: bookings.filter((b) => b.status === "CONFIRMADO").length,
      CANCELADO: bookings.filter((b) => b.status === "CANCELADO").length,
      CONCLUIDO: bookings.filter((b) => b.status === "CONCLUIDO").length,
    };

    const totalRecebido = paymentsConcluidos.reduce((acc, payment) => {
      const price = payment.booking?.court?.pricePerHour || 0;
      return acc + price;
    }, 0);

    return NextResponse.json({
      totalUsers,
      totalCourts,
      bookings: bookingStatusCount,
      totalRecebido,
      latestBookings,
      totalReviews,
      // unreadNotifications,
      // activePaymentMethods,
    });
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
