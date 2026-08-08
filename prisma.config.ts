import path from 'node:path';
import { defineConfig } from 'prisma/config';

const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url,
  },
});
