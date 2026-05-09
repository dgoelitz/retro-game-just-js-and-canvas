import {
  getRoundedHitbox,
  rectanglesOverlap,
  rectanglesOverlapAny,
  resolveAxisSeparatedCollision
} from "../utils.js";
import { isPlayerAlignedWithDoor } from "./doors/geometry.js";
import {
  handleWorldTransition,
  isTransitioning,
  tryStartRoomTransition
} from "./transition.js";
import { WALL_THICKNESS } from "./rooms/constants.js";
import { renderWorld } from "./rendering.js";

const DOOR_EDGES = ["left", "right", "top", "bottom"];

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

export { handleWorldTransition, isTransitioning, renderWorld, tryStartRoomTransition };

export function constrainPlayerToRoom(player, world, canvas, inventory = null) {
  const room = getCurrentRoom(world);

  if (hasCenteredDoors(room)) {
    constrainPlayerToDoorRoom(player, room, canvas, inventory);
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

export function getBlockedDoorKindAtRoomEdge(player, world, canvas, inventory = null) {
  const room = getCurrentRoom(world);

  if (!hasCenteredDoors(room)) {
    return null;
  }

  for (const edge of DOOR_EDGES) {
    const blockedDoorKind = getBlockedDoorKindForEdge(player, room, canvas, inventory, edge);

    if (blockedDoorKind) {
      return blockedDoorKind;
    }
  }

  return null;
}

function resolveSolidWallCollisions(player, previousPosition, collisionRects) {
  resolveAxisSeparatedCollision(player, previousPosition, (hitbox) => (
    rectanglesOverlapAny(collisionRects, hitbox)
  ));
}

function resolveOneWayPlatformCollisions(player, previousPosition, platforms) {
  for (const platform of platforms) {
    if (platform.blocksDirection === "right") {
      const previousRight = previousPosition.x + player.width;
      const currentRight = player.x + player.width;
      const crossesBlockingEdge = previousRight <= platform.x && currentRight > platform.x;
      const overlapsPlatformHeight = overlapsOnYAxis(player, platform);

      if (crossesBlockingEdge && overlapsPlatformHeight) {
        player.x = platform.x - player.width;
        return;
      }

      continue;
    }

    if (platform.blocksDirection === "left") {
      const previousLeft = previousPosition.x;
      const platformRight = platform.x + platform.width;
      const crossesBlockingEdge = previousLeft >= platformRight && player.x < platformRight;
      const overlapsPlatformHeight = overlapsOnYAxis(player, platform);

      if (crossesBlockingEdge && overlapsPlatformHeight) {
        player.x = platformRight;
        return;
      }

      continue;
    }

    const movedHitbox = getRoundedHitbox(player);

    if (!rectanglesOverlap(platform, movedHitbox)) {
      continue;
    }

    const previousBottom = previousPosition.y + player.height;
    const movedUpIntoPlatform = player.y < previousPosition.y && previousBottom >= platform.y + platform.height;

    if (movedUpIntoPlatform) {
      player.y = previousPosition.y;
      return;
    }
  }
}

function overlapsOnYAxis(player, platform) {
  const playerTop = player.y;
  const playerBottom = player.y + player.height;
  const platformTop = platform.y;
  const platformBottom = platform.y + platform.height;

  return playerBottom > platformTop && playerTop < platformBottom;
}

function constrainPlayerToDoorRoom(player, room, canvas, inventory) {
  for (const edge of DOOR_EDGES) {
    constrainPlayerAtDoorEdge(player, room, canvas, inventory, edge);
  }
}

function constrainPlayerAtDoorEdge(player, room, canvas, inventory, edge) {
  const door = room.doors?.[edge];
  const isAlignedWithDoor = isPlayerAlignedWithDoor(player, door, canvas);
  const allowsLeavingThroughDoor = door && isPassableDoor(door, inventory) && isAlignedWithDoor;

  if (allowsLeavingThroughDoor || !isPlayerPastRoomEdge(player, canvas, edge)) {
    return;
  }

  keepPlayerInsideRoomEdge(player, canvas, edge);
}

function getBlockedDoorKindForEdge(player, room, canvas, inventory, edge) {
  const door = room.doors?.[edge];

  if (!door || isPassableDoor(door, inventory) || !isPlayerAlignedWithDoor(player, door, canvas)) {
    return null;
  }

  return isPlayerPastRoomEdge(player, canvas, edge) ? door.kind : null;
}

function isPassableDoor(door, inventory) {
  if (door.kind === "unlocked") {
    return true;
  }

  if (door.kind === "key") {
    return inventory?.normalKeys > 0;
  }

  if (door.kind === "boss-key") {
    return inventory?.hasBossKey === true;
  }

  return false;
}

function hasCenteredDoors(room) {
  return Boolean(room.doors);
}

function isPlayerPastRoomEdge(player, canvas, edge) {
  if (edge === "left") {
    return player.x < WALL_THICKNESS;
  }

  if (edge === "right") {
    return player.x + player.width > canvas.width - WALL_THICKNESS;
  }

  if (edge === "top") {
    return player.y < WALL_THICKNESS;
  }

  return player.y + player.height > canvas.height - WALL_THICKNESS;
}

function keepPlayerInsideRoomEdge(player, canvas, edge) {
  if (edge === "left") {
    player.x = WALL_THICKNESS;
    return;
  }

  if (edge === "right") {
    player.x = canvas.width - WALL_THICKNESS - player.width;
    return;
  }

  if (edge === "top") {
    player.y = WALL_THICKNESS;
    return;
  }

  player.y = canvas.height - WALL_THICKNESS - player.height;
}
