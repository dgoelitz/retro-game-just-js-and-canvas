import { NPC_DIALOGUE_TEXT } from "../dialogue/dialogue-text.js";
import { createNpc } from "./npc.js";

export function createNpcsByRoom() {
  return {
    4: [
      createNpc({
        id: "town-guide",
        x: 72,
        y: 44
      })
    ]
  };
}

export function createNpcsByWorldKey() {
  return {
    overworld: createNpcsByRoom(),
    dungeon: {}
  };
}

export function getNpcDialogue(npc, hasSword) {
  if (npc.id === "town-guide" && !hasSword) {
    return {
      text: NPC_DIALOGUE_TEXT.townGuideFirstMeeting,
      onComplete(session) {
        session.inventory.hasSword = true;
      }
    };
  }

  return {
    text: NPC_DIALOGUE_TEXT.townGuideRepeat,
    onComplete: null
  };
}
