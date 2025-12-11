import * as migration_20251211_110626_init from './20251211_110626_init';

export const migrations = [
  {
    up: migration_20251211_110626_init.up,
    down: migration_20251211_110626_init.down,
    name: '20251211_110626_init'
  },
];
