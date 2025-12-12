import { defineConfig } from 'orval';

export default defineConfig({
  candidash: {
    output: {
      mode: 'tags-split', // Split files by tags (Auth, Companies, etc.) for better organization
      target: 'src/api/endpoints.ts', // Entry point for generated hooks
      schemas: 'src/api/model', // Directory for TS interfaces (User, Company...)
      client: 'react-query', // Generate TanStack Query hooks
      mock: false,
      override: {
        mutator: {
          path: './src/lib/api-client.ts', // Use our custom Axios instance
          name: 'customInstance',
        },
      },
    },
    input: {
      target: '../backend/openapi.yaml', // Path to the backend source of truth
    },
  },
});
