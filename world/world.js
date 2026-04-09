import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";
import {
  getRoomTransitionOffsets,
  handleWorldTransition,
  isTransitioning,
  tryStartRoomTransition
} from "./room-transition.js";
import {
  DOOR_WIDTH,
  ROOM_BACKGROUND_COLOR,
  WALL_COLOR,
  WALL_THICKNESS
} from "./room-data.js";

const DOOR_OPENING_COLOR = "#1a1c2c";
const DOOR_BAR_COLOR = "#d27d2c";
const KEYHOLE_COLOR = "#ffcd75";

export function createWorld(rooms) {
  return {
    currentRoomIndex: 0,
    transition: null,
    rooms
  };
}

export function getCurrentRoom(world) {
  return world.rooms[world.currentRoomIndex];
}

export { handleWorldTransition, isTransitioning, tryStartRoomTransition };

export function renderWorld(ctx, world, canvas, renderRoomContents) {
  if (!world.transition) {
    renderRoom(ctx, getCurrentRoom(world), canvas, ZERO_OFFSET);
    renderRoomContents(world.currentRoomIndex, ZERO_OFFSET);
    return;
  }

  const transitionOffsets = getRoomTransitionOffsets(world, canvas);

  renderRoom(ctx, world.rooms[world.transition.fromRoomIndex], canvas, transitionOffsets.from);
  renderRoomContents(world.transition.fromRoomIndex, transitionOffsets.from);

  renderRoom(ctx, world.rooms[world.transition.toRoomIndex], canvas, transitionOffsets.to);
  renderRoomContents(world.transition.toRoomIndex, transitionOffsets.to);
}

export function constrainPlayerToRoom(player, world, canvas) {
  const room = getCurrentRoom(world);

  if (hasCenteredDoors(room)) {
    constrainPlayerToDoorRoom(player, room, canvas);
    return;
  }

  const minX = room.walls.left ? WALL_THICKNESS : -player.width;
  const maxX = room.walls.right ? canvas.width - WALL_THICKNESS - player.width : canvas.width;
  const minY = room.walls.top ? WALL_THICKNESS : -player.height;
  const maxY = room.walls.bottom ? canvas.height - WALL_THICKNESS - player.height : canvas.height;

  if (player.x < minX) player.x = minX;
  if (player.x > maxX) player.x = maxX;
  if (player.y < minY) player.y = minY;
  if (player.y > maxY) player.y = maxY;
}

export function resolveRoomGeometryCollisions(player, previousPosition, world) {
  const room = getCurrentRoom(world);
  const collisionRects = room.internalWalls ?? [];
  const oneWayPlatforms = room.oneWayPlatforms ?? [];

  if (collisionRects.length > 0) {
    resolveSolidWallCollisions(player, previousPosition, collisionRects);
  }

  if (oneWayPlatforms.length > 0) {
    resolveOneWayPlatformCollisions(player, previousPosition, oneWayPlatforms);
  }
}

function resolveSolidWallCollisions(player, previousPosition, collisionRects) {
  const movedHitbox = getEntityHitbox(player);

  if (!overlapsAnyRect(collisionRects, movedHitbox)) {
    return;
  }

  const movedPosition = {
    x: player.x,
    y: player.y
  };

  player.x = previousPosition.x;
  player.y = movedPosition.y;

  if (!overlapsAnyRect(collisionRects, getEntityHitbox(player))) {
    return;
  }

  player.x = movedPosition.x;
  player.y = previousPosition.y;

  if (!overlapsAnyRect(collisionRects, getEntityHitbox(player))) {
    return;
  }

  player.x = previousPosition.x;
  player.y = previousPosition.y;
}

function resolveOneWayPlatformCollisions(player, previousPosition, platforms) {
  if (player.y >= previousPosition.y) {
    return;
  }

  const movedHitbox = getEntityHitbox(player);
  const previousBottom = previousPosition.y + player.height;

  for (const platform of platforms) {
    const movedIntoPlatform = rectanglesOverlap(platform, movedHitbox);
    const startedBelowPlatform = previousBottom >= platform.y + platform.height;

    if (movedIntoPlatform && startedBelowPlatform) {
      player.y = previousPosition.y;
      return;
    }
  }
}

function constrainPlayerToDoorRoom(player, room, canvas) {
  constrainAxisToDoorRoom(player, room, canvas, "left");
  constrainAxisToDoorRoom(player, room, canvas, "right");
  constrainAxisToDoorRoom(player, room, canvas, "top");
  constrainAxisToDoorRoom(player, room, canvas, "bottom");
}

