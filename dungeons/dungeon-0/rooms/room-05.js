import { createTurretEnemy } from "../../../enemies/enemy-factories.js";
import { createTarget } from "../../../world/room-prop-factories.js";
import {
  createDoor,
  createDungeon0RoomDefinition,
  createOneWayPlatform,
  createWall
} from "../room-helpers.js";

export function createRoom05() {
  return createDungeon0RoomDefinition({
    roomNumber: 6,
    mapPosition: { x: 2, y: 2 },
    doors: {
      left: createDoor("left", 3),
      right: createDoor("right", 8),
      top: createDoor("top", 11, "barred"),
      bottom: createDoor("bottom", 1)
    },
    oneWayPlatforms: [
      createOneWayPlatform(40, 36, 4, 50, "right"),
      createOneWayPlatform(116, 36, 4, 50, "left")
    ],
    internalWalls: [
      createWall(40, 32, 80, 4)
    ],
    createEnemies() {
      return [
        createTurretEnemy({ x: 76, y: 36, shotCooldown: 1.0 })
      ];
    },
    createProps() {
      return [
        createTarget({
          id: "room-6-left-target",
          x: 0,
          y: 4,
          progressFlag: "room6LeftTargetDestroyed"
        }),
        createTarget({
          id: "room-6-right-target",
          x: 152,
          y: 4,
          progressFlag: "room6RightTargetDestroyed"
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      const flags = session.progress.dungeon.flags;

      if (!flags.room6LeftTargetDestroyed || !flags.room6RightTargetDestroyed) {
        return;
      }

      helpers.unlockDoor(activeWorld.rooms[5], "top");
    }
  });
}
