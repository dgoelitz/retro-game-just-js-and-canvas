import { createPatrolEnemy } from "../../../enemies/enemy-factories.js";
import { createOverworld0RoomDefinition } from "../room-helpers.js";

export function createRoom01() {
  return createOverworld0RoomDefinition({
    walls: {
      top: false,
      right: false,
      bottom: true,
      left: false
    },
    neighbors: {
      left: 0,
      right: 2,
      up: 3
    },
    createEnemies() {
      return [
        createPatrolEnemy({ x: 52, y: 32, patrolMinX: 40, patrolMaxX: 72 }),
        createPatrolEnemy({ x: 104, y: 64, patrolMinX: 92, patrolMaxX: 124 })
      ];
    }
  });
}
