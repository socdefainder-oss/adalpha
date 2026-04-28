import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/utils/auth";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@appigreja.com";

  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: await hashPassword("admin123"),
        role: Role.ADMIN,
      },
    });
  }

  const members = await Promise.all([
    prisma.member.upsert({
      where: { email: "ana.silva@exemplo.com" },
      update: {},
      create: {
        fullName: "Ana Silva",
        email: "ana.silva@exemplo.com",
        phone: "11999990001",
        gender: "F",
        city: "Sao Paulo",
        state: "SP",
      },
    }),
    prisma.member.upsert({
      where: { email: "joao.santos@exemplo.com" },
      update: {},
      create: {
        fullName: "Joao Santos",
        email: "joao.santos@exemplo.com",
        phone: "11999990002",
        gender: "M",
        city: "Sao Paulo",
        state: "SP",
      },
    }),
  ]);

  const louvor = await prisma.ministry.upsert({
    where: { name: "Louvor" },
    update: {},
    create: {
      name: "Louvor",
      description: "Ministerio de musica e adoracao",
    },
  });

  const jovens = await prisma.group.upsert({
    where: { name: "Conexao Jovem" },
    update: {},
    create: {
      name: "Conexao Jovem",
      category: "Jovens",
      leaderName: "Lider Jovem",
      meetingDay: "Sabado",
      meetingTime: "19:30",
      active: true,
    },
  });

  await prisma.ministryMember.upsert({
    where: {
      ministryId_memberId: {
        ministryId: louvor.id,
        memberId: members[0].id,
      },
    },
    update: {},
    create: {
      ministryId: louvor.id,
      memberId: members[0].id,
      role: "Vocal",
    },
  });

  await prisma.groupMember.upsert({
    where: {
      groupId_memberId: {
        groupId: jovens.id,
        memberId: members[1].id,
      },
    },
    update: {},
    create: {
      groupId: jovens.id,
      memberId: members[1].id,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        title: "Culto de Domingo",
        category: "Culto",
        eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: "Templo Sede",
      },
      {
        title: "Ensaio do Louvor",
        category: "Ministerio",
        eventDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        location: "Sala de Musica",
      },
    ],
    skipDuplicates: true,
  });

  const existsFinance = await prisma.transaction.count();

  if (existsFinance === 0) {
    await prisma.transaction.createMany({
      data: [
        {
          title: "Dizimos e ofertas",
          amount: 5500,
          date: new Date(),
          type: "ENTRADA",
          category: "Contribuicoes",
        },
        {
          title: "Conta de energia",
          amount: 1200,
          date: new Date(),
          type: "SAIDA",
          category: "Despesas fixas",
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
