import { createDialoguePages } from "./dialogue-pages.js";
import { startDialogue } from "./dialogue-state.js";
import { GAME_DIALOGUE_TEXT } from "./dialogue-text.js";

export function startTextDialogue(session, ctx, canvas, text, options = {}) {
  startDialogue(session, createDialoguePages(ctx, canvas, text), options);
}

export function startOpeningHintDialogue(session, ctx, canvas) {
  startTextDialogue(session, ctx, canvas, GAME_DIALOGUE_TEXT.openingHint);
}
