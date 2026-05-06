import { createDungeon0Rooms } from "../dungeons/dungeon-0/dungeon-0.js";
import { createOverworldRooms as createOverworldRoomDefinitions } from "../overworld/overworld.js";
export { WALL_COLOR, WALL_THICKNESS, ROOM_BACKGROUND_COLOR, DOOR_WIDTH } from "./room-constants.js";

export function createOverworldRooms() {
  return createOverworldRoomDefinitions();
}

export function createDungeonRooms() {
  return createDungeon0Rooms();
}
