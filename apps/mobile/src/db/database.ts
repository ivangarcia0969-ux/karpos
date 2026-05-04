import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (err) => {
    console.error('WatermelonDB setup error', err);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [],
});
