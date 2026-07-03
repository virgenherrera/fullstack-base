import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class HealthConfig extends createZodDto(
  z
    .object({
      HEALTH_HEAP_THRESHOLD_MB: z.coerce.number().int().positive().default(512),
      HEALTH_RSS_THRESHOLD_MB: z.coerce.number().int().positive().default(1024),
    })
    .transform((value) => ({
      heapThresholdBytes: value.HEALTH_HEAP_THRESHOLD_MB * 1024 * 1024,
      rssThresholdBytes: value.HEALTH_RSS_THRESHOLD_MB * 1024 * 1024,
    })),
) {}
