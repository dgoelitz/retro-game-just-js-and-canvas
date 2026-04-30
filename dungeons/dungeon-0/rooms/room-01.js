import { createTurretEnemy } from "../../../enemies/enemy-factories.js";
import { createTarget } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom01() {
  return createDungeon0RoomDefinition({
    roomNumber: 2,
    mapPosition: { x: 2, y: 3 },
    doors: {
      left: createDoor("left", 2),
      right: createDoor("right", 7),
      top: createDoor("top", 5, "barred"),
      bottom: createDoor("bottom", 0)
    },
    createEnemies() {
      return [
        createTurretEnemy({ x: 32, y: 0, shotCooldown: 1.2 })
      ];
    },
    createProps() {
      return [
        createTarget({
          id: "room-2-target",
          x: 120,
          y: 0,
          progressFlag: "room2TargetDestroyed"
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      if (!session.progress.dungeon.flags.room2TargetDestroyed) {
        return;
      }

      helpers.unlockDoor(activeWorld.rooms[1], "top");
    }
  });
}
