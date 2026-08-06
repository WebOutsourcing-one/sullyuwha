// `dotenv/config`는 `.env` 만 읽는다(`.env.local` 은 읽지 않는다).
// 그래서 로컬 DATABASE_URL은 `.env` 에 둬야 prisma CLI와 Next가 같은 값을 본다.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7부터 시드 명령이 여기로 옮겨졌다.
    // package.json의 `prisma.seed` 키는 더 이상 읽지 않아서,
    // 그대로 두면 `prisma db seed`가 "No seed command configured"로 끝난다.
    // (`prisma migrate reset` 뒤 자동 시드도 함께 동작하지 않았다)
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
