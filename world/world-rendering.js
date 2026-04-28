import { ZERO_OFFSET } from "../game-utils.js";
import { getRoomTransitionOffsets } from "./room-transition.js";
import { ROOM_BACKGROUND_COLOR, WALL_COLOR, WALL_THICKNESS } from "./room-data.js";
import { getDoorBounds, getRoomBounds } from "./door-geometry.js";

const DOOR_OPENING_COLOR = "#1a1c2c";
const DOOR_BAR_COLOR = "#d27d2c";
const KEYHOLE_COLOR = "#ffcd75";
const ONE_WAY_PLATFORM_COLOR = "#7e7f82";

export function renderWorld(ctx, world, canvas, renderRoomContents) {
  if (!world.transition) {
    renderRoom(ctx, world.rooms[world.currentRoomIndex], canvas, ZERO_OFFSET);
    renderRoomContents(world.currentRoomIndex, ZERO_OFFSET);
    return;
  }

  const transitionOffsets = getRoomTransitionOffsets(world, canvas);

  renderRoom(ctx, world.rooms[world.transition.fromRoomIndex], canvas, transitionOffsets.from);
  renderRoomContents(world.transition.fromRoomIndex, transitionOffsets.from);

  renderRoom(ctx, world.rooms[world.transition.toRoomIndex], canvas, transitionOffsets.to);
  renderRoomContents(world.transition.toRoomIndex, transitionOffsets.to);
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
  const doorBounds = getDoorBounds(edge, roomBounds, door);
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

  for (const wall of internalWalls) {
    ctx.fillStyle = WALL_COLOR;
    ctx.fillRect(wall.x + offset.x, wall.y + offset.y, wall.width, wall.height);
  }

  for (const platform of oneWayPlatforms) {
    ctx.fillStyle = ONE_WAY_PLATFORM_COLOR;
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
