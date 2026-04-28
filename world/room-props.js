import { startTextDialogue } from "../dialogue/dialogue-helpers.js";
import { ITEM_DIALOGUE_BY_REWARD_KIND } from "../dialogue/dialogue-text.js";
import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";
import { WALL_COLOR } from "./room-data.js";
import { createDungeonRoomPropsByRoom, createOverworldRoomPropsByRoom } from "./room-prop-layouts.js";

const BUSH_COLOR = "#00a84f";
const BUSH_HIGHLIGHT_COLOR = "#6abe30";
const DUNGEON_COLOR = "#5f574f";
const DUNGEON_OPENING_COLOR = "#1a1c2c";
const CHEST_COLOR = "#ac3232";
const CHEST_TRIM_COLOR = "#ffcd75";
const TARGET_COLOR = "#94b0c2";
const TARGET_CENTER_COLOR = "#e43b44";
const SWITCH_COLOR = "#c2c3c7";
const SWITCH_ACTIVE_COLOR = "#00e756";

export function createRoomPropsByWorldKey() {
  return {
    overworld: createOverworldRoomPropsByRoom(),
    dungeon: createDungeonRoomPropsByRoom()
  };
}

export function renderRoomProp(ctx, prop, offset = ZERO_OFFSET) {
  if (prop.destroyed || prop.hidden) {
    return;
  }

  const drawX = Math.round(prop.x) + offset.x;
  const drawY = Math.round(prop.y) + offset.y;

  if (prop.kind === "bush") {
    ctx.fillStyle = BUSH_COLOR;
    ctx.fillRect(drawX, drawY, prop.width, prop.height);

    ctx.fillStyle = BUSH_HIGHLIGHT_COLOR;
    ctx.fillRect(drawX + 1, drawY + 1, prop.width - 2, prop.height - 4);
    return;
  }

  if (prop.kind === "dungeon-entrance" || prop.kind === "dungeon-exit") {
    ctx.fillStyle = DUNGEON_COLOR;
    ctx.fillRect(drawX, drawY, prop.width, prop.height);

    ctx.fillStyle = DUNGEON_OPENING_COLOR;
    ctx.fillRect(drawX + 4, drawY + 4, prop.width - 8, prop.height - 4);
    return;
  }

  if (prop.kind === "wall-block") {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(drawX, drawY, prop.width, prop.height);
    return;
  }

  if (prop.kind === "chest") {
    renderChest(ctx, prop, drawX, drawY);
    return;
  }

  if (prop.kind === "target") {
    renderTarget(ctx, prop, drawX, drawY);
    return;
  }

  if (prop.kind === "switch") {
    renderSwitch(ctx, prop, drawX, drawY);
  }
}

export function resolveRoomPropCollisions(player, previousPosition, roomProps) {
  const movedHitbox = getEntityHitbox(player);

  if (!overlapsBlockingProp(roomProps, movedHitbox)) {
    return;
  }

  const movedPosition = {
    x: player.x,
    y: player.y
  };

  player.x = previousPosition.x;
  player.y = movedPosition.y;

  if (!overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
    return;
  }

  player.x = movedPosition.x;
  player.y = previousPosition.y;

  if (!overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
    return;
  }

  player.x = previousPosition.x;
  player.y = previousPosition.y;
}

export function hitRoomProps(roomProps, attackHitbox) {
  if (!attackHitbox) {
    return;
  }

  for (const prop of roomProps) {
    if (!isCuttable(prop) || prop.destroyed || prop.hidden) {
      continue;
    }

    if (rectanglesOverlap(prop, attackHitbox)) {
      prop.destroyed = true;
    }
  }
}

export function hitTargetProps(roomProps, projectiles) {
  for (const projectile of projectiles) {
    if (!projectile.active || !projectile.deflected) {
      continue;
    }

    for (const prop of roomProps) {
      if (prop.kind !== "target" || prop.destroyed || prop.hidden) {
        continue;
      }

      if (rectanglesOverlap(prop, projectile)) {
        prop.destroyed = true;
        projectile.active = false;
      }
    }
  }
}

export function resolveWeightSwitches(session, roomProps, playerHitbox) {
  for (const prop of roomProps) {
    if (prop.kind !== "switch" || prop.activated || prop.hidden || prop.destroyed) {
      continue;
    }

    if (!isPressedByWeight(prop, playerHitbox)) {
      continue;
    }

    prop.activated = true;
    session.progress.dungeon.flags[prop.progressFlag] = true;
  }
}

