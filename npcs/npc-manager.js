import { NPC_DIALOGUE_TEXT } from "../dialogue/dialogue-text.js";
import { createWorldKeyMap } from "../game-utils.js";
import { createOverworldNpcsByRoom as createOverworldNpcMap } from "../overworld/overworld.js";

export function createOverworldNpcsByRoom() {
  return createOverworldNpcMap();
}

export function createNpcsByWorldKey() {
  return createWorldKeyMap(createOverworldNpcsByRoom(), {});
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
