import {
  GAME_STATE_GAME_OVER,
  getDungeonRespawnDestination,
  getOverworldRespawnDestination,
  setGameOverDestination,
  travelToDestination
} from "../game-state.js";
import { tryTalkToNearbyNpc } from "../npcs/npc-interaction.js";
import { getPlayerHitbox } from "../player/player.js";
import { interactWithRoomProps } from "../world/room-props.js";

export function handleRoomInteraction(session, input, roomState, ctx, canvas) {
  if (!input.interact) {
    return;
  }

  const playerHitbox = getPlayerHitbox(session.player);
  const talkedToNpc = tryTalkToNearbyNpc(session, roomState.roomNpcs, ctx, canvas, playerHitbox);

  if (!talkedToNpc) {
    const interaction = interactWithRoomProps(session, roomState.roomProps, playerHitbox, ctx, canvas);

    if (interaction.destination) {
      travelToDestination(session, interaction.destination);
    }
  }

  input.interact = false;
}

export function updateGameOverStatus(session) {
  if (session.player.health > 0) {
    return;
  }

  session.mode = GAME_STATE_GAME_OVER;
  session.sword.active = false;
  session.shield.active = false;

  if (session.activeWorldKey === "dungeon") {
    setGameOverDestination(session, getDungeonRespawnDestination());
    return;
  }

  setGameOverDestination(session, getOverworldRespawnDestination());
}
