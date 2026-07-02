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
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { AppConfig } from '../config';

// TODO(TD-001): replace with @base/paths shared constants package.
// Walks filesystem at startup — fragile. See packages/paths (to be created).
function findRepoRoot(from: string = __dirname): string {
  let current = from;

  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current) {
      throw new Error(
        'pnpm-workspace.yaml not found — is this a pnpm monorepo?',
      );
    }

    current = parent;
  }
}

const WEB_ARTIFACTS_PATH = join(findRepoRoot(), 'artifacts', 'web', 'browser');

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
              `Environment "${environmentLabel}" — serving static files from: ${WEB_ARTIFACTS_PATH}`,
            );

            return [{ rootPath: WEB_ARTIFACTS_PATH, exclude: ['/api/(.*)'] }];
          },
        }),
      ],
    };
  }
}
