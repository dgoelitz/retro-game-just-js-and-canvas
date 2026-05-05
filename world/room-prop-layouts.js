import { createDungeon0RoomPropsByRoom } from "../dungeons/dungeon-0/dungeon-0.js";
import { createOverworld0RoomPropsByRoom } from "../overworld/overworld-0/overworld-0.js";

export function createOverworldRoomPropsByRoom() {
  return createOverworld0RoomPropsByRoom();
}

export function createDungeonRoomPropsByRoom() {
  return createDungeon0RoomPropsByRoom();
}
