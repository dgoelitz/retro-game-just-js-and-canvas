import { createEnemiesByRoom } from "./enemies/enemy-manager.js";
import { createNpcsByRoom } from "./npcs/npc-manager.js";
import { createPlayer } from "./player/player.js";
import { createSword } from "./player/sword.js";
import { createRoomPropsByRoom } from "./world/room-props.js";
import { createWorld } from "./world/world.js";

export const GAME_STATE_PLAYING = "playing";
export const GAME_STATE_DIALOGUE = "dialogue";
export const GAME_STATE_GAME_OVER = "game-over";

export function createGameSession() {
  return {
    player: createPlayer(),
    sword: createSword(),
    world: createWorld(),
    enemiesByRoom: createEnemiesByRoom(),
    npcsByRoom: createNpcsByRoom(),
    roomPropsByRoom: createRoomPropsByRoom(),
    hasSword: false,
    dialogue: null,
    mode: GAME_STATE_PLAYING
  };
}

export function resetGameSession(session) {
  const nextSession = createGameSession();

  session.player = nextSession.player;
  session.sword = nextSession.sword;
  session.world = nextSession.world;
  session.enemiesByRoom = nextSession.enemiesByRoom;
  session.npcsByRoom = nextSession.npcsByRoom;
  session.roomPropsByRoom = nextSession.roomPropsByRoom;
  session.hasSword = nextSession.hasSword;
  session.dialogue = nextSession.dialogue;
  session.mode = nextSession.mode;
}
