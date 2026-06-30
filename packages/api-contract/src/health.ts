import { z } from 'zod';

export const HealthQuerySchema = z.object({
  appMeta: z.coerce.boolean().optional(),
  uptime: z.coerce.boolean().optional(),
});

export const HealthResponseSchema = z.object({
  status: z.literal('OK'),
  appMeta: z.string().optional(),
  uptime: z.string().optional(),
});

export type HealthQuery = z.infer<typeof HealthQuerySchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
