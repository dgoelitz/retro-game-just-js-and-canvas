import {
  createFixedTurretEnemy,
  createPatrolEnemy,
  createStoneEnemy,
  createTurretEnemy
} from "../../../enemies/enemy-factories.js";
import { createChest } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom04() {
  return createDungeon0RoomDefinition({
    roomNumber: 5,
    mapPosition: { x: 0, y: 2 },
    treasureFlag: "bossKeyChestOpened",
    doors: {
      right: createDoor("right", 3, "unlocked", { offset: 14 })
    },
    createEnemies() {
      return [
        createPatrolEnemy({ x: 42, y: 30, patrolMinX: 28, patrolMaxX: 60 }),
        createPatrolEnemy({ x: 110, y: 60, patrolMinX: 90, patrolMaxX: 126 }),
        createStoneEnemy({ x: 34, y: 60, orbitRadiusX: 8, orbitRadiusY: 10 }),
        createStoneEnemy({ x: 96, y: 58, orbitRadiusX: 8, orbitRadiusY: 10 }),
        createFixedTurretEnemy({ x: 0, y: 16, fixedDirection: "right", shotCooldown: 1.2 }),
        createFixedTurretEnemy({ x: 152, y: 48, fixedDirection: "left", shotCooldown: 0.9 }),
        createTurretEnemy({ x: 76, y: 0, shotCooldown: 1.0 })
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-5-boss-key",
          x: 72,
          y: 40,
          rewardKind: "boss-key",
          progressFlag: "bossKeyChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ helpers }) {
      if (!helpers.areAllKillableEnemiesDefeated()) {
        return;
      }

      helpers.killEnemiesByType("turret");
      helpers.revealRoomProp("room-5-boss-key");
    }
  });
}
