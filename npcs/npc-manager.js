import { NPC_DIALOGUE_TEXT } from "../dialogue/dialogue-text.js";
import { createOverworldNpcsByRoom as createOverworldNpcMap } from "../overworld/overworld.js";
import { createWorldKeyMap } from "../world/world-keys.js";

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
