import { DUNGEON_DIALOGUE_TEXT } from "../dialogue/dialogue-text.js";
import { startDialogue } from "../dialogue/dialogue-state.js";
import { createDialoguePages } from "../dialogue/dialogue-pages.js";
import { GAME_STATE_PLAYING, getActiveRoomPropsByRoom, getActiveWorld } from "../game-state.js";
import { rectanglesOverlap } from "../game-utils.js";

export function handleDungeonRoomEntry(session, ctx, canvas) {
  if (session.activeWorldKey !== "dungeon" || session.mode !== GAME_STATE_PLAYING) {
    return;
  }

  const activeWorld = getActiveWorld(session);
  const roomIndex = activeWorld.currentRoomIndex;

  if (session.progress.dungeon.lastEnteredRoomIndex === roomIndex) {
    return;
  }

  session.progress.dungeon.lastEnteredRoomIndex = roomIndex;

  if (roomIndex === 9 && !session.progress.dungeon.flags.minibossIntroSeen) {
    session.progress.dungeon.flags.minibossIntroSeen = true;
    startDialogue(session, createDialoguePages(ctx, canvas, DUNGEON_DIALOGUE_TEXT.minibossIntro));
    return;
  }

  if (roomIndex === 12 && !session.progress.dungeon.flags.bossIntroSeen) {
    session.progress.dungeon.flags.bossIntroSeen = true;
    startDialogue(session, createDialoguePages(ctx, canvas, DUNGEON_DIALOGUE_TEXT.bossIntro));
  }
}

export function updateDungeonRoomRules(session, ctx, canvas) {
  if (session.activeWorldKey !== "dungeon") {
    return;
  }

  const activeWorld = getActiveWorld(session);
  const roomIndex = activeWorld.currentRoomIndex;
  const roomEnemies = session.enemiesByWorldKey.dungeon[roomIndex] ?? [];
  const roomProps = getActiveRoomPropsByRoom(session)[roomIndex] ?? [];

  syncProgressFlagsFromRoomProps(session, roomProps);

  if (roomIndex === 0) {
    if (areAllEnemiesDefeated(roomEnemies)) {
      unlockDoor(activeWorld.rooms[0], "top");
      session.progress.dungeon.flags.room1Cleared = true;
    }
    return;
  }

  if (roomIndex === 1) {
    if (session.progress.dungeon.flags.room2TargetDestroyed) {
      unlockDoor(activeWorld.rooms[1], "top");
    }
    return;
  }

  if (roomIndex === 2) {
    if (countLivingEnemies(roomEnemies, "stone") === 0) {
      killEnemiesByType(roomEnemies, "turret");
      revealRoomProp(roomProps, "room-3-map", session.player);
    }
    return;
  }

  if (roomIndex === 4) {
    if (areAllKillableEnemiesDefeated(roomEnemies)) {
      killEnemiesByType(roomEnemies, "turret");
      revealRoomProp(roomProps, "room-5-boss-key", session.player);
    }
    return;
  }

  if (roomIndex === 5) {
    if (session.progress.dungeon.flags.room6LeftTargetDestroyed && session.progress.dungeon.flags.room6RightTargetDestroyed) {
      unlockDoor(activeWorld.rooms[5], "top");
    }
    return;
  }

  if (roomIndex === 6) {
    if (session.progress.dungeon.flags.keyChestOpened) {
      killEnemiesByType(roomEnemies, "fixed-turret");
    }
    return;
  }

  if (roomIndex === 7) {
    if (areAllEnemiesDefeated(roomEnemies)) {
      revealRoomProp(roomProps, "room-8-compass", session.player);
    }
    return;
  }

  if (roomIndex === 9) {
    const minibossIsAlive = hasLivingEnemy(roomEnemies, "miniboss");

    setDoorKind(activeWorld.rooms[9], "left", minibossIsAlive ? "barred" : "unlocked");

    if (!minibossIsAlive && !session.progress.dungeon.flags.minibossDefeated) {
      session.progress.dungeon.flags.minibossDefeated = true;
      startDialogue(session, createDialoguePages(ctx, canvas, DUNGEON_DIALOGUE_TEXT.minibossDefeated), {
        onComplete() {
          revealRoomProp(roomProps, "room-10-shield", session.player);
        }
      });
    }
    return;
  }

  if (roomIndex === 10) {
    if (areAllEnemiesDefeated(roomEnemies)) {
      revealRoomProp(roomProps, "room-11-heart-piece", session.player);
    }
    return;
  }

  if (roomIndex === 11) {
    if (session.progress.dungeon.flags.room12SwitchPressed) {
      unlockDoor(activeWorld.rooms[11], "right");
      unlockDoor(activeWorld.rooms[10], "left");
    }
    return;
  }

  if (roomIndex === 12) {
    const bossIsAlive = hasLivingEnemy(roomEnemies, "boss");

    setDoorKind(activeWorld.rooms[11], "top", bossIsAlive ? "barred" : "unlocked");
    setDoorKind(activeWorld.rooms[12], "bottom", bossIsAlive ? "barred" : "unlocked");

    if (!hasLivingEnemy(roomEnemies, "boss") && !session.progress.dungeon.flags.bossDefeated) {
      session.progress.dungeon.flags.bossDefeated = true;
      startDialogue(session, createDialoguePages(ctx, canvas, DUNGEON_DIALOGUE_TEXT.bossDefeated), {
        onComplete() {
          revealRoomProp(roomProps, "room-13-final-treasure", session.player);
        }
      });
    }
  }
}

function syncProgressFlagsFromRoomProps(session, roomProps) {
  for (const prop of roomProps) {
    if (prop.progressFlag && (prop.destroyed || prop.activated || prop.opened)) {
      session.progress.dungeon.flags[prop.progressFlag] = true;
    }
  }
}

function areAllEnemiesDefeated(roomEnemies) {
  return roomEnemies.every((enemy) => !enemy.alive || enemy.nonBlocking);
}

function areAllKillableEnemiesDefeated(roomEnemies) {
  return roomEnemies
    .filter(isKillableForRoomClear)
    .every((enemy) => !enemy.alive || enemy.nonBlocking);
}

function isKillableForRoomClear(enemy) {
  return enemy.type !== "turret";
}

function countLivingEnemies(roomEnemies, type) {
  return roomEnemies.filter((enemy) => enemy.type === type && enemy.alive).length;
}

function hasLivingEnemy(roomEnemies, type) {
  return roomEnemies.some((enemy) => enemy.type === type && enemy.alive);
}

function killEnemiesByType(roomEnemies, type) {
  for (const enemy of roomEnemies) {
    if (enemy.type === type) {
      enemy.alive = false;
    }
  }
}

function revealRoomProp(roomProps, id, player) {
  const prop = roomProps.find((roomProp) => roomProp.id === id);

  if (prop) {
    prop.hidden = false;
    movePropOutOfPlayer(prop, player);
  }
}

function movePropOutOfPlayer(prop, player) {
  if (!player || !rectanglesOverlap(prop, player)) {
    return;
  }

  prop.y = player.y - prop.height;
}

function unlockDoor(room, edge) {
  if (!room.doors?.[edge]) {
    return;
  }

  room.doors[edge].kind = "unlocked";
}

function setDoorKind(room, edge, kind) {
  if (!room.doors?.[edge]) {
    return;
  }

  room.doors[edge].kind = kind;
}
