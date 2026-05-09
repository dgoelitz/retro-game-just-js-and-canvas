import { handleDungeonRoomEntry, updateDungeonRoomRules } from "../dungeon/rules.js";
import { GAME_STATE_PLAYING } from "./session.js";
import { tickTimer } from "../utils.js";
import { getPlayerHitbox, getPlayerPosition, updatePlayer } from "../player/player.js";
import { resolveWeightSwitches } from "../world/props/behavior.js";
import { handleBlockedDoorAtRoomEdge } from "../world/doors/interaction.js";
import { updateRoomCombat } from "./combat.js";
import { handleRoomInteraction, updateGameOverStatus } from "./interaction.js";
import {
  getActiveRoomState,
  resolvePlayerCollisions,
  tryHandleRoomTransition,
  tryOpenMap
} from "./room-state.js";

export function updatePlayingState(session, input, ctx, canvas, deltaTime, worldState) {
  tickTimer(session, "roomEntryGraceTimer", deltaTime);

  if (tryOpenMap(session, input)) {
    return;
  }

  handleDungeonRoomEntry(session, ctx, canvas);

  if (session.mode !== GAME_STATE_PLAYING) {
    return;
  }

  const roomState = getActiveRoomState(worldState);
  const previousPlayerPosition = getPlayerPosition(session.player);

  updatePlayer(
    session.player,
    session.sword,
    session.shield,
    input,
    deltaTime,
    session.inventory.hasSword,
    session.inventory.hasShield
  );

  resolvePlayerCollisions(session, previousPlayerPosition, roomState, worldState.activeWorld);

  if (handleBlockedDoorAtRoomEdge(session, roomState.roomEnemies, worldState.activeWorld, ctx, canvas)) {
    return;
  }

  if (tryHandleRoomTransition(session, roomState.roomIndex, worldState.activeProjectilesByRoom, canvas)) {
    return;
  }

  updateDungeonRoomRules(session, ctx, canvas);
  updateRoomCombat(session, previousPlayerPosition, deltaTime, canvas, roomState);
  resolveWeightSwitches(session, roomState.roomProps, getPlayerHitbox(session.player));
  updateDungeonRoomRules(session, ctx, canvas);
  handleRoomInteraction(session, input, roomState, ctx, canvas);
  updateGameOverStatus(session);
  input.map = false;
}
