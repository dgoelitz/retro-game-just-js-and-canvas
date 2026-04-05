import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";
import { WALL_COLOR, WALL_THICKNESS } from "./room-data.js";

const BUSH_COLOR = "#00a84f";
const BUSH_HIGHLIGHT_COLOR = "#6abe30";
const DUNGEON_COLOR = "#5f574f";
const DUNGEON_OPENING_COLOR = "#1a1c2c";

export function createRoomPropsByRoom() {
  return {
    2: [
      createWallBlock({ x: 156, y: 0, width: WALL_THICKNESS, height: 36 }),
      createBush({ x: 152, y: 36 }),
      createBush({ x: 152, y: 44 }),
      createBush({ x: 152, y: 52 }),
      createBush({ x: 152, y: 60 }),
      createWallBlock({ x: 156, y: 68, width: WALL_THICKNESS, height: 52 })
    ],
    5: [
      createWallBlock({ x: 0, y: 0, width: WALL_THICKNESS, height: 36 }),
      createWallBlock({ x: 0, y: 68, width: WALL_THICKNESS, height: 52 }),
      createBush({ x: 56, y: 24 }),
      createBush({ x: 64, y: 24 }),
      createBush({ x: 72, y: 24 }),
      createBush({ x: 104, y: 72 }),
      createBush({ x: 112, y: 72 }),
      createBush({ x: 120, y: 72 })
    ],
    6: [
      createBush({ x: 28, y: 84 }),
      createBush({ x: 36, y: 84 }),
      createBush({ x: 44, y: 84 }),
      createBush({ x: 100, y: 84 }),
      createBush({ x: 108, y: 84 }),
      createBush({ x: 116, y: 84 }),
      createDungeonEntrance({ x: 66, y: 14 })
    ]
  };
}

export function renderRoomProp(ctx, prop, offset = ZERO_OFFSET) {
  if (prop.destroyed) {
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

  if (prop.kind === "dungeon-entrance") {
    ctx.fillStyle = DUNGEON_COLOR;
    ctx.fillRect(drawX, drawY, prop.width, prop.height);

    ctx.fillStyle = DUNGEON_OPENING_COLOR;
    ctx.fillRect(drawX + 4, drawY + 4, prop.width - 8, prop.height - 4);
    return;
  }

  if (prop.kind === "wall-block") {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(drawX, drawY, prop.width, prop.height);
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
    if (!isCuttable(prop) || prop.destroyed) {
      continue;
    }

    if (rectanglesOverlap(prop, attackHitbox)) {
      prop.destroyed = true;
    }
  }
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
    if (!prop.blocksMovement || prop.destroyed) {
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
