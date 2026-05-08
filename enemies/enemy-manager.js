import { createWorldKeyMap } from "../world/world-keys.js";
import { createDungeonEnemiesByRoom, createOverworldEnemiesByRoom } from "./enemy-layouts.js";

export function createEnemiesByWorldKey() {
  return createWorldKeyMap(
    createOverworldEnemiesByRoom(),
    createDungeonEnemiesByRoom()
  );
}
