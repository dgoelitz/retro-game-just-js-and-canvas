import { createFixedTurretEnemy } from "../../../enemies/enemy-factories.js";
import { createChest } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom06() {
  return createDungeon0RoomDefinition({
    roomNumber: 7,
    mapPosition: { x: 1, y: 1 },
    treasureFlag: "keyChestOpened",
    doors: {
      bottom: createDoor("bottom", 3, "unlocked", { offset: 38 })
    },
    createEnemies() {
      return [
        createFixedTurretEnemy({ x: 0, y: 18, fixedDirection: "right", shotCooldown: 0.9 }),
        createFixedTurretEnemy({ x: 0, y: 42, fixedDirection: "right", shotCooldown: 0.9 }),
        createFixedTurretEnemy({ x: 0, y: 66, fixedDirection: "right", shotCooldown: 0.9 }),
        createFixedTurretEnemy({ x: 152, y: 30, fixedDirection: "left", shotCooldown: 1.0 }),
        createFixedTurretEnemy({ x: 152, y: 54, fixedDirection: "left", shotCooldown: 1.0 })
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-7-key",
          x: 72,
          y: 10,
          rewardKind: "normal-key",
          progressFlag: "keyChestOpened"
        })
      ];
    },
    onUpdate({ session, helpers }) {
      if (!session.progress.dungeon.flags.keyChestOpened) {
        return;
      }

      helpers.killEnemiesByType("fixed-turret");
    }
  });
}
