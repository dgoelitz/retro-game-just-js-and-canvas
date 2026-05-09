import { createPatrolEnemy } from "../../../enemies/setup/factories.js";
import { createChest } from "../../../world/props/factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../helpers.js";

export function createRoom07() {
  return createDungeon0RoomDefinition({
    roomNumber: 8,
    mapPosition: { x: 3, y: 3 },
    treasureFlag: "compassChestOpened",
    doors: {
      left: createDoor("left", 1),
      top: createDoor("top", 8)
    },
    createEnemies() {
      return [
        createPatrolEnemy({ x: 42, y: 26, patrolMinX: 26, patrolMaxX: 58 }),
        createPatrolEnemy({ x: 68, y: 60, patrolMinX: 52, patrolMaxX: 84 }),
        createPatrolEnemy({ x: 96, y: 26, patrolMinX: 84, patrolMaxX: 112 }),
        createPatrolEnemy({ x: 118, y: 60, patrolMinX: 108, patrolMaxX: 134 })
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-8-compass",
          x: 72,
          y: 40,
          rewardKind: "compass",
          progressFlag: "compassChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ helpers }) {
      if (helpers.areAllEnemiesDefeated()) {
        helpers.revealRoomProp("room-8-compass");
      }
    }
  });
}
