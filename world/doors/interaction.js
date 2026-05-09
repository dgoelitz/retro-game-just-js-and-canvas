import { startTextDialogue } from "../../dialogue/helpers.js";
import { BLOCKED_DOOR_DIALOGUE_BY_KIND } from "../../dialogue/text.js";
import { constrainPlayerToRoom, getBlockedDoorKindAtRoomEdge } from "../index.js";

export function handleBlockedDoorAtRoomEdge(session, roomEnemies, activeWorld, ctx, canvas) {
  const blockedDoorKind = getBlockedDoorKindAtRoomEdge(session.player, activeWorld, canvas, session.inventory);

  if (!shouldShowBlockedDoorMessage(session, blockedDoorKind, roomEnemies)) {
    return false;
  }

  session.blockedDoorMessagesShown[blockedDoorKind] = true;
  constrainPlayerToRoom(session.player, activeWorld, canvas, session.inventory);
  startBlockedDoorDialogue(session, blockedDoorKind, ctx, canvas);
  return true;
}

function shouldShowBlockedDoorMessage(session, doorKind, roomEnemies) {
  if (!doorKind || session.blockedDoorMessagesShown[doorKind]) {
    return false;
  }

  if (doorKind === "barred" && hasActiveBossFight(roomEnemies)) {
    return false;
  }

  return true;
}

function hasActiveBossFight(roomEnemies) {
  return roomEnemies.some((enemy) => enemy.alive && (enemy.type === "boss" || enemy.type === "miniboss"));
}

function startBlockedDoorDialogue(session, doorKind, ctx, canvas) {
  const message = BLOCKED_DOOR_DIALOGUE_BY_KIND[doorKind];

  if (!message) {
    return;
  }

  startTextDialogue(session, ctx, canvas, message);
}
