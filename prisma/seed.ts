import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin",
    },
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: bcrypt.hashSync("admin12345", 10),
    },
  });

  const blog = await prisma.blog.upsert({
    where: { ownerId: user.id },
    update: {
      name: "My Blog",
      slug: "my-blog",
    },
    create: {
      name: "My Blog",
      slug: "my-blog",
      ownerId: user.id,
    },
  });

  await prisma.blogMember.upsert({
    where: {
      blogId_userId: {
        blogId: blog.id,
        userId: user.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      blogId: blog.id,
      userId: user.id,
      role: "OWNER",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
