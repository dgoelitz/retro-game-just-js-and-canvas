import { GAME_STATE_DIALOGUE, GAME_STATE_PLAYING } from "../game-state.js";
import { DIALOGUE_CHARACTERS_PER_SECOND } from "./dialogue-config.js";

export function startDialogue(session, dialoguePages, rewardSword) {
  session.dialogue = {
    pages: dialoguePages,
    pageIndex: 0,
    visibleCharacters: 0,
    rewardSword
  };
  session.mode = GAME_STATE_DIALOGUE;
  session.sword.active = false;
}

export function advanceDialogue(session, input) {
  input.attack = false;
  input.interact = false;

  if (!session.dialogue) {
    session.mode = GAME_STATE_PLAYING;
    return;
  }

  const currentPage = session.dialogue.pages[session.dialogue.pageIndex];
  const currentPageLength = getPageCharacterCount(currentPage);

  if (session.dialogue.visibleCharacters < currentPageLength) {
    session.dialogue.visibleCharacters = currentPageLength;
    return;
  }

  if (session.dialogue.pageIndex < session.dialogue.pages.length - 1) {
    session.dialogue.pageIndex += 1;
    session.dialogue.visibleCharacters = 0;
    return;
  }

  if (session.dialogue.rewardSword) {
    session.hasSword = true;
  }

  session.dialogue = null;
  session.mode = GAME_STATE_PLAYING;
}

export function updateDialogue(dialogue, deltaTime) {
  if (!dialogue) {
    return;
  }

  const currentPage = dialogue.pages[dialogue.pageIndex];
  const currentPageLength = getPageCharacterCount(currentPage);

  if (dialogue.visibleCharacters >= currentPageLength) {
    dialogue.visibleCharacters = currentPageLength;
    return;
  }

  dialogue.visibleCharacters += DIALOGUE_CHARACTERS_PER_SECOND * deltaTime;

  if (dialogue.visibleCharacters > currentPageLength) {
    dialogue.visibleCharacters = currentPageLength;
  }
}

function getPageCharacterCount(page) {
  if (!page || page.length === 0) {
    return 0;
  }

  const charactersInLines = page.reduce((total, line) => total + line.length, 0);
  const spacesBetweenLines = page.length - 1;

  return charactersInLines + spacesBetweenLines;
}
