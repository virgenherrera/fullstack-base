import { env } from 'node:process';
import { resolve } from 'node:path';

import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { App } from 'supertest/types';

// Set required env vars before importing AppModule
Object.assign(env, {
  SERVER_PORT: '0',
  APP_ENV: 'test',
  SWAGGER_ENABLED: 'false',
});

export type TestContext = {
  app: INestApplication<App>;
  request: ReturnType<typeof supertest>;
};

export async function getTestContext(): Promise<TestContext> {
  const appModulePath = resolve(
    __dirname,
    '../../../../apps/api/src/app.module',
  );
  // Dynamic import to cross the workspace boundary at runtime.
  // ts-jest resolves the .ts file; TypeScript sees only the typed result.
  const { AppModule } = (await import(appModulePath)) as {
    AppModule: new (...args: unknown[]) => unknown;
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app: TestContext['app'] = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.enableVersioning({
    header: 'X-API-Version',
    type: VersioningType.HEADER,
  });

  await app.init();

  const request = supertest(app.getHttpServer());

  return { app, request };
}
