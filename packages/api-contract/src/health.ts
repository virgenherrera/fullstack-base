import { z } from 'zod';

export const HealthQuerySchema = z.object({
  appMeta: z.coerce.boolean().optional(),
  uptime: z.coerce.boolean().optional(),
});

const HealthIndicatorDetailSchema = z
  .object({ status: z.enum(['up', 'down']) })
  .passthrough();

const HealthIndicatorResultSchema = z
  .record(z.string(), HealthIndicatorDetailSchema)
  .optional();

export const HealthResponseSchema = z.object({
  status: z.enum(['OK', 'ERROR']),
  appMeta: z.string().optional(),
  uptime: z.string().optional(),
  info: HealthIndicatorResultSchema,
  error: HealthIndicatorResultSchema,
  details: HealthIndicatorResultSchema,
});

export type HealthQuery = z.infer<typeof HealthQuerySchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
