import { getTestContext, TestContext } from '../utils/getTestContext.util';

describe('E2E: GET /health', () => {
  let testCtx: TestContext;

  beforeAll(async () => {
    testCtx = await getTestContext();
  });

  afterAll(async () => {
    await testCtx.app.close();
  });

  it('should return OK status', async () => {
    const res = await testCtx.request.get('/api/health');

    expect(res).toHaveProperty('status', 200);
    expect(res.body).toMatchObject({ status: 'OK' });
  });

  it('should return appMeta when requested', async () => {
    const res = await testCtx.request
      .get('/api/health')
      .query({ appMeta: true });

    expect(res).toHaveProperty('status', 200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('appMeta');
    expect(res.body).toHaveProperty(
      'appMeta',
      expect.stringMatching(/@base\/api@/),
    );
  });

  it('should return uptime when requested', async () => {
    const res = await testCtx.request
      .get('/api/health')
      .query({ uptime: true });

    expect(res).toHaveProperty('status', 200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('uptime', expect.stringMatching(/.+/));
  });

  it('should ignore unknown query params', async () => {
    const res = await testCtx.request.get('/api/health').query({ foo: 'bar' });

    expect(res).toHaveProperty('status', 200);
    expect(res.body).toMatchObject({ status: 'OK' });
  });

  it('should return 404 for unknown routes', async () => {
    const res = await testCtx.request.get('/missing-route');

    expect(res).toHaveProperty('status', 404);
  });
});
