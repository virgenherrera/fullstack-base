import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CpuHealthIndicator, UptimeHealthIndicator } from './indicators';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [UptimeHealthIndicator, CpuHealthIndicator],
})
export class HealthModule {}
