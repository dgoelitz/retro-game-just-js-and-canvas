import { DUNGEON_DIALOGUE_TEXT } from "../../../dialogue/text.js";
import { createBossEnemy } from "../../../enemies/bosses/final-boss.js";
import { createChest } from "../../../world/props/factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../helpers.js";

export function createRoom12Boss() {
  return createDungeon0RoomDefinition({
    roomNumber: 13,
    mapPosition: { x: 2, y: 0 },
    treasureFlag: "finalTreasureChestOpened",
    doors: {
      bottom: createDoor("bottom", 11)
    },
    entryDialogue: {
      flag: "bossIntroSeen",
      text: DUNGEON_DIALOGUE_TEXT.bossIntro
    },
    createEnemies() {
      return [
        createBossEnemy()
      ];
    },
    createProps() {
      return [
        createChest({
          id: "room-13-final-treasure",
          x: 72,
          y: 40,
          rewardKind: "final-treasure",
          progressFlag: "finalTreasureChestOpened",
          hidden: true
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      const bossIsAlive = helpers.hasLivingEnemy("boss");

      helpers.setDoorKind(activeWorld.rooms[11], "top", bossIsAlive ? "barred" : "unlocked");
      helpers.setDoorKind(activeWorld.rooms[12], "bottom", bossIsAlive ? "barred" : "unlocked");

      if (bossIsAlive || session.progress.dungeon.flags.bossDefeated) {
        return;
      }

      session.progress.dungeon.flags.bossDefeated = true;
      helpers.startRoomDialogue(DUNGEON_DIALOGUE_TEXT.bossDefeated, {
        onComplete() {
          helpers.revealRoomProp("room-13-final-treasure");
        }
      });
    }
  });
}
