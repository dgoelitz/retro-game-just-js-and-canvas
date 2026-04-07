import { createEnemiesByWorldKey } from "./enemies/enemy-manager.js";
import { createNpcsByWorldKey } from "./npcs/npc-manager.js";
import { createPlayer } from "./player/player.js";
import { createSword } from "./player/sword.js";
import { createRoomPropsByWorldKey } from "./world/room-props.js";
import { createDungeonRooms, createOverworldRooms } from "./world/room-data.js";
import { createWorld } from "./world/world.js";

export const GAME_STATE_PLAYING = "playing";
export const GAME_STATE_DIALOGUE = "dialogue";
export const GAME_STATE_GAME_OVER = "game-over";

export function createGameSession() {
  return {
    player: createPlayer(),
    sword: createSword(),
    worldsByKey: {
      overworld: createWorld(createOverworldRooms()),
      dungeon: createWorld(createDungeonRooms())
    },
    activeWorldKey: "overworld",
    enemiesByWorldKey: createEnemiesByWorldKey(),
    npcsByWorldKey: createNpcsByWorldKey(),
    roomPropsByWorldKey: createRoomPropsByWorldKey(),
    hasSword: false,
    dialogue: null,
    mode: GAME_STATE_PLAYING
  };
}

export function resetGameSession(session) {
  const nextSession = createGameSession();

  session.player = nextSession.player;
  session.sword = nextSession.sword;
  session.worldsByKey = nextSession.worldsByKey;
  session.activeWorldKey = nextSession.activeWorldKey;
  session.enemiesByWorldKey = nextSession.enemiesByWorldKey;
  session.npcsByWorldKey = nextSession.npcsByWorldKey;
  session.roomPropsByWorldKey = nextSession.roomPropsByWorldKey;
  session.hasSword = nextSession.hasSword;
  session.dialogue = nextSession.dialogue;
  session.mode = nextSession.mode;
}

export function getActiveWorld(session) {
  return session.worldsByKey[session.activeWorldKey];
}

export function getActiveEnemiesByRoom(session) {
  return session.enemiesByWorldKey[session.activeWorldKey];
}

export function getActiveNpcsByRoom(session) {
  return session.npcsByWorldKey[session.activeWorldKey];
}

export function getActiveRoomPropsByRoom(session) {
  return session.roomPropsByWorldKey[session.activeWorldKey];
}

export function travelToDestination(session, destination) {
  session.activeWorldKey = destination.worldKey;
  const nextWorld = getActiveWorld(session);

  nextWorld.currentRoomIndex = destination.roomIndex;
  nextWorld.transition = null;
  session.player.x = destination.playerX;
  session.player.y = destination.playerY;
  session.sword.active = false;
}
