import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class CpuHealthIndicator {
  private previousCpuUsage: NodeJS.CpuUsage = process.cpuUsage();
  private previousTimestamp: number = Date.now();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isHealthy(key: string): HealthIndicatorResult {
    const currentCpuUsage = process.cpuUsage();
    const currentTimestamp = Date.now();

    const elapsedMs = currentTimestamp - this.previousTimestamp;
    const elapsedMicros = elapsedMs * 1000;

    const userDelta = currentCpuUsage.user - this.previousCpuUsage.user;
    const systemDelta = currentCpuUsage.system - this.previousCpuUsage.system;
    const totalDelta = userDelta + systemDelta;

    // CPU usage as a percentage of a single CPU core over the elapsed interval
    const usagePercent =
      elapsedMicros > 0
        ? Math.min(100, Math.round((totalDelta / elapsedMicros) * 1000) / 10)
        : 0;

    this.previousCpuUsage = currentCpuUsage;
    this.previousTimestamp = currentTimestamp;

    return this.healthIndicatorService.check(key).up({
      usage_percent: usagePercent,
    });
  }
}
