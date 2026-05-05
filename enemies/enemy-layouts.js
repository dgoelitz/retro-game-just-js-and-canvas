import { createDungeon0EnemiesByRoom } from "../dungeons/dungeon-0/dungeon-0.js";
import { createOverworld0EnemiesByRoom } from "../overworld/overworld-0/overworld-0.js";

export function createOverworldEnemiesByRoom() {
  return createOverworld0EnemiesByRoom();
}

export function createDungeonEnemiesByRoom() {
  return createDungeon0EnemiesByRoom();
}
