import { createDialoguePages } from "../../dialogue/dialogue-pages.js";
import { startDialogue } from "../../dialogue/dialogue-state.js";
import { GAME_STATE_PLAYING, getActiveRoomPropsByRoom, getActiveWorld } from "../../game-state.js";
import { rectanglesOverlap } from "../../game-utils.js";
import { getDungeon0RoomDefinition } from "./dungeon-0.js";

export function handleDungeon0RoomEntry(session, ctx, canvas) {
  if (session.activeWorldKey !== "dungeon" || session.mode !== GAME_STATE_PLAYING) {
    return;
  }

  const activeWorld = getActiveWorld(session);
  const roomIndex = activeWorld.currentRoomIndex;

  if (session.progress.dungeon.lastEnteredRoomIndex === roomIndex) {
    return;
  }

  session.progress.dungeon.lastEnteredRoomIndex = roomIndex;

  const roomDefinition = getDungeon0RoomDefinition(roomIndex);

  if (!roomDefinition?.entryDialogue) {
    return;
  }

  const { flag, text } = roomDefinition.entryDialogue;

  if (session.progress.dungeon.flags[flag]) {
    return;
  }

  session.progress.dungeon.flags[flag] = true;
  startDialogue(session, createDialoguePages(ctx, canvas, text));
}

export function updateDungeon0RoomRules(session, ctx, canvas) {
  if (session.activeWorldKey !== "dungeon") {
    return;
  }

  const activeWorld = getActiveWorld(session);
  const roomIndex = activeWorld.currentRoomIndex;
  const roomDefinition = getDungeon0RoomDefinition(roomIndex);
  const roomEnemies = session.enemiesByWorldKey.dungeon[roomIndex] ?? [];
  const roomProps = getActiveRoomPropsByRoom(session)[roomIndex] ?? [];

  syncProgressFlagsFromRoomProps(session, roomProps);

  if (!roomDefinition?.onUpdate) {
    return;
  }

  roomDefinition.onUpdate({
    session,
    activeWorld,
    room: activeWorld.rooms[roomIndex],
    roomIndex,
    roomEnemies,
    roomProps,
    ctx,
    canvas,
    helpers: createRoomHelpers(session, roomEnemies, roomProps, ctx, canvas)
  });
}

function createRoomHelpers(session, roomEnemies, roomProps, ctx, canvas) {
  return {
    areAllEnemiesDefeated() {
      return roomEnemies.every((enemy) => !enemy.alive || enemy.nonBlocking);
    },
    areAllKillableEnemiesDefeated() {
      return roomEnemies
        .filter((enemy) => enemy.type !== "turret")
        .every((enemy) => !enemy.alive || enemy.nonBlocking);
    },
    countLivingEnemies(type) {
      return roomEnemies.filter((enemy) => enemy.type === type && enemy.alive).length;
    },
    hasLivingEnemy(type) {
      return roomEnemies.some((enemy) => enemy.type === type && enemy.alive);
    },
    killEnemiesByType(type) {
      for (const enemy of roomEnemies) {
        if (enemy.type === type) {
          enemy.alive = false;
        }
      }
    },
    revealRoomProp(id) {
      const prop = roomProps.find((roomProp) => roomProp.id === id);

      if (!prop) {
        return;
      }

      prop.hidden = false;
      movePropOutOfPlayer(prop, session.player);
    },
    unlockDoor(room, edge) {
      if (!room.doors?.[edge]) {
        return;
      }

      room.doors[edge].kind = "unlocked";
    },
    setDoorKind(room, edge, kind) {
      if (!room.doors?.[edge]) {
        return;
      }

      room.doors[edge].kind = kind;
    },
    startRoomDialogue(text, options = {}) {
      startDialogue(session, createDialoguePages(ctx, canvas, text), options);
    }
  };
}

function syncProgressFlagsFromRoomProps(session, roomProps) {
  for (const prop of roomProps) {
    if (prop.progressFlag && (prop.destroyed || prop.activated || prop.opened)) {
      session.progress.dungeon.flags[prop.progressFlag] = true;
    }
  }
}

function movePropOutOfPlayer(prop, player) {
  if (!player || !rectanglesOverlap(prop, player)) {
    return;
  }

  prop.y = player.y - prop.height;
}
