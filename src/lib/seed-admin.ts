type SeedEnvironment = Partial<Pick<NodeJS.ProcessEnv, "NODE_ENV" | "SEED_ADMIN_EMAIL" | "SEED_ADMIN_PASSWORD">>;

const developmentEmail = "admin@example.com";
const developmentPassword = "admin12345";

export function getSeedAdminCredentials(env: SeedEnvironment = process.env) {
  const isProduction = env.NODE_ENV === "production";
  const email = env.SEED_ADMIN_EMAIL ?? (isProduction ? "" : developmentEmail);
  const password = env.SEED_ADMIN_PASSWORD ?? (isProduction ? "" : developmentPassword);

  if (!email) {
    throw new Error("SEED_ADMIN_EMAIL is required when seeding production data.");
  }

  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD is required when seeding production data.");
  }

  if (isProduction && password === developmentPassword) {
    throw new Error("Refusing to seed production with the default development password.");
  }

  return { email, password };
}
