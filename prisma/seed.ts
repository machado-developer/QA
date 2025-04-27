// Script para criar um usuário admin e categorias no banco de dados
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("admin@2025...", 10);

    // Criação do usuário admin
    await prisma.user.upsert({
        where: { email: "admin@gmail.com" },
        update: {}, // Se já existir, não atualiza nada
        create: {
            name: "Ruberto De Campos",
            email: "admin@gmail.com",
            password: hashedPassword, // Apenas se armazenar hash da senha
            role: "ADMINISTRADOR",
        },
    });

    // Categorias de desporto
    const categories = [
        "Futebol",
        "Voleibol",
        "Basquetebol",
        "Ténis",
        "Padel",
        "Andebol",
        "Futsal",
        "Badminton",
        "Atletismo",
        "Natação",
    ];

    // Criação das categorias
    for (const categoryName of categories) {
        await prisma.category.upsert({
            where: { name: categoryName },
            update: {}, // Se já existir, não atualiza nada
            create: {
                name: categoryName,
            },
        });
    }

    console.log("Admin e categorias criados com sucesso!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
