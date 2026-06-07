import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Users
  const passwordHashAdmin = await bcrypt.hash("admin123", 10);
  const passwordHashEditor = await bcrypt.hash("editor123", 10);
  const passwordHashUser = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@champions.local" },
    update: { passwordHash: passwordHashAdmin, role: "ADMIN" },
    create: {
      email: "admin@champions.local",
      name: "Super Admin",
      passwordHash: passwordHashAdmin,
      role: "ADMIN",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@champions.local" },
    update: { passwordHash: passwordHashEditor, role: "EDITOR" },
    create: {
      email: "editor@champions.local",
      name: "Content Editor",
      passwordHash: passwordHashEditor,
      role: "EDITOR",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@champions.local" },
    update: { passwordHash: passwordHashUser, role: "USER" },
    create: {
      email: "user@champions.local",
      name: "John Doe",
      passwordHash: passwordHashUser,
      role: "USER",
    },
  });

  console.log("Users seeded successfully:", { admin: admin.email, editor: editor.email, user: user.email });

  // 2. Create Teams
  const teamsData = [
    {
      name: "Real Madrid CF",
      country: "Spain",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
    },
    {
      name: "FC Barcelona",
      country: "Spain",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg",
    },
    {
      name: "Manchester City FC",
      country: "United Kingdom",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
    },
    {
      name: "FC Bayern München",
      country: "Germany",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_(2017).svg",
    },
    {
      name: "Paris Saint-Germain",
      country: "France",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
    },
    {
      name: "Juventus FC",
      country: "Italy",
      shieldUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juvenutus-Logo-2017.svg",
    },
  ];

  const teams: Record<string, any> = {};

  for (const t of teamsData) {
    const createdTeam = await prisma.team.upsert({
      where: { name: t.name },
      update: { country: t.country, shieldUrl: t.shieldUrl },
      create: {
        name: t.name,
        country: t.country,
        shieldUrl: t.shieldUrl,
      },
    });
    teams[t.name] = createdTeam;
  }

  console.log("Teams seeded successfully:", Object.keys(teams));

  // 3. Create Matches
  const matchesData = [
    {
      homeTeamId: teams["Real Madrid CF"].id,
      awayTeamId: teams["FC Barcelona"].id,
      homeScore: 3,
      awayScore: 2,
      status: "FINISHED",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      imageUrl: "",
    },
    {
      homeTeamId: teams["Manchester City FC"].id,
      awayTeamId: teams["FC Bayern München"].id,
      homeScore: 1,
      awayScore: 1,
      status: "LIVE",
      date: new Date(), // Today
      imageUrl: "",
    },
    {
      homeTeamId: teams["Paris Saint-Germain"].id,
      awayTeamId: teams["Juventus FC"].id,
      homeScore: null,
      awayScore: null,
      status: "SCHEDULED",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      imageUrl: "",
    },
  ];

  for (const m of matchesData) {
    // Check if match already exists between these teams on the same day
    const dayStart = new Date(m.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(m.date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingMatch = await prisma.match.findFirst({
      where: {
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (!existingMatch) {
      await prisma.match.create({
        data: m,
      });
    } else {
      await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
        },
      });
    }
  }

  console.log("Matches seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
