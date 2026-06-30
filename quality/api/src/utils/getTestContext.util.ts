import { env } from 'node:process';

import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { App } from 'supertest/types';

Object.assign(env, {
  SERVER_PORT: '0',
  APP_ENV: 'test',
  SWAGGER_ENABLED: 'false',
  npm_package_name: '@base/api',
  npm_package_version: '0.1.0',
});

export type TestContext = {
  app: INestApplication<App>;
  request: ReturnType<typeof supertest>;
};

export async function getTestContext(): Promise<TestContext> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AppModule } = require('@base/api/app.module');

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
