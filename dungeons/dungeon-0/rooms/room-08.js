import { createSnakePair } from "../../../enemies/setup/factories.js";
import {
  createDoor,
  createDungeon0RoomDefinition,
  createWall
} from "../helpers.js";

export function createRoom08() {
  return createDungeon0RoomDefinition({
    roomNumber: 9,
    mapPosition: { x: 3, y: 2 },
    doors: {
      left: createDoor("left", 5),
      right: createDoor("right", 9, "key"),
      top: createDoor("top", 10),
      bottom: createDoor("bottom", 7)
    },
    internalWalls: [
      createWall(36, 36, 88, 18)
    ],
    createEnemies() {
      return [
        ...createSnakePair({
          pathRect: { left: 4, top: 4, right: 148, bottom: 78 },
          pathProgress: 12,
          pathDirection: 1
        }),
        ...createSnakePair({
          pathRect: { left: 16, top: 16, right: 136, bottom: 66 },
          pathProgress: 72,
          pathDirection: -1
        }),
        ...createSnakePair({
          pathRect: { left: 28, top: 28, right: 124, bottom: 54 },
          pathProgress: 120,
          pathDirection: 1
        })
      ];
    }
  });
}
