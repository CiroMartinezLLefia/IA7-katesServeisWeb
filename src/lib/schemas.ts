import { z } from "zod";

// Team validation schema
export const teamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "El nom de l'equip és obligatori."),
  country: z.string().min(1, "El país és obligatori."),
  shieldUrl: z.string().optional(),
});

export type TeamInput = z.infer<typeof teamSchema>;

// Match validation schema
export const matchSchema = z.object({
  id: z.string().uuid().optional(),
  homeTeamId: z.string().uuid("Selecciona un equip local vàlid."),
  awayTeamId: z.string().uuid("Selecciona un equip visitant vàlid."),
  homeScore: z.coerce.number().int().min(0).nullable().optional(),
  awayScore: z.coerce.number().int().min(0).nullable().optional(),
  date: z.string().min(1, "La data del partit és obligatòria."),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED"], {
    message: "L'estat del partit ha de ser SCHEDULED, LIVE o FINISHED.",
  }),
  imageUrl: z.string().optional(),
}).refine((data) => data.homeTeamId !== data.awayTeamId, {
  message: "L'equip local i l'equip visitant no poden ser el mateix.",
  path: ["awayTeamId"],
});

export type MatchInput = z.infer<typeof matchSchema>;

// Comment validation schema
export const commentSchema = z.object({
  content: z.string().min(1, "El comentari no pot estar buit.").max(500, "El comentari no pot superar els 500 caràcters."),
  matchId: z.string().uuid(),
});

export type CommentInput = z.infer<typeof commentSchema>;

// User Role validation schema
export const userRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["USER", "EDITOR", "ADMIN"]),
});

export type UserRoleInput = z.infer<typeof userRoleSchema>;
