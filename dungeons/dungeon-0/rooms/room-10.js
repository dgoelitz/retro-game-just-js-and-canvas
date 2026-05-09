import { createFixedTurretEnemy } from "../../../enemies/setup/factories.js";
import { createChest } from "../../../world/props/factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../helpers.js";

export function createRoom10() {
  return createDungeon0RoomDefinition({
    roomNumber: 11,
    mapPosition: { x: 3, y: 1 },
    treasureFlag: "heartPieceChestOpened",
    doors: {
      left: createDoor("left", 11, "barred"),
      bottom: createDoor("bottom", 8)
    },
    createEnemies() {
      return [
        createFixedTurretEnemy({ x: 0, y: 28, fixedDirection: "right", shotCooldown: 1.1 }),
        createFixedTurretEnemy({ x: 0, y: 56, fixedDirection: "right", shotCooldown: 0.9 }),
        createFixedTurretEnemy({ x: 152, y: 14, fixedDirection: "left", shotCooldown: 0.9 }),
        createFixedTurretEnemy({ x: 152, y: 42, fixedDirection: "left", shotCooldown: 1.1 }),
        createFixedTurretEnemy({ x: 24, y: 0, fixedDirection: "down", shotCooldown: 1.2 }),
        createFixedTurretEnemy({ x: 128, y: 0, fixedDirection: "down", shotCooldown: 1.2 })
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-11-heart-piece",
          x: 72,
          y: 40,
          rewardKind: "piece-of-heart",
          progressFlag: "heartPieceChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ helpers }) {
      if (helpers.areAllEnemiesDefeated()) {
        helpers.revealRoomProp("room-11-heart-piece");
      }
    }
  });
}
