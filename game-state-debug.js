import { DUNGEON_0_ROOM_COUNT } from "./dungeons/dungeon-0/dungeon-0.js";
import { setPlayerPosition } from "./player/player.js";
import { WORLD_KEY_DUNGEON } from "./world/world-keys.js";

const DUNGEON_PROGRESS_FLAGS = {
  room1Cleared: true,
  room2TargetDestroyed: true,
  mapChestOpened: true,
  bossKeyChestOpened: true,
  room6LeftTargetDestroyed: true,
  room6RightTargetDestroyed: true,
  keyChestOpened: true,
  compassChestOpened: true
};

export function applyDebugStart(session, debugStartKey, helpers) {
  if (debugStartKey === "dungeon-start") {
    startDungeonDebugRun(session, helpers, {
      hasSword: true
    });
    return;
  }

  if (debugStartKey === "room5-test") {
    startDungeonDebugRun(session, helpers, {
      hasSword: true,
      hasShield: true
    });
    return;
  }

  if (debugStartKey === "miniboss-test") {
    applyMinibossDebugStart(session, helpers);
    return;
  }

  if (debugStartKey === "room11-test") {
    applyRoom11DebugStart(session, helpers, {
      hasBossKey: true
    });
    return;
  }

  if (debugStartKey === "room11-no-boss-key-test") {
    applyRoom11DebugStart(session, helpers, {
      hasBossKey: false
    });
    return;
  }

  if (debugStartKey === "boss-test") {
    applyBossDebugStart(session, helpers);
  }
}

function startDungeonDebugRun(session, helpers, inventoryOverrides) {
  session.activeWorldKey = WORLD_KEY_DUNGEON;
  Object.assign(session.inventory, inventoryOverrides);
  session.progress.dungeon.flags.room1Cleared = true;
  session.enemiesByWorldKey.dungeon[0] = [];

  const dungeonWorld = session.worldsByKey.dungeon;
  dungeonWorld.currentRoomIndex = helpers.dungeonStart.roomIndex;
  dungeonWorld.transition = null;

  setPlayerPosition(session.player, helpers.dungeonStart.playerPosition);
  helpers.setGameOverDestination(session, helpers.dungeonStart);
  helpers.markCurrentRoomVisited(session);
}

function applyMinibossDebugStart(session, helpers) {
  session.activeWorldKey = WORLD_KEY_DUNGEON;
  Object.assign(session.inventory, {
    hasSword: true,
    hasMap: true,
    hasCompass: true,
    hasBossKey: true,
    normalKeys: 1
  });

  Object.assign(session.progress.dungeon.flags, DUNGEON_PROGRESS_FLAGS);
  session.enemiesByWorldKey.dungeon[0] = [];

  const dungeonWorld = session.worldsByKey.dungeon;
  dungeonWorld.currentRoomIndex = 8;
  dungeonWorld.transition = null;
  unlockDungeonDoorsForMinibossTest(dungeonWorld);

  const playerPosition = {
    x: 132,
    y: 38
  };

  setPlayerPosition(session.player, playerPosition);
  helpers.markCurrentRoomVisited(session);
  helpers.setGameOverDestination(session, {
    worldKey: WORLD_KEY_DUNGEON,
    roomIndex: 8,
    playerPosition
  });
}

function applyRoom11DebugStart(session, helpers, { hasBossKey }) {
  session.activeWorldKey = WORLD_KEY_DUNGEON;
  Object.assign(session.inventory, {
    hasSword: true,
    hasShield: true,
    hasMap: true,
    hasCompass: true,
    hasBossKey,
    normalKeys: 1
  });

  Object.assign(session.progress.dungeon.flags, {
    ...DUNGEON_PROGRESS_FLAGS,
    bossKeyChestOpened: hasBossKey,
    minibossIntroSeen: true,
    minibossDefeated: true,
    shieldChestOpened: true
  });

  session.enemiesByWorldKey.dungeon[0] = [];
  session.enemiesByWorldKey.dungeon[9] = [];

  const dungeonWorld = session.worldsByKey.dungeon;
  dungeonWorld.currentRoomIndex = 8;
  dungeonWorld.transition = null;
  unlockDungeonDoorsForMinibossTest(dungeonWorld);
  unlockDoor(dungeonWorld.rooms[9], "left");

  const playerPosition = {
    x: 76,
    y: 10
  };

  setPlayerPosition(session.player, playerPosition);
  helpers.markCurrentRoomVisited(session);
  helpers.setGameOverDestination(session, {
    worldKey: WORLD_KEY_DUNGEON,
    roomIndex: 8,
    playerPosition
  });
}

function applyBossDebugStart(session, helpers) {
  session.activeWorldKey = WORLD_KEY_DUNGEON;
  Object.assign(session.inventory, {
    hasSword: true,
    hasShield: true,
    hasMap: true,
    hasCompass: true,
    hasBossKey: true,
    normalKeys: 0,
    heartPieceCount: 1
  });

  session.progress.dungeon.visitedRooms = Array(DUNGEON_0_ROOM_COUNT).fill(false).map((_, index) => index <= 11);
  Object.assign(session.progress.dungeon.flags, {
    ...DUNGEON_PROGRESS_FLAGS,
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
  helpers.setGameOverDestination(session, helpers.dungeonStart);
}

function unlockDungeonDoorsForMinibossTest(dungeonWorld) {
  unlockDoor(dungeonWorld.rooms[0], "top");
  unlockDoor(dungeonWorld.rooms[1], "top");
  unlockDoor(dungeonWorld.rooms[5], "top");
}

function unlockDungeonDoorsForBossTest(dungeonWorld) {
  unlockDoor(dungeonWorld.rooms[0], "top");
  unlockDoor(dungeonWorld.rooms[1], "top");
  unlockDoor(dungeonWorld.rooms[5], "top");
  unlockDoor(dungeonWorld.rooms[9], "left");
  unlockDoor(dungeonWorld.rooms[10], "left");
  unlockDoor(dungeonWorld.rooms[11], "right");
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
