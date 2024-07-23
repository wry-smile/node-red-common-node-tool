import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    './src/main.ts',
  ],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  clean: true,
})
