import { createZodDto } from 'nestjs-zod';
import { HealthResponseSchema } from '@base/api-contract';

export class HealthResponseDto extends createZodDto(
  HealthResponseSchema.meta({ title: 'HealthResponseDto' }),
) {}