export function interactWithRoomProps(session, roomProps, playerHitbox, ctx, canvas) {
  for (const prop of roomProps) {
    if (prop.hidden || prop.destroyed) {
      continue;
    }

    const canInteract = prop.destination
      ? rectanglesOverlap(prop, playerHitbox)
      : isWithinInteractionRange(prop, playerHitbox);

    if (!canInteract) {
      continue;
    }

    if (prop.kind === "chest" && !prop.opened) {
      prop.opened = true;
      session.progress.dungeon.flags[prop.progressFlag] = true;
      applyChestReward(session, prop.rewardKind);

      const message = ITEM_DIALOGUE_BY_REWARD_KIND[prop.rewardKind];

      if (message) {
        startTextDialogue(session, ctx, canvas, message);
      }

      return { interacted: true, destination: null };
    }

    if (prop.destination) {
      return {
        interacted: true,
        destination: prop.destination
      };
    }
  }

  return {
    interacted: false,
    destination: null
  };
}

function isPressedByWeight(prop, playerHitbox) {
  const overlapLeft = Math.max(prop.x, playerHitbox.x);
  const overlapRight = Math.min(prop.x + prop.width, playerHitbox.x + playerHitbox.width);
  const overlapTop = Math.max(prop.y, playerHitbox.y);
  const overlapBottom = Math.min(prop.y + prop.height, playerHitbox.y + playerHitbox.height);
  const overlapWidth = overlapRight - overlapLeft;
  const overlapHeight = overlapBottom - overlapTop;

  return overlapWidth >= 4 && overlapHeight >= 4;
}

function applyChestReward(session, rewardKind) {
  if (rewardKind === "normal-key") {
    session.inventory.normalKeys += 1;
    return;
  }

  if (rewardKind === "boss-key") {
    session.inventory.hasBossKey = true;
    return;
  }

  if (rewardKind === "shield") {
    session.inventory.hasShield = true;
    return;
  }

  if (rewardKind === "map") {
    session.inventory.hasMap = true;
    return;
  }

  if (rewardKind === "compass") {
    session.inventory.hasCompass = true;
    return;
  }

  if (rewardKind === "piece-of-heart") {
    session.inventory.heartPieceCount += 1;
    return;
  }

  if (rewardKind === "final-treasure") {
    session.inventory.hasFinalTreasure = true;
  }
}

function renderChest(ctx, prop, drawX, drawY) {
  ctx.fillStyle = CHEST_COLOR;
  ctx.fillRect(drawX, drawY, prop.width, prop.height);

  ctx.fillStyle = CHEST_TRIM_COLOR;
  ctx.fillRect(drawX, drawY, prop.width, 2);
  ctx.fillRect(drawX + 3, drawY + 4, prop.width - 6, 2);

  if (prop.opened) {
    ctx.clearRect(drawX + 2, drawY + 2, prop.width - 4, 2);
  }
}

function renderTarget(ctx, prop, drawX, drawY) {
  ctx.fillStyle = TARGET_COLOR;
  ctx.fillRect(drawX, drawY, prop.width, prop.height);
  ctx.fillStyle = TARGET_CENTER_COLOR;
  ctx.fillRect(drawX + 2, drawY + 2, prop.width - 4, prop.height - 4);
}

function renderSwitch(ctx, prop, drawX, drawY) {
  ctx.fillStyle = prop.activated ? SWITCH_ACTIVE_COLOR : SWITCH_COLOR;
  ctx.fillRect(drawX, drawY, prop.width, prop.height);
}


function getEntityHitbox(entity) {
  return {
    x: Math.round(entity.x),
    y: Math.round(entity.y),
    width: entity.width,
    height: entity.height
  };
}

function overlapsBlockingProp(roomProps, hitbox) {
  for (const prop of roomProps) {
    if (!prop.blocksMovement || prop.destroyed || prop.hidden) {
      continue;
    }

    if (rectanglesOverlap(prop, hitbox)) {
      return true;
    }
  }

  return false;
}

function isCuttable(prop) {
  return prop.cuttable;
}

function isWithinInteractionRange(prop, playerHitbox) {
  const interactionDistance = 6;

  return rectanglesOverlap({
    x: prop.x - interactionDistance,
    y: prop.y - interactionDistance,
    width: prop.width + interactionDistance * 2,
    height: prop.height + interactionDistance * 2
  }, playerHitbox);
}
