import { createEnemiesByRoom } from "./enemies/enemy-manager.js";
import { createPlayer } from "./player/player.js";
import { createSword } from "./player/sword.js";
import { createWorld } from "./world/world.js";

export const GAME_STATE_PLAYING = "playing";
export const GAME_STATE_GAME_OVER = "game-over";

export function createGameSession() {
  return {
    player: createPlayer(),
    sword: createSword(),
    world: createWorld(),
    enemiesByRoom: createEnemiesByRoom(),
    mode: GAME_STATE_PLAYING
  };
}

export function resetGameSession(session) {
  const nextSession = createGameSession();

  session.player = nextSession.player;
  session.sword = nextSession.sword;
  session.world = nextSession.world;
  session.enemiesByRoom = nextSession.enemiesByRoom;
  session.mode = nextSession.mode;
}
