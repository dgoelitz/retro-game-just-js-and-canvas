import { createDungeon0EnemiesByRoom } from "../../dungeons/dungeon-0/dungeon.js";
import { createOverworldEnemiesByRoom as createOverworldEnemyMap } from "../../overworld/overworld.js";

export function createOverworldEnemiesByRoom() {
  return createOverworldEnemyMap();
}

export function createDungeonEnemiesByRoom() {
  return createDungeon0EnemiesByRoom();
}
