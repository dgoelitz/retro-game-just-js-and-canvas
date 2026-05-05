import { NPC_DIALOGUE_TEXT } from "../dialogue/dialogue-text.js";
import { createOverworld0NpcsByRoom } from "../overworld/overworld-0/overworld-0.js";

export function createOverworldNpcsByRoom() {
  return createOverworld0NpcsByRoom();
}

export function createNpcsByWorldKey() {
  return {
    overworld: createOverworldNpcsByRoom(),
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
