import { createWorldKeyMap } from "../game-utils.js";
import { createDungeonEnemiesByRoom, createOverworldEnemiesByRoom } from "./enemy-layouts.js";

export function createEnemiesByWorldKey() {
  return createWorldKeyMap(
    createOverworldEnemiesByRoom(),
    createDungeonEnemiesByRoom()
  );
}