function constrainAxisToDoorRoom(player, room, canvas, edge) {
  const door = room.doors?.[edge];
  const isAlignedWithDoor = isPlayerAlignedWithDoor(player, door, canvas);
  const allowsLeavingThroughDoor = Boolean(door) && door.kind !== "barred" && isAlignedWithDoor;

  if (edge === "left" && player.x < WALL_THICKNESS) {
    if (!allowsLeavingThroughDoor) {
      player.x = WALL_THICKNESS;
    }
    return;
  }

  if (edge === "right" && player.x + player.width > canvas.width - WALL_THICKNESS) {
    if (!allowsLeavingThroughDoor) {
      player.x = canvas.width - WALL_THICKNESS - player.width;
    }
    return;
  }

  if (edge === "top" && player.y < WALL_THICKNESS) {
    if (!allowsLeavingThroughDoor) {
      player.y = WALL_THICKNESS;
    }
    return;
  }

  if (edge === "bottom" && player.y + player.height > canvas.height - WALL_THICKNESS) {
    if (!allowsLeavingThroughDoor) {
      player.y = canvas.height - WALL_THICKNESS - player.height;
    }
  }
}

function renderRoom(ctx, room, canvas, offset) {
  const roomBounds = getRoomBounds(canvas, offset);

  ctx.fillStyle = ROOM_BACKGROUND_COLOR;
  ctx.fillRect(roomBounds.left, roomBounds.top, roomBounds.width, roomBounds.height);

  if (hasCenteredDoors(room)) {
    drawDoorRoomWalls(ctx, room, roomBounds);
  } else {
    drawOpenEdgeRoomWalls(ctx, room, roomBounds);
  }

  drawInternalWalls(ctx, room, offset);
}

function drawOpenEdgeRoomWalls(ctx, room, roomBounds) {
  ctx.fillStyle = WALL_COLOR;

  if (room.walls.top) {
    ctx.fillRect(roomBounds.left, roomBounds.top, roomBounds.width, WALL_THICKNESS);
  }

  if (room.walls.right) {
    ctx.fillRect(roomBounds.right - WALL_THICKNESS, roomBounds.top, WALL_THICKNESS, roomBounds.height);
  }

  if (room.walls.bottom) {
    ctx.fillRect(roomBounds.left, roomBounds.bottom - WALL_THICKNESS, roomBounds.width, WALL_THICKNESS);
  }

  if (room.walls.left) {
    ctx.fillRect(roomBounds.left, roomBounds.top, WALL_THICKNESS, roomBounds.height);
  }
}

function drawDoorRoomWalls(ctx, room, roomBounds) {
  drawDoorEdge(ctx, roomBounds, room.doors.top, "top");
  drawDoorEdge(ctx, roomBounds, room.doors.right, "right");
  drawDoorEdge(ctx, roomBounds, room.doors.bottom, "bottom");
  drawDoorEdge(ctx, roomBounds, room.doors.left, "left");
}

function drawDoorEdge(ctx, roomBounds, door, edge) {
  const doorBounds = getDoorBounds(edge, roomBounds);
  const wallSegments = getWallSegmentsForDoor(edge, roomBounds, doorBounds, door);

  ctx.fillStyle = WALL_COLOR;

  for (const segment of wallSegments) {
    ctx.fillRect(segment.x, segment.y, segment.width, segment.height);
  }

  if (!door) {
    return;
  }

  drawDoorway(ctx, doorBounds, door);
}

function drawDoorway(ctx, doorBounds, door) {
  ctx.fillStyle = DOOR_OPENING_COLOR;
  ctx.fillRect(doorBounds.x, doorBounds.y, doorBounds.width, doorBounds.height);

  if (door.kind === "barred") {
    drawDoorBars(ctx, doorBounds);
    return;
  }

  if (door.kind === "key" || door.kind === "boss-key") {
    drawKeyhole(ctx, doorBounds, door.kind === "boss-key");
  }
}

function drawInternalWalls(ctx, room, offset) {
  const internalWalls = room.internalWalls ?? [];
  const oneWayPlatforms = room.oneWayPlatforms ?? [];

  if (internalWalls.length === 0 && oneWayPlatforms.length === 0) {
    return;
  }

  ctx.fillStyle = WALL_COLOR;

  for (const wall of internalWalls) {
    ctx.fillRect(wall.x + offset.x, wall.y + offset.y, wall.width, wall.height);
  }

  for (const platform of oneWayPlatforms) {
    ctx.fillRect(platform.x + offset.x, platform.y + offset.y, platform.width, platform.height);
  }
}

function drawDoorBars(ctx, doorBounds) {
  ctx.fillStyle = DOOR_BAR_COLOR;

  if (doorBounds.width > doorBounds.height) {
    ctx.fillRect(doorBounds.x + 4, doorBounds.y, 2, doorBounds.height);
    ctx.fillRect(doorBounds.x + doorBounds.width - 6, doorBounds.y, 2, doorBounds.height);
    return;
  }

  ctx.fillRect(doorBounds.x, doorBounds.y + 4, doorBounds.width, 2);
  ctx.fillRect(doorBounds.x, doorBounds.y + doorBounds.height - 6, doorBounds.width, 2);
}

