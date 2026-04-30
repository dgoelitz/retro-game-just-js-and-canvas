import { DUNGEON_DIALOGUE_TEXT } from "../../../dialogue/dialogue-text.js";
import { createMinibossEnemy } from "../../../enemies/bosses/miniboss.js";
import { createChest } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom09Miniboss() {
  return createDungeon0RoomDefinition({
    roomNumber: 10,
    mapPosition: { x: 4, y: 2 },
    treasureFlag: "shieldChestOpened",
    doors: {
      left: createDoor("left", 8)
    },
    entryDialogue: {
      flag: "minibossIntroSeen",
      text: DUNGEON_DIALOGUE_TEXT.minibossIntro
    },
    createEnemies() {
      return [
        createMinibossEnemy()
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-10-shield",
          x: 72,
          y: 40,
          rewardKind: "shield",
          progressFlag: "shieldChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      const minibossIsAlive = helpers.hasLivingEnemy("miniboss");

      helpers.setDoorKind(activeWorld.rooms[9], "left", minibossIsAlive ? "barred" : "unlocked");

      if (minibossIsAlive || session.progress.dungeon.flags.minibossDefeated) {
        return;
      }

      session.progress.dungeon.flags.minibossDefeated = true;
      helpers.startRoomDialogue(DUNGEON_DIALOGUE_TEXT.minibossDefeated, {
        onComplete() {
          helpers.revealRoomProp("room-10-shield");
        }
      });
    }
  });
}
