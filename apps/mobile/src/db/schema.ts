import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'farms',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'org_id', type: 'string', isIndexed: true },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'country_code', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'plots',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'farm_id', type: 'string', isIndexed: true },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'species_code', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'field_operations',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'plot_id', type: 'string', isIndexed: true },
        { name: 'operation_type', type: 'string' },
        { name: 'performed_at', type: 'number' },
        { name: 'crew_id', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'harvest_lots',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'plot_id', type: 'string', isIndexed: true },
        { name: 'lot_code', type: 'string' },
        { name: 'harvested_on', type: 'number' },
        { name: 'gross_kg', type: 'number' },
        { name: 'tare_kg', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
