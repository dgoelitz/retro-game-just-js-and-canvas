import { GAME_STATE_MAP, getActiveWorld } from "../game-state.js";
import { constrainPlayerToRoom, resolveRoomGeometryCollisions, tryStartRoomTransition } from "../world/world.js";
import { resolveNpcCollisions } from "../npcs/npc-interaction.js";
import { resolveRoomPropCollisions } from "../world/room-props.js";

export function tryOpenMap(session, input) {
  if (!input.map || session.activeWorldKey !== "dungeon") {
    return false;
  }

  session.mode = GAME_STATE_MAP;
  input.map = false;
  return true;
}

export function getActiveRoomState(worldState) {
  const roomIndex = worldState.activeWorld.currentRoomIndex;

  return {
    roomIndex,
    room: worldState.activeWorld.rooms[roomIndex],
    roomEnemies: worldState.activeEnemiesByRoom[roomIndex] ?? [],
    roomNpcs: worldState.activeNpcsByRoom[roomIndex] ?? [],
    roomProps: worldState.activeRoomPropsByRoom[roomIndex] ?? [],
    roomProjectiles: getOrCreateRoomProjectiles(worldState.activeProjectilesByRoom, roomIndex)
  };
}

export function resolvePlayerCollisions(session, previousPlayerPosition, roomState, activeWorld) {
  resolveRoomGeometryCollisions(session.player, previousPlayerPosition, activeWorld);
  resolveNpcCollisions(session.player, previousPlayerPosition, roomState.roomNpcs);
  resolveRoomPropCollisions(session.player, previousPlayerPosition, roomState.roomProps);
}

export function tryHandleRoomTransition(session, roomIndex, activeProjectilesByRoom, canvas) {
  if (!tryStartRoomTransition(session, canvas)) {
    constrainPlayerToRoom(session.player, getActiveWorld(session), canvas, session.inventory);
    return false;
  }

  activeProjectilesByRoom[roomIndex] = [];
  return true;
}

function getOrCreateRoomProjectiles(projectilesByRoom, roomIndex) {
  if (!projectilesByRoom[roomIndex]) {
    projectilesByRoom[roomIndex] = [];
  }

  return projectilesByRoom[roomIndex];
}
