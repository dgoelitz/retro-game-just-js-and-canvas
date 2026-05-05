import { createPatrolEnemy } from "../../../enemies/enemy-factories.js";
import { createOverworld0RoomDefinition } from "../room-helpers.js";

export function createRoom00() {
  return createOverworld0RoomDefinition({
    walls: {
      top: true,
      right: false,
      bottom: true,
      left: true
    },
    neighbors: {
      right: 1
    },
    createEnemies() {
      return [
        createPatrolEnemy()
      ];
    }
  });
}
