import test from 'node:test';
import assert from 'node:assert/strict';
import { startServer, app } from '../src/app.js';

test('GET /api/health responde con estado y versión', async () => {
  const server = startServer(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
    assert.equal(typeof body.status, 'string');
    assert.equal(typeof body.timestamp, 'string');
    assert.equal(typeof body.environment, 'string');
    assert.equal(typeof body.version, 'string');
    assert.equal(typeof body.uptimeMs, 'number');
    assert.equal(typeof body.dbConfigured, 'boolean');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/does-not-exist devuelve 404', async () => {
  const server = startServer(0);

  try {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    const response = await fetch(`http://127.0.0.1:${port}/api/does-not-exist`);

    assert.equal(response.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
