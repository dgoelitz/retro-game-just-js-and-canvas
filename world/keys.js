export const WORLD_KEY_OVERWORLD = "overworld";
export const WORLD_KEY_DUNGEON = "dungeon";

export function createWorldKeyMap(overworldValue, dungeonValue) {
  return {
    [WORLD_KEY_OVERWORLD]: overworldValue,
    [WORLD_KEY_DUNGEON]: dungeonValue
  };
}
