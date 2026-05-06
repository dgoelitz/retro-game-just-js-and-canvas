import { createPatrolEnemy } from "../../enemies/enemy-factories.js";
import { createOverworldRoomDefinition } from "../room-helpers.js";

export function createRoom03() {
  return createOverworldRoomDefinition({
    walls: {
      top: false,
      right: true,
      bottom: false,
      left: true
    },
    neighbors: {
      up: 4,
      down: 1
    },
    createEnemies() {
      return [
        createPatrolEnemy({ x: 36, y: 30, patrolMinX: 24, patrolMaxX: 56 }),
        createPatrolEnemy({ x: 76, y: 58, patrolMinX: 64, patrolMaxX: 92 }),
        createPatrolEnemy({ x: 118, y: 34, patrolMinX: 106, patrolMaxX: 136 })
      ];
    }
  });
}
