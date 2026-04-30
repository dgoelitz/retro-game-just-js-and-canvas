import { createStoneEnemy, createTurretEnemy } from "../../../enemies/enemy-factories.js";
import { createChest } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom02() {
  return createDungeon0RoomDefinition({
    roomNumber: 3,
    mapPosition: { x: 1, y: 3 },
    treasureFlag: "mapChestOpened",
    doors: {
      right: createDoor("right", 1),
      top: createDoor("top", 3)
    },
    createEnemies() {
      return [
        createStoneEnemy({ x: 42, y: 30, orbitRadiusX: 10, orbitRadiusY: 10, orbitAngle: 0 }),
        createStoneEnemy({ x: 74, y: 56, orbitRadiusX: 8, orbitRadiusY: 8, orbitAngle: Math.PI * 0.66 }),
        createStoneEnemy({ x: 32, y: 60, orbitRadiusX: 10, orbitRadiusY: 10, orbitAngle: Math.PI * 1.2 }),
        createTurretEnemy({ x: 32, y: 0, shotCooldown: 1.1 })
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-3-map",
          x: 72,
          y: 40,
          rewardKind: "map",
          progressFlag: "mapChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ helpers }) {
      if (helpers.countLivingEnemies("stone") > 0) {
        return;
      }

      helpers.killEnemiesByType("turret");
      helpers.revealRoomProp("room-3-map");
    }
  });
}
