import { createBush, createWallBlock } from "../../../world/room-prop-factories.js";
import { WALL_THICKNESS } from "../../../world/room-constants.js";
import { createOverworld0RoomDefinition } from "../room-helpers.js";

export function createRoom05() {
  return createOverworld0RoomDefinition({
    walls: {
      top: true,
      right: false,
      bottom: true,
      left: false
    },
    neighbors: {
      left: 2,
      right: 6
    },
    createProps() {
      return [
        createWallBlock({ x: 0, y: 0, width: WALL_THICKNESS, height: 36 }),
        createWallBlock({ x: 0, y: 68, width: WALL_THICKNESS, height: 22 }),
        createBush({ x: 56, y: 24 }),
        createBush({ x: 64, y: 24 }),
        createBush({ x: 72, y: 24 }),
        createBush({ x: 104, y: 72 }),
        createBush({ x: 112, y: 72 }),
        createBush({ x: 120, y: 72 })
      ];
    }
  });
}
