import { z } from "zod";

export const adminUserSchema = z.object({
  role: z.enum(["CANDIDATE", "COMPANY", "ADMIN"], { message: "Choose a role" }),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"], { message: "Choose a status" }),
});

export type AdminUserFormValues = z.infer<typeof adminUserSchema>;
