import { createBush, createDungeonEntrance } from "../../world/room-prop-factories.js";
import { WORLD_KEY_DUNGEON } from "../../world/world-keys.js";
import { createOverworldRoomDefinition } from "../room-helpers.js";

export function createRoom06() {
  return createOverworldRoomDefinition({
    walls: {
      top: true,
      right: true,
      bottom: true,
      left: false
    },
    neighbors: {
      left: 5
    },
    createProps() {
      return [
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
            worldKey: WORLD_KEY_DUNGEON,
            roomIndex: 0,
            playerX: 76,
            playerY: 66
          }
        })
      ];
    }
  });
}
