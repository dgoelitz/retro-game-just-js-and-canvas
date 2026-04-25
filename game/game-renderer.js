import { renderProjectiles } from "../combat/projectiles.js";
import { renderEnemy } from "../enemies/enemy.js";
import {
  GAME_STATE_DIALOGUE,
  GAME_STATE_GAME_OVER,
  GAME_STATE_MAP,
  getActiveEnemiesByRoom,
  getActiveNpcsByRoom,
  getActiveProjectilesByRoom,
  getActiveRoomPropsByRoom,
  getActiveWorld
} from "../game-state.js";
import { renderNpc } from "../npcs/npc.js";
import { renderPlayer, renderPlayerHealth } from "../player/player.js";
import { renderDialogueBox } from "../ui/dialogue-box.js";
import { renderGameOverScreen } from "../ui/game-over-screen.js";
import { renderMapScreen } from "../ui/map-screen.js";
import { renderRoomProp } from "../world/room-props.js";
import { renderWorld } from "../world/world.js";

export function renderGame(ctx, canvas, session) {
  const activeWorld = getActiveWorld(session);
  const activeEnemiesByRoom = getActiveEnemiesByRoom(session);
  const activeNpcsByRoom = getActiveNpcsByRoom(session);
  const activeRoomPropsByRoom = getActiveRoomPropsByRoom(session);
  const activeProjectilesByRoom = getActiveProjectilesByRoom(session);

  if (session.mode === GAME_STATE_MAP) {
    renderMapScreen(ctx, canvas, activeWorld, session.inventory, session.progress.dungeon);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  renderWorld(ctx, activeWorld, canvas, (roomIndex, offset) => {
    const roomEnemies = activeEnemiesByRoom[roomIndex] ?? [];
    const roomProjectiles = activeProjectilesByRoom[roomIndex] ?? [];
    const roomNpcs = activeNpcsByRoom[roomIndex] ?? [];
    const roomProps = activeRoomPropsByRoom[roomIndex] ?? [];
    const isActiveRoom = roomIndex === activeWorld.currentRoomIndex;

    renderRoomEnemies(ctx, roomEnemies, offset, isActiveRoom, session.roomEntryGraceTimer);
    renderProjectiles(ctx, roomProjectiles, offset);
    renderRoomProps(ctx, roomProps, offset);
    renderRoomNpcs(ctx, roomNpcs, offset);

    if (isActiveRoom) {
      renderPlayer(ctx, session.player, session.sword, session.shield, offset);
    }
  });

  renderPlayerHealth(ctx, session.player);
  renderOverlay(ctx, canvas, session);
}

function renderRoomEnemies(ctx, roomEnemies, offset, isActiveRoom, roomEntryGraceTimer) {
  for (const enemy of roomEnemies) {
    enemy.transparent = isEnemyTransparentOnRoomEntry(enemy, isActiveRoom, roomEntryGraceTimer);
    renderEnemy(ctx, enemy, offset);
  }
}

function renderRoomProps(ctx, roomProps, offset) {
  for (const prop of roomProps) {
    renderRoomProp(ctx, prop, offset);
  }
}

function renderRoomNpcs(ctx, roomNpcs, offset) {
  for (const npc of roomNpcs) {
    renderNpc(ctx, npc, offset);
  }
}

function renderOverlay(ctx, canvas, session) {
  if (session.mode === GAME_STATE_GAME_OVER) {
    renderGameOverScreen(ctx, canvas);
    return;
  }

  if (session.mode === GAME_STATE_DIALOGUE) {
    renderDialogueBox(ctx, canvas, session.dialogue);
  }
}

function isEnemyTransparentOnRoomEntry(enemy, isActiveRoom, roomEntryGraceTimer) {
  return canUseRoomEntryGrace(enemy) && isActiveRoom && roomEntryGraceTimer > 0;
}

function canUseRoomEntryGrace(enemy) {
  return enemy.type !== "boss" && enemy.type !== "miniboss";
}
