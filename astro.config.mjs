import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.grupolasgarzas.cl',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
