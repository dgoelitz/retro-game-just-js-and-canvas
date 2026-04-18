import { createEnemiesByWorldKey } from "./enemies/enemy-manager.js";
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
    blockedDoorMessageShown: false,
    dialogue: null,
    mode: GAME_STATE_PLAYING,
    gameOverDestination: OVERWORLD_START
  };

  markCurrentRoomVisited(session);

  return session;
}

export function applyDebugStart(session, debugStartKey) {
  if (debugStartKey === "dungeon-start") {
    session.activeWorldKey = "dungeon";
    session.inventory.hasSword = true;
    session.progress.dungeon.flags.room1Cleared = true;
    session.enemiesByWorldKey.dungeon[0] = [];
    session.worldsByKey.dungeon.currentRoomIndex = DUNGEON_START.roomIndex;
    session.worldsByKey.dungeon.transition = null;
    setPlayerPosition(session.player, DUNGEON_START.playerPosition);
    setGameOverDestination(session, DUNGEON_START);
    markCurrentRoomVisited(session);
    return;
  }

  if (debugStartKey === "room5-test") {
    session.activeWorldKey = "dungeon";
    session.inventory.hasSword = true;
    session.inventory.hasShield = true;
    session.progress.dungeon.flags.room1Cleared = true;
    session.enemiesByWorldKey.dungeon[0] = [];
    session.worldsByKey.dungeon.currentRoomIndex = DUNGEON_START.roomIndex;
    session.worldsByKey.dungeon.transition = null;
    setPlayerPosition(session.player, DUNGEON_START.playerPosition);
    setGameOverDestination(session, DUNGEON_START);
    markCurrentRoomVisited(session);
    return;
  }

  if (debugStartKey !== "boss-test") {
    return;
  }

  session.activeWorldKey = "dungeon";
  session.inventory.hasSword = true;
  session.inventory.hasShield = true;
  session.inventory.hasMap = true;
  session.inventory.hasCompass = true;
  session.inventory.hasBossKey = true;
  session.inventory.normalKeys = 0;
  session.inventory.heartPieceCount = 1;

  session.progress.dungeon.visitedRooms = Array(13).fill(false).map((_, index) => index <= 11);
  Object.assign(session.progress.dungeon.flags, {
    room1Cleared: true,
    room2TargetDestroyed: true,
    mapChestOpened: true,
    bossKeyChestOpened: true,
    room6LeftTargetDestroyed: true,
    room6RightTargetDestroyed: true,
    keyChestOpened: true,
    compassChestOpened: true,
    minibossIntroSeen: true,
    minibossDefeated: true,
    shieldChestOpened: true,
    heartPieceChestOpened: true,
    room12SwitchPressed: true
  });

  const dungeonWorld = session.worldsByKey.dungeon;
  dungeonWorld.currentRoomIndex = 11;
  dungeonWorld.transition = null;
  unlockDungeonDoorsForBossTest(dungeonWorld);

  setPlayerPosition(session.player, {
    x: 76,
    y: 10
  });

  clearDungeonRoomsBeforeBoss(session);
  applyBossTestRoomPropState(session);
  setGameOverDestination(session, DUNGEON_START);
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
  session.blockedDoorMessageShown = nextSession.blockedDoorMessageShown;
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
  session.blockedDoorMessageShown = false;
  session.dialogue = null;
  session.mode = GAME_STATE_PLAYING;

  session.activeWorldKey = session.gameOverDestination.worldKey;
  const activeWorld = getActiveWorld(session);
  activeWorld.currentRoomIndex = session.gameOverDestination.roomIndex;
  activeWorld.transition = null;
  setPlayerPosition(session.player, session.gameOverDestination.playerPosition);

  applyPersistentEnemyProgress(session);
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
  session.blockedDoorMessageShown = false;
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
      visitedRooms: Array(13).fill(false),
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

function clearDungeonRoomsBeforeBoss(session) {
  for (let roomIndex = 0; roomIndex <= 11; roomIndex += 1) {
    session.enemiesByWorldKey.dungeon[roomIndex] = [];
  }
}

function applyBossTestRoomPropState(session) {
  const dungeonRoomPropsByRoom = session.roomPropsByWorldKey.dungeon;

  markChestCollected(dungeonRoomPropsByRoom[2], "room-3-map");
  markChestCollected(dungeonRoomPropsByRoom[4], "room-5-boss-key");
  markTargetDestroyed(dungeonRoomPropsByRoom[5], "room-6-left-target");
  markTargetDestroyed(dungeonRoomPropsByRoom[5], "room-6-right-target");
  markChestCollected(dungeonRoomPropsByRoom[6], "room-7-key");
  markChestCollected(dungeonRoomPropsByRoom[7], "room-8-compass");
  markChestCollected(dungeonRoomPropsByRoom[9], "room-10-shield");
  markChestCollected(dungeonRoomPropsByRoom[10], "room-11-heart-piece");
  markSwitchActivated(dungeonRoomPropsByRoom[11], "room-12-switch");
}

function unlockDungeonDoorsForBossTest(dungeonWorld) {
  unlockDoor(dungeonWorld.rooms[0], "top");
  unlockDoor(dungeonWorld.rooms[1], "top");
  unlockDoor(dungeonWorld.rooms[5], "top");
  unlockDoor(dungeonWorld.rooms[9], "left");
  unlockDoor(dungeonWorld.rooms[10], "left");
  unlockDoor(dungeonWorld.rooms[11], "right");
}

function unlockDoor(room, edge) {
  if (room.doors?.[edge]) {
    room.doors[edge].kind = "unlocked";
  }
}

function markChestCollected(roomProps = [], id) {
  const chest = roomProps.find((prop) => prop.id === id);

  if (chest) {
    chest.hidden = false;
    chest.opened = true;
  }
}

function markTargetDestroyed(roomProps = [], id) {
  const target = roomProps.find((prop) => prop.id === id);

  if (target) {
    target.destroyed = true;
  }
}

function markSwitchActivated(roomProps = [], id) {
  const roomSwitch = roomProps.find((prop) => prop.id === id);

  if (roomSwitch) {
    roomSwitch.activated = true;
  }
}
