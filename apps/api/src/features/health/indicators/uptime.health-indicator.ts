import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class UptimeHealthIndicator implements OnApplicationBootstrap {
  private startTime: Date = new Date();

  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  onApplicationBootstrap(): void {
    this.startTime = new Date();
  }

  get startedAt(): Date {
    return this.startTime;
  }

  isHealthy(key: string): HealthIndicatorResult {
    const uptimeSeconds = Math.floor(
      (Date.now() - this.startTime.getTime()) / 1000,
    );

    return this.healthIndicatorService.check(key).up({
      uptime_seconds: uptimeSeconds,
      started_at: this.startTime.toISOString(),
    });
  }
}
