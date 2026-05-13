type SeedEnvironment = Partial<
  Pick<NodeJS.ProcessEnv, "NODE_ENV" | "SEED_ADMIN_EMAIL" | "SEED_ADMIN_PASSWORD" | "SEED_ADMIN_UPDATE_PASSWORD">
>;

const developmentEmail = "admin@example.com";
const developmentPassword = "admin12345";
const blockedProductionPasswords = new Set([developmentPassword, "change-me-before-production"]);

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

  if (isProduction && blockedProductionPasswords.has(password)) {
    throw new Error("Refusing to seed production with a default or placeholder password.");
  }

  return { email, password };
}

export function shouldUpdateSeedPassword(env: SeedEnvironment = process.env) {
  return env.NODE_ENV === "production" || env.SEED_ADMIN_UPDATE_PASSWORD === "true";
}
