import { createDungeonEnemiesByRoom, createOverworldEnemiesByRoom } from "./enemy-layouts.js";

export function createEnemiesByWorldKey() {
  return {
    overworld: createOverworldEnemiesByRoom(),
    dungeon: createDungeonEnemiesByRoom()
  };
}
