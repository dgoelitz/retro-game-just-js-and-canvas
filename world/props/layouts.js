import { createDungeon0RoomPropsByRoom } from "../../dungeons/dungeon-0/dungeon.js";
import { createOverworldRoomPropsByRoom as createOverworldPropMap } from "../../overworld/overworld.js";

export function createOverworldRoomPropsByRoom() {
  return createOverworldPropMap();
}

export function createDungeonRoomPropsByRoom() {
  return createDungeon0RoomPropsByRoom();
}
