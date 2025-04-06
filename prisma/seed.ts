// Script para criar um usuário admin no banco de dados
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("admin@2025...", 10);

    const user = await prisma.user.upsert({
        where: {  email: "admin@gmail.com", },
        update: {}, // Se já existir, não atualiza nada
        create: {
            name: "Ruberto De Campos",
            email: "admin@gmail.com",
            password: hashedPassword, // Apenas se armazenar hash da senha
            role: "ADMINISTRADOR", // Define o papel como ADMIN
        },
    });

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
