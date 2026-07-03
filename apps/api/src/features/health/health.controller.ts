import {
  Controller,
  Get,
  Logger,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiBadRequestResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { formatDistanceToNow } from 'date-fns';
import { ZodResponse } from 'nestjs-zod';

import { AppConfig } from '../../config';
import { InjectConfig } from '../../core/config';
import { CpuHealthIndicator, UptimeHealthIndicator } from './indicators';
import { HealthQueryDto, HealthResponseDto } from './dto';

@Controller('health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectConfig(AppConfig) private readonly appConfig: AppConfig,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly uptimeIndicator: UptimeHealthIndicator,
    private readonly cpuIndicator: CpuHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Retrieve service health information',
    description:
      'Returns the service health status and, when requested via query parameters, augments the payload with application metadata and uptime details',
  })
  @ZodResponse({
    status: 200,
    description:
      'Health status successfully retrieved. Optional fields are present only when requested via query parameters.',
    type: HealthResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Returned when query parameters fail validation (e.g., non-boolean values).',
  })
  async getHealth(@Query() params: HealthQueryDto): Promise<HealthResponseDto> {
    this.logger.log(`Getting service Health.`);

    const heapThresholdMb = parseInt(
      process.env['HEALTH_HEAP_THRESHOLD_MB'] ?? '512',
      10,
    );
    const rssThresholdMb = parseInt(
      process.env['HEALTH_RSS_THRESHOLD_MB'] ?? '1024',
      10,
    );

    let terminusResult: HealthCheckResult;

    try {
      terminusResult = await this.health.check([
        () =>
          this.memory.checkHeap('memory_heap', heapThresholdMb * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', rssThresholdMb * 1024 * 1024),
        () => this.uptimeIndicator.isHealthy('process_uptime'),
        () => this.cpuIndicator.isHealthy('cpu'),
      ]);
    } catch (e) {
      if (e instanceof ServiceUnavailableException) {
        terminusResult = e.getResponse() as HealthCheckResult;
      } else {
        throw e;
      }
    }

    const res: HealthResponseDto = {
      status: terminusResult.status === 'ok' ? 'OK' : 'ERROR',
      info: terminusResult.info as HealthResponseDto['info'],
      error: terminusResult.error as HealthResponseDto['error'],
      details: terminusResult.details,
    };

    if (params.appMeta) {
      const { name, version } = await Promise.resolve(this.appConfig);
      res.appMeta = `${name}@${version}`;
    }

    if (params.uptime) {
      res.uptime = formatDistanceToNow(this.uptimeIndicator.startedAt);
    }

    return res;
  }
}
