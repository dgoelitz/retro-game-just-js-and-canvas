import { createPatrolEnemy } from "../../../enemies/enemy-factories.js";
import { createDungeonExit } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom00() {
  return createDungeon0RoomDefinition({
    roomNumber: 1,
    mapPosition: { x: 2, y: 4 },
    doors: {
      top: createDoor("top", 1, "barred")
    },
    createEnemies() {
      return [
        createPatrolEnemy({ x: 56, y: 18, patrolMinX: 28, patrolMaxX: 68 }),
        createPatrolEnemy({ x: 76, y: 26, patrolMinX: 64, patrolMaxX: 96 }),
        createPatrolEnemy({ x: 96, y: 18, patrolMinX: 92, patrolMaxX: 124 })
      ];
    },
    createProps() {
      return [
        createDungeonExit({
          x: 66,
          y: 72,
          destination: {
            worldKey: "overworld",
            roomIndex: 6,
            playerX: 76,
            playerY: 24
          }
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      if (!helpers.areAllEnemiesDefeated()) {
        return;
      }

      helpers.unlockDoor(activeWorld.rooms[0], "top");
      session.progress.dungeon.flags.room1Cleared = true;
    }
  });
}
