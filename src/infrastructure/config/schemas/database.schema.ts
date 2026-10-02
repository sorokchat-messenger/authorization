import z from "zod";

export const DatabaseSchema = z
  .object({
    DATABASE_URL: z.url({ error: "Посилання для бази даних має бути" })
  })
  .transform(
    ({
      DATABASE_URL,
    }) => ({
      url: DATABASE_URL
    }),
  );

export type DatabaseConfig = z.infer<typeof DatabaseSchema>;
