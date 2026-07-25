import { ZERO_OFFSET } from "../utils.js";
import { getDoorBounds, getRoomBounds } from "./doors/geometry.js";
import { ROOM_BACKGROUND_COLOR } from "./rooms/constants.js";
import { getRoomTransitionOffsets } from "./transition.js";
import { drawDoorRoomWalls, drawInternalWall, drawOpenEdgeRoomWalls } from "./walls/rendering.js";

const DOOR_OPENING_COLOR = "#1a1c2c";
const DOOR_BAR_COLOR = "#d27d2c";
const KEYHOLE_COLOR = "#ffcd75";
const ONE_WAY_PLATFORM_COLOR = "#7e7f82";
const DOOR_EDGES = ["top", "right", "bottom", "left"];

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

  drawRoomBackground(ctx, roomBounds);
  drawRoomWalls(ctx, room, roomBounds);
  drawDoorways(ctx, room, roomBounds);
  drawInternalGeometry(ctx, room, offset);
}

function drawRoomBackground(ctx, roomBounds) {
  ctx.fillStyle = ROOM_BACKGROUND_COLOR;
  ctx.fillRect(roomBounds.left, roomBounds.top, roomBounds.width, roomBounds.height);
}

function drawRoomWalls(ctx, room, roomBounds) {
  if (hasCenteredDoors(room)) {
    drawDoorRoomWalls(ctx, room, roomBounds);
    return;
  }

  drawOpenEdgeRoomWalls(ctx, room, roomBounds);
}

function drawDoorways(ctx, room, roomBounds) {
  if (!hasCenteredDoors(room)) {
    return;
  }

  for (const edge of DOOR_EDGES) {
    drawDoorwayForEdge(ctx, roomBounds, room.doors[edge], edge);
  }
}

function drawDoorwayForEdge(ctx, roomBounds, door, edge) {
  if (!door) {
    return;
  }

  const doorBounds = getDoorBounds(edge, roomBounds, door);

  drawDoorOpening(ctx, doorBounds);
  drawDoorDecoration(ctx, doorBounds, door);
}

function drawDoorOpening(ctx, doorBounds) {
  ctx.fillStyle = DOOR_OPENING_COLOR;
  ctx.fillRect(doorBounds.x, doorBounds.y, doorBounds.width, doorBounds.height);
}

function drawDoorDecoration(ctx, doorBounds, door) {
  if (door.kind === "barred") {
    drawDoorBars(ctx, doorBounds);
    return;
  }

  if (door.kind === "key" || door.kind === "boss-key") {
    drawKeyhole(ctx, doorBounds, door.kind === "boss-key");
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

function drawInternalGeometry(ctx, room, offset) {
  drawInternalWalls(ctx, room.internalWalls ?? [], offset);
  drawOneWayPlatforms(ctx, room.oneWayPlatforms ?? [], offset);
}

function drawInternalWalls(ctx, walls, offset) {
  for (const wall of walls) {
    drawInternalWall(ctx, applyOffset(wall, offset));
  }
}

function drawOneWayPlatforms(ctx, platforms, offset) {
  ctx.fillStyle = ONE_WAY_PLATFORM_COLOR;

  for (const platform of platforms) {
    const drawPlatform = applyOffset(platform, offset);
    ctx.fillRect(drawPlatform.x, drawPlatform.y, drawPlatform.width, drawPlatform.height);
  }
}

function applyOffset(rect, offset) {
  return {
    x: rect.x + offset.x,
    y: rect.y + offset.y,
    width: rect.width,
    height: rect.height
  };
}

function hasCenteredDoors(room) {
  return Boolean(room.doors);
}
