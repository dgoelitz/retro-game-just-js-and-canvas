import { createPatrolEnemy } from "../../enemies/enemy-factories.js";
import { createOverworldRoomDefinition } from "../room-helpers.js";

export function createRoom00() {
  return createOverworldRoomDefinition({
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
