import { ZERO_OFFSET } from "../game-utils.js";
import {
  getRoomTransitionOffsets,
  handleWorldTransition,
  isTransitioning,
  tryStartRoomTransition
} from "./room-transition.js";
import { createRooms, ROOM_BACKGROUND_COLOR, WALL_COLOR, WALL_THICKNESS } from "./room-data.js";

export function createWorld() {
  return {
    currentRoomIndex: 0,
    transition: null,
    rooms: createRooms()
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
  const fromOffset = {
    x: transitionOffsets.from.x,
    y: transitionOffsets.from.y
  };
  const toOffset = {
    x: transitionOffsets.to.x,
    y: transitionOffsets.to.y
  };

  renderRoom(ctx, world.rooms[world.transition.fromRoomIndex], canvas, fromOffset);
  renderRoomContents(world.transition.fromRoomIndex, fromOffset);

  renderRoom(ctx, world.rooms[world.transition.toRoomIndex], canvas, toOffset);
  renderRoomContents(world.transition.toRoomIndex, toOffset);
}

export function constrainPlayerToRoom(player, world, canvas) {
  const room = getCurrentRoom(world);
  const minX = room.walls.left ? WALL_THICKNESS : -player.width;
  const maxX = room.walls.right ? canvas.width - WALL_THICKNESS - player.width : canvas.width;
  const minY = room.walls.top ? WALL_THICKNESS : -player.height;
  const maxY = room.walls.bottom ? canvas.height - WALL_THICKNESS - player.height : canvas.height;

  if (player.x < minX) player.x = minX;
  if (player.x > maxX) player.x = maxX;
  if (player.y < minY) player.y = minY;
  if (player.y > maxY) player.y = maxY;
}

function renderRoom(ctx, room, canvas, offset) {
  const roomBounds = getRoomBounds(canvas, offset);

  ctx.fillStyle = ROOM_BACKGROUND_COLOR;
  ctx.fillRect(roomBounds.left, roomBounds.top, roomBounds.width, roomBounds.height);

  drawRoomWalls(ctx, room, roomBounds);
}

function drawRoomWalls(ctx, room, roomBounds) {
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