function drawKeyhole(ctx, doorBounds, isBossKeyDoor) {
  ctx.fillStyle = isBossKeyDoor ? DOOR_BAR_COLOR : KEYHOLE_COLOR;

  if (doorBounds.width > doorBounds.height) {
    ctx.fillRect(doorBounds.x + Math.floor(doorBounds.width / 2) - 1, doorBounds.y, 2, doorBounds.height);
    return;
  }

  ctx.fillRect(doorBounds.x, doorBounds.y + Math.floor(doorBounds.height / 2) - 1, doorBounds.width, 2);
}

function getRoomBounds(canvas, offset) {
  return {
    left: offset.x,
    top: offset.y,
    right: offset.x + canvas.width,
    bottom: offset.y + canvas.height,
    width: canvas.width,
    height: canvas.height
  };
}

function getDoorBounds(edge, roomBounds) {
  const horizontalDoorStart = Math.floor((roomBounds.width - DOOR_WIDTH) / 2);
  const verticalDoorStart = Math.floor((roomBounds.height - DOOR_WIDTH) / 2);

  if (edge === "top") {
    return {
      x: roomBounds.left + horizontalDoorStart,
      y: roomBounds.top,
      width: DOOR_WIDTH,
      height: WALL_THICKNESS
    };
  }

  if (edge === "bottom") {
    return {
      x: roomBounds.left + horizontalDoorStart,
      y: roomBounds.bottom - WALL_THICKNESS,
      width: DOOR_WIDTH,
      height: WALL_THICKNESS
    };
  }

  if (edge === "left") {
    return {
      x: roomBounds.left,
      y: roomBounds.top + verticalDoorStart,
      width: WALL_THICKNESS,
      height: DOOR_WIDTH
    };
  }

  return {
    x: roomBounds.right - WALL_THICKNESS,
    y: roomBounds.top + verticalDoorStart,
    width: WALL_THICKNESS,
    height: DOOR_WIDTH
  };
}

function getWallSegmentsForDoor(edge, roomBounds, doorBounds, door) {
  if (!door) {
    if (edge === "top") {
      return [{ x: roomBounds.left, y: roomBounds.top, width: roomBounds.width, height: WALL_THICKNESS }];
    }

    if (edge === "right") {
      return [{ x: roomBounds.right - WALL_THICKNESS, y: roomBounds.top, width: WALL_THICKNESS, height: roomBounds.height }];
    }

    if (edge === "bottom") {
      return [{ x: roomBounds.left, y: roomBounds.bottom - WALL_THICKNESS, width: roomBounds.width, height: WALL_THICKNESS }];
    }

    return [{ x: roomBounds.left, y: roomBounds.top, width: WALL_THICKNESS, height: roomBounds.height }];
  }

  if (edge === "top" || edge === "bottom") {
    return [
      {
        x: roomBounds.left,
        y: doorBounds.y,
        width: doorBounds.x - roomBounds.left,
        height: WALL_THICKNESS
      },
      {
        x: doorBounds.x + doorBounds.width,
        y: doorBounds.y,
        width: roomBounds.right - (doorBounds.x + doorBounds.width),
        height: WALL_THICKNESS
      }
    ];
  }

  return [
    {
      x: doorBounds.x,
      y: roomBounds.top,
      width: WALL_THICKNESS,
      height: doorBounds.y - roomBounds.top
    },
    {
      x: doorBounds.x,
      y: doorBounds.y + doorBounds.height,
      width: WALL_THICKNESS,
      height: roomBounds.bottom - (doorBounds.y + doorBounds.height)
    }
  ];
}

function hasCenteredDoors(room) {
  return Boolean(room.doors);
}

function isPlayerAlignedWithDoor(player, door, canvas) {
  if (!door) {
    return false;
  }

  const doorBounds = getDoorBounds(door.edge, {
    left: 0,
    top: 0,
    right: canvas.width,
    bottom: canvas.height,
    width: canvas.width,
    height: canvas.height
  });

  if (door.edge === "left" || door.edge === "right") {
    const playerCenterY = player.y + player.height / 2;

    return playerCenterY >= doorBounds.y && playerCenterY <= doorBounds.y + doorBounds.height;
  }

  const playerCenterX = player.x + player.width / 2;

  return playerCenterX >= doorBounds.x && playerCenterX <= doorBounds.x + doorBounds.width;
}

function getEntityHitbox(entity) {
  return {
    x: Math.round(entity.x),
    y: Math.round(entity.y),
    width: entity.width,
    height: entity.height
  };
}

function overlapsAnyRect(rects, hitbox) {
  return rects.some((rect) => rectanglesOverlap(rect, hitbox));
}
