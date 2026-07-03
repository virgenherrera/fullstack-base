// ──────────────────────────────────────────────────────────
// Template: Static File Serving Strategy
//
// KEEP   → NestJS serves both API and frontend (simplest).
// ADAPT  → change the rootPath convention to your build output.
// DROP   → remove this module from AppModule if using
//          nginx, Docker, CDN, or another reverse proxy.
// ──────────────────────────────────────────────────────────

import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ARTIFACTS_WEB } from '@base/paths';

import { AppConfig } from '../config';

@Module({})
export class AppServeStaticModule {
  private static readonly logger = new Logger(AppServeStaticModule.name);

  static register(): DynamicModule {
    return {
      module: AppServeStaticModule,
      imports: [
        ServeStaticModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const { environmentLabel } =
              config.get<AppConfig>(AppConfig.name) ?? {};

            if (environmentLabel === 'local') {
              this.logger.log(
                `Environment "${environmentLabel}" — static file serving disabled`,
              );

              return [];
            }

            this.logger.log(
              `Environment "${environmentLabel}" — serving static files from: ${ARTIFACTS_WEB}`,
            );

            return [{ rootPath: ARTIFACTS_WEB, exclude: ['/api/(.*)'] }];
          },
        }),
      ],
    };
  }
}
