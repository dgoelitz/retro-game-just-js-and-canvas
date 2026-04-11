import { startDialogue } from "../dialogue/dialogue-state.js";
import { createDialoguePages } from "../dialogue/dialogue-pages.js";
import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";
import { WALL_COLOR, WALL_THICKNESS } from "./room-data.js";

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

const ITEM_MESSAGE_BY_REWARD_KIND = {
  "normal-key": "You found - like - a normalish looking kinda basic sorta key.",
  "boss-key": "Wow this key looks important. I wonder if this key is different from other keys.",
  shield: "You got the shield! Hold the Shift key to block with it. Ok then, defend away!",
  map: "You got the dungeon map. My, how unexpected. Never thought there would be a map for a dungeon. Now I've seen everything. Press the Tab key to open the map.",
  compass: "You got a magnet that somehow will show on your map where stuff is. Don't ask me. Press the Tab key to open the map.",
  "piece-of-heart": "You got part of a new health container. Probably you know how this works so I won't bore you with the details.",
  "final-treasure": "Congrats! You completed the game up to the end of this version."
};

export function createRoomPropsByRoom() {
  return {
    2: [
      createWallBlock({ x: 156, y: 0, width: WALL_THICKNESS, height: 36 }),
      createBush({ x: 152, y: 36 }),
      createBush({ x: 152, y: 44 }),
      createBush({ x: 152, y: 52 }),
      createBush({ x: 152, y: 60 }),
      createWallBlock({ x: 156, y: 68, width: WALL_THICKNESS, height: 22 })
    ],
    5: [
      createWallBlock({ x: 0, y: 0, width: WALL_THICKNESS, height: 36 }),
      createWallBlock({ x: 0, y: 68, width: WALL_THICKNESS, height: 22 }),
      createBush({ x: 56, y: 24 }),
      createBush({ x: 64, y: 24 }),
      createBush({ x: 72, y: 24 }),
      createBush({ x: 104, y: 72 }),
      createBush({ x: 112, y: 72 }),
      createBush({ x: 120, y: 72 })
    ],
    6: [
      createBush({ x: 28, y: 78 }),
      createBush({ x: 36, y: 78 }),
      createBush({ x: 44, y: 78 }),
      createBush({ x: 100, y: 78 }),
      createBush({ x: 108, y: 78 }),
      createBush({ x: 116, y: 78 }),
      createDungeonEntrance({
        x: 66,
        y: 12,
        destination: {
          worldKey: "dungeon",
          roomIndex: 0,
          playerX: 76,
          playerY: 66
        }
      })
    ]
  };
}

export function createDungeonRoomPropsByRoom() {
  return {
    0: [
      createDungeonExit({
        x: 66,
        y: 72,
        destination: {
          worldKey: "overworld",
          roomIndex: 6,
          playerX: 76,
          playerY: 24
        }
      })
    ],
    1: [
      createTarget({
        id: "room-2-target",
        x: 120,
        y: 0,
        progressFlag: "room2TargetDestroyed"
      })
    ],
    2: [
      createChest({
        id: "room-3-map",
        x: 72,
        y: 40,
        rewardKind: "map",
        progressFlag: "mapChestOpened",
        hidden: true
      })
    ],
    4: [
      createChest({
        id: "room-5-boss-key",
        x: 72,
        y: 40,
        rewardKind: "boss-key",
        progressFlag: "bossKeyChestOpened",
        hidden: true
      })
    ],
    5: [
      createTarget({
        id: "room-6-left-target",
        x: 8,
        y: 34,
        progressFlag: "room6LeftTargetDestroyed"
      }),
      createTarget({
        id: "room-6-right-target",
        x: 148,
        y: 34,
        progressFlag: "room6RightTargetDestroyed"
      })
    ],
    6: [
      createChest({
        id: "room-7-key",
        x: 72,
        y: 10,
        rewardKind: "normal-key",
        progressFlag: "keyChestOpened"
      })
    ],
    7: [
      createChest({
        id: "room-8-compass",
        x: 72,
        y: 40,
        rewardKind: "compass",
        progressFlag: "compassChestOpened",
        hidden: true
      })
    ],
    9: [
      createChest({
        id: "room-10-shield",
        x: 72,
        y: 40,
        rewardKind: "shield",
        progressFlag: "shieldChestOpened",
        hidden: true
      })
    ],
    10: [
      createChest({
        id: "room-11-heart-piece",
        x: 72,
        y: 40,
        rewardKind: "piece-of-heart",
        progressFlag: "heartPieceChestOpened",
        hidden: true
      })
    ],
    11: [
      createSwitch({
        id: "room-12-switch",
        x: 128,
        y: 40,
        progressFlag: "room12SwitchPressed"
      })
    ],
    12: [
      createChest({
        id: "room-13-final-treasure",
        x: 72,
        y: 40,
        rewardKind: "final-treasure",
        progressFlag: "finalTreasureChestOpened",
        hidden: true
      })
    ]
  };
}

export function createRoomPropsByWorldKey() {
  return {
    overworld: createRoomPropsByRoom(),
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

    if (prop.kind === "switch" && !prop.activated) {
      prop.activated = true;
      session.progress.dungeon.flags[prop.progressFlag] = true;
      return { interacted: true, destination: null };
    }

    if (prop.kind === "chest" && !prop.opened) {
      prop.opened = true;
      session.progress.dungeon.flags[prop.progressFlag] = true;
      applyChestReward(session, prop.rewardKind);

      const message = ITEM_MESSAGE_BY_REWARD_KIND[prop.rewardKind];

      if (message) {
        startDialogue(session, createDialoguePages(ctx, canvas, message));
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

function createBush(overrides = {}) {
  return {
    kind: "bush",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: true,
    cuttable: true,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

function createDungeonEntrance(overrides = {}) {
  return {
    kind: "dungeon-entrance",
    x: 0,
    y: 0,
    width: 28,
    height: 20,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

function createDungeonExit(overrides = {}) {
  return {
    kind: "dungeon-exit",
    x: 0,
    y: 0,
    width: 28,
    height: 16,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

function createWallBlock(overrides = {}) {
  return {
    kind: "wall-block",
    x: 0,
    y: 0,
    width: WALL_THICKNESS,
    height: 8,
    blocksMovement: true,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

function createChest(overrides = {}) {
  return {
    kind: "chest",
    x: 0,
    y: 0,
    width: 12,
    height: 8,
    blocksMovement: true,
    cuttable: false,
    destroyed: false,
    hidden: false,
    opened: false,
    rewardKind: null,
    progressFlag: null,
    ...overrides
  };
}

function createTarget(overrides = {}) {
  return {
    kind: "target",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    progressFlag: null,
    ...overrides
  };
}

function createSwitch(overrides = {}) {
  return {
    kind: "switch",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    activated: false,
    progressFlag: null,
    ...overrides
  };
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
