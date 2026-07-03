import { Test } from '@nestjs/testing';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { getTestContext, TestContext } from '../../utils/getTestContext.util';

class GetHealthTestCase {
  static readonly getHealth = `Should GET App health.`;
  static readonly getHealthWithUptime = 'Should get App Health with uptime.';
  static readonly ignoreUnknownQuery = 'Should ignore unknown query params.';
  static readonly getNotFound = 'Should return not found for unknown routes.';
  static readonly getDegradedHealth =
    'Should return ERROR status when a health indicator is down.';
}

describe(`e2e: GET /health`, () => {
  const getHealthMatcher = { status: 'OK' };

  let testCtx: TestContext;

  beforeAll(async () => (testCtx = await getTestContext()));

  afterAll(async () => {
    await testCtx.app.close();
  });

  it(GetHealthTestCase.getHealth, async () => {
    const res = await testCtx.request.get('/api/health');

    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('body');
    expect(res.body).toMatchObject(getHealthMatcher);
  });

  it(GetHealthTestCase.getHealthWithUptime, async () => {
    const res = await testCtx.request
      .get('/api/health')
      .query({ appMeta: true, uptime: true });

    expect(res).toHaveProperty('status', 200);
    expect(res).toHaveProperty('body');
    expect(res.body).toMatchObject({
      ...getHealthMatcher,
      appMeta: expect.stringMatching(/^(@?[\w-]+(\/[\w-]+)?)@(\d+\.\d+\.\d+)$/),
      uptime: expect.stringMatching(/.{1,}/),
    });
  });

  it(GetHealthTestCase.ignoreUnknownQuery, async () => {
    const res = await testCtx.request.get('/api/health').query({ foo: 'bar' });

    expect(res).toHaveProperty('status', 200);
    expect(res.body).toMatchObject(getHealthMatcher);
  });

  it(GetHealthTestCase.getNotFound, async () => {
    const res = await testCtx.request.get('/missing-route');

    expect(res).toHaveProperty('status', 404);
    expect(res.body).toMatchObject({
      error: 'Not Found',
      message: expect.arrayContaining([expect.stringMatching(/Cannot GET/)]),
      path: '/missing-route',
    });
  });

  describe('when a health indicator is down', () => {
    let degradedCtx: TestContext;

    beforeAll(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(MemoryHealthIndicator)
        .useValue({
          checkHeap: () =>
            Promise.resolve({
              memory_heap: { status: 'down', message: 'heap exceeded' },
            }),
          checkRSS: () =>
            Promise.resolve({
              memory_rss: { status: 'down', message: 'rss exceeded' },
            }),
        })
        .compile();

      const app: TestContext['app'] = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      await app.init();

      degradedCtx = { app, request: supertest(app.getHttpServer()) };
    });

    afterAll(async () => {
      await degradedCtx.app.close();
    });

    it(GetHealthTestCase.getDegradedHealth, async () => {
      const res = await degradedCtx.request.get('/api/health');

      expect(res).toHaveProperty('status', 200);
      expect(res.body).toMatchObject({ status: 'ERROR' });
    });
  });
});
