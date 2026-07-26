// Одноразовый скрипт: заводит 8 больших бильярдных столов Citadel.
// Запуск: npx tsx prisma/setup-citadel-tables.ts
// Безопасен для повторного запуска (upsert), ничего не удаляет.
import { PrismaClient, TableKind } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const code = () => randomUUID().slice(0, 8);

async function main() {
  const venue = await prisma.venue.findUnique({ where: { slug: "citadel" } });
  if (!venue) throw new Error("Заведение citadel не найдено в базе");

  for (let n = 1; n <= 8; n++) {
    await prisma.table.upsert({
      where: {
        venueId_kind_number: {
          venueId: venue.id,
          kind: TableKind.BILLIARD_LARGE,
          number: n,
        },
      },
      update: {},
      create: {
        venueId: venue.id,
        kind: TableKind.BILLIARD_LARGE,
        number: n,
        seats: 4,
        code: code(),
      },
    });
  }

  const count = await prisma.table.count({ where: { venueId: venue.id } });
  console.log(`✅ Готово. Столов у Citadel в базе: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
