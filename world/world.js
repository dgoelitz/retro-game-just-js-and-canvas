import { rectanglesOverlap } from "../game-utils.js";
import { isPlayerAlignedWithDoor } from "./door-geometry.js";
import {
  handleWorldTransition,
  isTransitioning,
  tryStartRoomTransition
} from "./room-transition.js";
import { WALL_THICKNESS } from "./room-constants.js";
import { renderWorld } from "./world-rendering.js";

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

  return (
    getBlockedDoorKindForEdge(player, room, canvas, inventory, "left") ??
    getBlockedDoorKindForEdge(player, room, canvas, inventory, "right") ??
    getBlockedDoorKindForEdge(player, room, canvas, inventory, "top") ??
    getBlockedDoorKindForEdge(player, room, canvas, inventory, "bottom")
  );
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

    const movedHitbox = getEntityHitbox(player);

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
  constrainAxisToDoorRoom(player, room, canvas, inventory, "left");
  constrainAxisToDoorRoom(player, room, canvas, inventory, "right");
  constrainAxisToDoorRoom(player, room, canvas, inventory, "top");
  constrainAxisToDoorRoom(player, room, canvas, inventory, "bottom");
}

function constrainAxisToDoorRoom(player, room, canvas, inventory, edge) {
  const door = room.doors?.[edge];
  const isAlignedWithDoor = isPlayerAlignedWithDoor(player, door, canvas);
  const allowsLeavingThroughDoor = door && isPassableDoor(door, inventory) && isAlignedWithDoor;

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

function getBlockedDoorKindForEdge(player, room, canvas, inventory, edge) {
  const door = room.doors?.[edge];

  if (!door || isPassableDoor(door, inventory) || !isPlayerAlignedWithDoor(player, door, canvas)) {
    return null;
  }

  if (edge === "left" && player.x < WALL_THICKNESS) {
    return door.kind;
  }

  if (edge === "right" && player.x + player.width > canvas.width - WALL_THICKNESS) {
    return door.kind;
  }

  if (edge === "top" && player.y < WALL_THICKNESS) {
    return door.kind;
  }

  if (edge === "bottom" && player.y + player.height > canvas.height - WALL_THICKNESS) {
    return door.kind;
  }

  return null;
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
