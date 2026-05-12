import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { getSeedAdminCredentials, shouldUpdateSeedPassword } from "../src/lib/seed-admin";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const credentials = getSeedAdminCredentials();
  const passwordHash = bcrypt.hashSync(credentials.password, 10);
  const user = await prisma.user.upsert({
    where: { email: credentials.email },
    update: shouldUpdateSeedPassword()
      ? {
          name: "Admin",
          password: passwordHash,
        }
      : {
          name: "Admin",
        },
    create: {
      email: credentials.email,
      name: "Admin",
      password: passwordHash,
    },
  });

  const blog = await prisma.blog.upsert({
    where: { ownerId: user.id },
    update: {
      name: "My Blog",
      slug: "my-blog",
      baseUrl: "https://example.com/",
      locale: "en",
      templateKey: "editorial",
    },
    create: {
      name: "My Blog",
      slug: "my-blog",
      baseUrl: "https://example.com/",
      locale: "en",
      templateKey: "editorial",
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
