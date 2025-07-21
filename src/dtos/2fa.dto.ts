import { z } from "zod";

export const MultipleFactorAuthDto = z.object({
  code: z.string().length(6, "2FA code must be 6 digits").regex(/^\d+$/, "2FA code must be numeric")
});

export type MultipleFactorAuthDto = z.infer<typeof MultipleFactorAuthDto>;
