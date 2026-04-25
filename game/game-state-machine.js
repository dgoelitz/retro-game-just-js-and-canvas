import { startOpeningHintDialogue } from "../dialogue/dialogue-helpers.js";
import { advanceDialogue, updateDialogue } from "../dialogue/dialogue-state.js";
import {
  applyDebugStart,
  createGameSession,
  GAME_STATE_DIALOGUE,
  GAME_STATE_GAME_OVER,
  GAME_STATE_MAP,
  GAME_STATE_PLAYING,
  getActiveEnemiesByRoom,
  getActiveNpcsByRoom,
  getActiveProjectilesByRoom,
  getActiveRoomPropsByRoom,
  getActiveWorld,
  respawnAfterGameOver
} from "../game-state.js";
import { handleWorldTransition, isTransitioning } from "../world/world.js";
import { updatePlayingState } from "./gameplay-update.js";

export function createGameRuntime(ctx, canvas, input, debugStartKey = "") {
  const session = createGameSession();

  initializeSession(session, ctx, canvas, debugStartKey);

  return {
    session,
    update(deltaTime) {
      updateGame(session, input, ctx, canvas, deltaTime);
    }
  };
}

function initializeSession(session, ctx, canvas, debugStartKey) {
  if (debugStartKey) {
    applyDebugStart(session, debugStartKey);
    return;
  }

  startOpeningHintDialogue(session, ctx, canvas);
}

function updateGame(session, input, ctx, canvas, deltaTime) {
  const worldState = getWorldState(session);

  if (session.mode === GAME_STATE_GAME_OVER) {
    updateGameOverState(session, input);
    return;
  }

  if (session.mode === GAME_STATE_DIALOGUE) {
    updateDialogueState(session, input, deltaTime);
    return;
  }

  if (session.mode === GAME_STATE_MAP) {
    updateMapState(session, input);
    return;
  }

  if (isTransitioning(worldState.activeWorld)) {
    handleWorldTransition(
      worldState.activeWorld,
      session.player,
      worldState.activeRoomPropsByRoom,
      canvas,
      deltaTime
    );
    return;
  }

  updatePlayingState(session, input, ctx, canvas, deltaTime, worldState);
}

function getWorldState(session) {
  return {
    activeWorld: getActiveWorld(session),
    activeEnemiesByRoom: getActiveEnemiesByRoom(session),
    activeNpcsByRoom: getActiveNpcsByRoom(session),
    activeRoomPropsByRoom: getActiveRoomPropsByRoom(session),
    activeProjectilesByRoom: getActiveProjectilesByRoom(session)
  };
}

function updateGameOverState(session, input) {
  if (!input.attack && !input.interact) {
    return;
  }

  respawnAfterGameOver(session);
  input.attack = false;
  input.interact = false;
}

function updateDialogueState(session, input, deltaTime) {
  updateDialogue(session.dialogue, deltaTime);

  if (input.attack || input.interact) {
    advanceDialogue(session, input);
  }
}

function updateMapState(session, input) {
  if (!input.map) {
    return;
  }

  session.mode = GAME_STATE_PLAYING;
  input.map = false;
}
