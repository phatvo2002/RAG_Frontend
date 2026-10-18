import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/api/documents.api.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const module = { exports: {} };
let requestedUrl;
vm.runInNewContext(compiled, {
  module,
  exports: module.exports,
  URLSearchParams,
  require: (name) => {
    if (name === '@/api/client' || name === './client') return {
      apiClient: async (url) => {
        requestedUrl = url;
        return { data: { items: [], page: 1, pageSize: 25, totalCount: 0, totalPages: 0 } };
      }
    };
    if (name === '@tanstack/react-query') return { useQuery: () => {}, useMutation: () => {}, useQueryClient: () => {} };
    if (name === './document-folders.api') return { documentFoldersQueryKeys: { lists: () => [] } };
    return require(name);
  }
});

test('all documents requests every folder; folder view remains scoped', async () => {
  await module.exports.documentsApi.getDocuments({ folderId: 'all' });
  assert.equal(new URL(requestedUrl, 'http://localhost').searchParams.has('folderId'), false);

  const folderId = '0b9ad55c-aab8-408a-8597-0ba79d4d4e2f';
  await module.exports.documentsApi.getDocuments({ folderId });
  assert.equal(new URL(requestedUrl, 'http://localhost').searchParams.get('folderId'), folderId);
});
