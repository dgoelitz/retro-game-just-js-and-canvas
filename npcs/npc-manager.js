import { createNpc } from "./npc.js";

const FIRST_DIALOGUE_PAGES = [
  "Welcome to the town.",
  "You've been out in the wilderness?",
  "That's not safe without a sword!",
  "Here I have a cheap one you can have."
];

const REPEAT_DIALOGUE_PAGES = [
  "Treat that sword well and it will treat you well."
];

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

export function getNpcDialogue(npc, session) {
  if (npc.id === "town-guide" && !session.hasSword) {
    return {
      pages: FIRST_DIALOGUE_PAGES,
      rewardSword: true
    };
  }

  return {
    pages: REPEAT_DIALOGUE_PAGES,
    rewardSword: false
  };
}
