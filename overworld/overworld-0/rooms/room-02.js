import { createBush, createWallBlock } from "../../../world/room-prop-factories.js";
import { WALL_THICKNESS } from "../../../world/room-constants.js";
import { createOverworld0RoomDefinition } from "../room-helpers.js";

export function createRoom02() {
  return createOverworld0RoomDefinition({
    walls: {
      top: true,
      right: false,
      bottom: true,
      left: false
    },
    neighbors: {
      left: 1,
      right: 5
    },
    createProps() {
      return [
        createWallBlock({ x: 156, y: 0, width: WALL_THICKNESS, height: 36 }),
        createBush({ x: 152, y: 36 }),
        createBush({ x: 152, y: 44 }),
        createBush({ x: 152, y: 52 }),
        createBush({ x: 152, y: 60 }),
        createWallBlock({ x: 156, y: 68, width: WALL_THICKNESS, height: 22 })
      ];
    }
  });
}
