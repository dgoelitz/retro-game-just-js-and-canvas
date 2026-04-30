import { createDungeon0RoomPropsByRoom } from "../dungeons/dungeon-0/dungeon-0.js";
import { WALL_THICKNESS } from "./room-constants.js";
import {
  createBush,
  createDungeonEntrance,
  createWallBlock
} from "./room-prop-factories.js";

export function createOverworldRoomPropsByRoom() {
  return {
    2: [
      createWallBlock({ x: 156, y: 0, width: WALL_THICKNESS, height: 36 }),
      createBush({ x: 152, y: 36 }),
      createBush({ x: 152, y: 44 }),
      createBush({ x: 152, y: 52 }),
      createBush({ x: 152, y: 60 }),
      createWallBlock({ x: 156, y: 68, width: WALL_THICKNESS, height: 22 })
    ],
    5: [
      createWallBlock({ x: 0, y: 0, width: WALL_THICKNESS, height: 36 }),
      createWallBlock({ x: 0, y: 68, width: WALL_THICKNESS, height: 22 }),
      createBush({ x: 56, y: 24 }),
      createBush({ x: 64, y: 24 }),
      createBush({ x: 72, y: 24 }),
      createBush({ x: 104, y: 72 }),
      createBush({ x: 112, y: 72 }),
      createBush({ x: 120, y: 72 })
    ],
    6: [
      createBush({ x: 28, y: 78 }),
      createBush({ x: 36, y: 78 }),
      createBush({ x: 44, y: 78 }),
      createBush({ x: 100, y: 78 }),
      createBush({ x: 108, y: 78 }),
      createBush({ x: 116, y: 78 }),
      createDungeonEntrance({
        x: 66,
        y: 12,
        destination: {
          worldKey: "dungeon",
          roomIndex: 0,
          playerX: 76,
          playerY: 66
        }
      })
    ]
  };
}

export function createDungeonRoomPropsByRoom() {
  return createDungeon0RoomPropsByRoom();
}
