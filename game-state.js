import { DUNGEON_0_ROOM_COUNT } from "./dungeons/dungeon-0/dungeon-0.js";
import { createEnemiesByWorldKey } from "./enemies/enemy-manager.js";
import { applyDebugStart as applyGameDebugStart } from "./game-state-debug.js";
import { createNpcsByWorldKey } from "./npcs/npc-manager.js";
import { createPlayer, setPlayerPosition } from "./player/player.js";
import { createShield } from "./player/shield.js";
import { createSword } from "./player/sword.js";
import { createRoomPropsByWorldKey } from "./world/room-props.js";
import { createDungeonRooms, createOverworldRooms } from "./world/room-data.js";
import { createWorld } from "./world/world.js";

export const GAME_STATE_PLAYING = "playing";
export const GAME_STATE_DIALOGUE = "dialogue";
export const GAME_STATE_GAME_OVER = "game-over";
export const GAME_STATE_MAP = "map";

const OVERWORLD_START = {
  worldKey: "overworld",
  roomIndex: 0,
  playerPosition: {
    x: 40,
    y: 40
  }
};

const DUNGEON_START = {
  worldKey: "dungeon",
  roomIndex: 0,
  playerPosition: {
    x: 76,
    y: 66
  }
};

export function createGameSession() {
  const session = {
    player: createPlayer(),
    sword: createSword(),
    shield: createShield(),
    worldsByKey: {
      overworld: createWorld(createOverworldRooms()),
      dungeon: createWorld(createDungeonRooms())
    },
    activeWorldKey: OVERWORLD_START.worldKey,
    enemiesByWorldKey: createEnemiesByWorldKey(),
    npcsByWorldKey: createNpcsByWorldKey(),
    roomPropsByWorldKey: createRoomPropsByWorldKey(),
    projectilesByWorldKey: {
      overworld: {},
      dungeon: {}
    },
    inventory: createInventory(),
    progress: createProgress(),
    roomEntryGraceTimer: 0,
    blockedDoorMessagesShown: {},
    dialogue: null,
    mode: GAME_STATE_PLAYING,
    gameOverDestination: OVERWORLD_START
  };

  markCurrentRoomVisited(session);

  return session;
}

export function applyDebugStart(session, debugStartKey) {
  applyGameDebugStart(session, debugStartKey, {
    dungeonStart: DUNGEON_START,
    markCurrentRoomVisited,
    setGameOverDestination
  });
}

export function resetGameSession(session) {
  const nextSession = createGameSession();

  session.player = nextSession.player;
  session.sword = nextSession.sword;
  session.shield = nextSession.shield;
  session.worldsByKey = nextSession.worldsByKey;
  session.activeWorldKey = nextSession.activeWorldKey;
  session.enemiesByWorldKey = nextSession.enemiesByWorldKey;
  session.npcsByWorldKey = nextSession.npcsByWorldKey;
  session.roomPropsByWorldKey = nextSession.roomPropsByWorldKey;
  session.projectilesByWorldKey = nextSession.projectilesByWorldKey;
  session.inventory = nextSession.inventory;
  session.progress = nextSession.progress;
  session.roomEntryGraceTimer = nextSession.roomEntryGraceTimer;
  session.blockedDoorMessagesShown = nextSession.blockedDoorMessagesShown;
  session.dialogue = nextSession.dialogue;
  session.mode = nextSession.mode;
  session.gameOverDestination = nextSession.gameOverDestination;
}

