import z from "zod";
import { config as loadEnv } from "dotenv";

const dotenvResult = loadEnv();
// eslint-disable-next-line node/no-process-env
const envSource = dotenvResult.error ? "process env" : (process.env.DOTENV_CONFIG_PATH ?? ".env");
// eslint-disable-next-line node/no-process-env
const rawEnv = { ...process.env, ENV_SOURCE: envSource };

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ENV_SOURCE: z.string().default("process env"),
  S3_ENDPOINT: z.string().min(1, "S3_ENDPOINT is required").optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required").optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required").optional(),
  S3_BUCKET: z.string().min(1, "S3_BUCKET is required").optional(),
  S3_FORCE_PATH_STYLE: z.enum(["true", "false"]).default("true").transform(val => val === "true"),
});

try {
  // eslint-disable-next-line node/no-process-env
  envSchema.parse(rawEnv);
}
catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Missing or invalid environment variables:", error.issues.flatMap(issue => `${issue.path.join(".")}: ${issue.message}`));
  }
  else {
    console.error(error);
  }
  process.exit(1);
}

// eslint-disable-next-line node/no-process-env
export const env = envSchema.parse(rawEnv);
