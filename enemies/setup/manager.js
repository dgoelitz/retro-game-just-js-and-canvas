import { createWorldKeyMap } from "../../world/keys.js";
import { createDungeonEnemiesByRoom, createOverworldEnemiesByRoom } from "./layouts.js";

export function createEnemiesByWorldKey() {
  return createWorldKeyMap(
    createOverworldEnemiesByRoom(),
    createDungeonEnemiesByRoom()
  );
}