export function respawnAfterGameOver(session) {
  session.player = createPlayer();
  session.sword = createSword();
  session.shield = createShield();
  session.enemiesByWorldKey = createEnemiesByWorldKey();
  session.projectilesByWorldKey = {
    overworld: {},
    dungeon: {}
  };
  session.roomEntryGraceTimer = 0;
  session.blockedDoorMessagesShown = {};
  session.dialogue = null;
  session.mode = GAME_STATE_PLAYING;

  session.activeWorldKey = session.gameOverDestination.worldKey;
  const activeWorld = getActiveWorld(session);
  activeWorld.currentRoomIndex = session.gameOverDestination.roomIndex;
  activeWorld.transition = null;
  setPlayerPosition(session.player, session.gameOverDestination.playerPosition);

  applyPersistentEnemyProgress(session);
  applyPersistentDoorProgress(session);
  markCurrentRoomVisited(session);
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

export function getActiveProjectilesByRoom(session) {
  return session.projectilesByWorldKey[session.activeWorldKey];
}

export function travelToDestination(session, destination) {
  session.activeWorldKey = destination.worldKey;
  const nextWorld = getActiveWorld(session);
  const nextProjectilesByRoom = getActiveProjectilesByRoom(session);

  nextWorld.currentRoomIndex = destination.roomIndex;
  nextWorld.transition = null;
  nextProjectilesByRoom[destination.roomIndex] = [];
  setPlayerPosition(session.player, {
    x: destination.playerX,
    y: destination.playerY
  });
  session.sword.active = false;
  session.shield.active = false;

  markCurrentRoomVisited(session);
}

export function markCurrentRoomVisited(session) {
  if (session.activeWorldKey !== "dungeon") {
    return;
  }

  const activeWorld = getActiveWorld(session);
  session.progress.dungeon.visitedRooms[activeWorld.currentRoomIndex] = true;
  session.roomEntryGraceTimer = 0.35;
  session.blockedDoorMessagesShown = {};
}

export function setGameOverDestination(session, destination) {
  session.gameOverDestination = destination;
}

function createInventory() {
  return {
    hasSword: false,
    hasShield: false,
    hasMap: false,
    hasCompass: false,
    normalKeys: 0,
    hasBossKey: false,
    heartPieceCount: 0,
    hasFinalTreasure: false
  };
}

function createProgress() {
  return {
    dungeon: {
      visitedRooms: Array(DUNGEON_0_ROOM_COUNT).fill(false),
      flags: {}
    }
  };
}

export function getDungeonRespawnDestination() {
  return DUNGEON_START;
}

export function getOverworldRespawnDestination() {
  return OVERWORLD_START;
}

function applyPersistentEnemyProgress(session) {
  if (session.progress.dungeon.flags.room1Cleared) {
    session.enemiesByWorldKey.dungeon[0] = [];
  }

  if (session.progress.dungeon.flags.minibossDefeated) {
    session.enemiesByWorldKey.dungeon[9] = [];
  }

  if (session.progress.dungeon.flags.bossDefeated) {
    session.enemiesByWorldKey.dungeon[12] = [];
  }
}

function applyPersistentDoorProgress(session) {
  const dungeonWorld = session.worldsByKey.dungeon;

  if (session.progress.dungeon.flags.room1Cleared) {
    unlockDoor(dungeonWorld.rooms[0], "top");
  }

  if (session.progress.dungeon.flags.room2TargetDestroyed) {
    unlockDoor(dungeonWorld.rooms[1], "top");
  }

  if (session.progress.dungeon.flags.room6LeftTargetDestroyed && session.progress.dungeon.flags.room6RightTargetDestroyed) {
    unlockDoor(dungeonWorld.rooms[5], "top");
  }

  if (session.progress.dungeon.flags.room12SwitchPressed) {
    unlockDoor(dungeonWorld.rooms[10], "left");
    unlockDoor(dungeonWorld.rooms[11], "right");
  }

  if (!session.progress.dungeon.flags.bossDefeated) {
    setDoorKind(dungeonWorld.rooms[11], "top", "boss-key");
    setDoorKind(dungeonWorld.rooms[12], "bottom", "unlocked");
  }
}

function setDoorKind(room, edge, kind) {
  if (room.doors?.[edge]) {
    room.doors[edge].kind = kind;
  }
}

function unlockDoor(room, edge) {
  if (room.doors?.[edge]) {
    room.doors[edge].kind = "unlocked";
  }
}
