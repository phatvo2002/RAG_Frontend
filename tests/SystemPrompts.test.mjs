import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('System Prompt route and menu are registered under Catalog with read permission', async () => {
  const [router, sidebar] = await Promise.all([
    read('../src/router/index.tsx'),
    read('../src/components/sidebar/index.tsx'),
  ]);
  assert.match(router, /path: '\/catalog\/system-prompts'/);
  assert.match(router, /PermissionGuard module="SYSTEM_PROMPT\.READ"/);
  const catalog = sidebar.split("id: 'catalog'")[1].split("id: 'admin'")[0];
  assert.match(catalog, /path: '\/catalog\/system-prompts'/);
  assert.doesNotMatch(catalog, /id: 'system-prompts'[\s\S]*?id: 'admin'/);
});

test('System Prompt page uses APIs for versioned draft, preview, publish, and restore', async () => {
  const [page, api] = await Promise.all([
    read('../src/pages/catalog/system-prompts/index.tsx'),
    read('../src/api/system-prompts.api.ts'),
  ]);
  for (const endpoint of ['/draft', '/preview', '/publish', '/restore']) assert.ok(api.includes(endpoint));
  assert.match(page, /Version history/);
  assert.match(page, /Save draft/);
  assert.match(page, /Restore as new version/);
});
