// TODO(TD-002): extract to @base/test-utils when a second consumer appears
export async function getFreePort(): Promise<number> {
  const { createServer } = await import('node:net');

  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const { port } = server.address() as { port: number };
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}
