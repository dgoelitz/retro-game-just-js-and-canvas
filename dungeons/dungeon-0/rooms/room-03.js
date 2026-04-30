import { createFixedTurretEnemy } from "../../../enemies/enemy-factories.js";
import {
  createDoor,
  createDungeon0RoomDefinition,
  createWall
} from "../room-helpers.js";

export function createRoom03() {
  return createDungeon0RoomDefinition({
    roomNumber: 4,
    mapPosition: { x: 1, y: 2 },
    doors: {
      left: createDoor("left", 4, "unlocked", { offset: 14 }),
      right: createDoor("right", 5),
      top: createDoor("top", 6, "unlocked", { offset: 38 }),
      bottom: createDoor("bottom", 2)
    },
    internalWalls: [
      createWall(0, 67, 120, 4),
      createWall(30, 0, 4, 45),
      createWall(30, 33, 90, 16)
    ],
    createEnemies() {
      return [
        createFixedTurretEnemy({ x: 0, y: 75, fixedDirection: "right", shotCooldown: 1.4 }),
        createFixedTurretEnemy({ x: 0, y: 54, fixedDirection: "right", shotCooldown: 0.8 }),
        createFixedTurretEnemy({
          x: 152,
          y: 9,
          fixedDirection: "left",
          shotCooldown: 1.0,
          shootTimer: 0,
          projectileSpeed: 86
        }),
        createFixedTurretEnemy({
          x: 152,
          y: 20,
          fixedDirection: "left",
          shotCooldown: 1.0,
          shootTimer: 0.5,
          projectileSpeed: 86
        })
      ];
    }
  });
}
