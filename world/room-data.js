import { createDungeon0Rooms } from "../dungeons/dungeon-0/dungeon-0.js";
import { createOverworld0Rooms } from "../overworld/overworld-0/overworld-0.js";
export { WALL_COLOR, WALL_THICKNESS, ROOM_BACKGROUND_COLOR, DOOR_WIDTH } from "./room-constants.js";

export function createOverworldRooms() {
  return createOverworld0Rooms();
}

export function createDungeonRooms() {
  return createDungeon0Rooms();
}
