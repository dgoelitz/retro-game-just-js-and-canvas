import { startDialogue } from "../dialogue/dialogue-state.js";
import { createDialoguePages } from "../dialogue/dialogue-pages.js";
import { getPlayerHitbox, getPlayerPosition, setPlayerPosition } from "../player/player.js";
import { canTalkToNpc, touchesNpc } from "./npc.js";
import { getNpcDialogue } from "./npc-manager.js";

export function resolveNpcCollisions(player, previousPosition, roomNpcs) {
  const movedHitbox = getPlayerHitbox(player);

  if (!overlapsAnyNpc(roomNpcs, movedHitbox)) {
    return;
  }

  const movedPosition = getPlayerPosition(player);

  setPlayerPosition(player, {
    x: previousPosition.x,
    y: movedPosition.y
  });

  if (!overlapsAnyNpc(roomNpcs, getPlayerHitbox(player))) {
    return;
  }

  setPlayerPosition(player, {
    x: movedPosition.x,
    y: previousPosition.y
  });

  if (!overlapsAnyNpc(roomNpcs, getPlayerHitbox(player))) {
    return;
  }

  setPlayerPosition(player, previousPosition);
}

export function tryTalkToNearbyNpc(session, roomNpcs, ctx, canvas, playerHitbox) {
  for (const npc of roomNpcs) {
    if (!canTalkToNpc(npc, playerHitbox)) {
      continue;
    }

    const dialogueData = getNpcDialogue(npc, session.inventory.hasSword);
    const dialoguePages = createDialoguePages(ctx, canvas, dialogueData.text);
    startDialogue(session, dialoguePages, {
      onComplete: dialogueData.onComplete
    });
    return true;
  }

  return false;
}

function overlapsAnyNpc(roomNpcs, playerHitbox) {
  for (const npc of roomNpcs) {
    if (touchesNpc(npc, playerHitbox)) {
      return true;
    }
  }

  return false;
}
