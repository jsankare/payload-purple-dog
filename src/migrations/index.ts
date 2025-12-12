import * as migration_20251211_235038_init from './20251211_235038_init';

export const migrations = [
  {
    up: migration_20251211_235038_init.up,
    down: migration_20251211_235038_init.down,
    name: '20251211_235038_init'
  },
];
