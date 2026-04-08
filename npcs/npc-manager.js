import { createNpc } from "./npc.js";

const FIRST_DIALOGUE_TEXT = "Welcome to the town. You've been out in the wilderness? That's not safe without a sword! Here I have a cheap one you can have.";

const REPEAT_DIALOGUE_TEXT = "Treat that sword well and it will treat you well.";

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
      text: FIRST_DIALOGUE_TEXT,
      onComplete(session) {
        session.inventory.hasSword = true;
      }
    };
  }

  return {
    text: REPEAT_DIALOGUE_TEXT,
    onComplete: null
  };
}
