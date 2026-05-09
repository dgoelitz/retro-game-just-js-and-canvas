import { createPatrolEnemy } from "../../enemies/setup/factories.js";
import { createOverworldRoomDefinition } from "../helpers.js";

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
