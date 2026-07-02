import { Module } from '@nestjs/common';

import { CoreModule } from './core/core.module';
import { HealthModule } from './features/health/health.module';
import { AppServeStaticModule } from './serve-static/app-serve-static.module';

@Module({
  imports: [CoreModule, AppServeStaticModule.register(), HealthModule],
})
export class AppModule {}
