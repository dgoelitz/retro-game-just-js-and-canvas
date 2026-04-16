import { rectanglesOverlap } from "../game-utils.js";
import { DOOR_WIDTH, WALL_THICKNESS } from "./room-data.js";

const ROOM_TRANSITION_DURATION = 0.35;

export function isTransitioning(world) {
  return world.transition !== null;
}

export function updateWorldTransition(world, deltaTime) {
  if (!world.transition) {
    return;
  }

  world.transition.elapsed += deltaTime;

  if (world.transition.elapsed >= world.transition.duration) {
    world.transition = null;
  }
}

export function handleWorldTransition(world, player, roomPropsByRoom, canvas, deltaTime) {
  const completedTransition = world.transition;

  updateWorldTransition(world, deltaTime);

  if (isTransitioning(world) || !completedTransition) {
    return;
  }

  const currentRoomProps = roomPropsByRoom[world.currentRoomIndex] ?? [];
  const enteredFromEdge = getEnteredRoomEdge(completedTransition);

  if (!enteredFromEdge) {
    return;
  }

  pushPlayerOutOfEdgeBlockers(player, currentRoomProps, enteredFromEdge, canvas);
}

export function tryStartRoomTransition(session, canvas) {
  const world = session.worldsByKey[session.activeWorldKey];
  const player = session.player;

  if (world.transition) {
    return false;
  }

  const room = world.rooms[world.currentRoomIndex];

  if (room.doors) {
    return tryStartDoorTransition(session, room, canvas);
  }

  return tryStartOpenEdgeTransition(player, world, canvas);
}

export function getRoomTransitionOffsets(world, canvas) {
  const progress = world.transition.elapsed / world.transition.duration;
  const fromOffsetX = Math.round(world.transition.directionX * progress * canvas.width);
  const fromOffsetY = Math.round(world.transition.directionY * progress * canvas.height);
  const toOffsetX = fromOffsetX - world.transition.directionX * canvas.width;
  const toOffsetY = fromOffsetY - world.transition.directionY * canvas.height;

  return {
    from: {
      x: fromOffsetX,
      y: fromOffsetY
    },
    to: {
      x: toOffsetX,
      y: toOffsetY
    }
  };
}

function tryStartDoorTransition(session, room, canvas) {
  const player = session.player;
  const transitionChecks = [
    { edge: "right", crossed: player.x >= canvas.width, directionX: -1, directionY: 0, resetPlayer() { player.x = 0; } },
    { edge: "left", crossed: player.x + player.width <= 0, directionX: 1, directionY: 0, resetPlayer() { player.x = canvas.width - player.width; } },
    { edge: "top", crossed: player.y + player.height <= 0, directionX: 0, directionY: 1, resetPlayer() { player.y = canvas.height - player.height; } },
    { edge: "bottom", crossed: player.y >= canvas.height, directionX: 0, directionY: -1, resetPlayer() { player.y = 0; } }
  ];

  for (const check of transitionChecks) {
    if (!check.crossed) {
      continue;
    }

    const door = room.doors[check.edge];

    if (!canUseDoor(session, door, canvas)) {
      keepPlayerInsideDoorRoom(player, check.edge, canvas);
      return false;
    }

    check.resetPlayer();
    startRoomTransition(session, door.toRoomIndex, check.directionX, check.directionY);
    return true;
  }

  return false;
}

function keepPlayerInsideDoorRoom(player, edge, canvas) {
  if (edge === "right") {
    player.x = canvas.width - WALL_THICKNESS - player.width;
    return;
  }

  if (edge === "left") {
    player.x = WALL_THICKNESS;
    return;
  }

  if (edge === "top") {
    player.y = WALL_THICKNESS;
    return;
  }

  if (edge === "bottom") {
    player.y = canvas.height - WALL_THICKNESS - player.height;
  }
}

function tryStartOpenEdgeTransition(player, world, canvas) {
  const room = world.rooms[world.currentRoomIndex];

  if (!room.walls.right && room.neighbors.right !== undefined && player.x >= canvas.width) {
    startWorldTransition(world, room.neighbors.right, -1, 0);
    player.x = 0;
    return true;
  }

  if (!room.walls.left && room.neighbors.left !== undefined && player.x + player.width <= 0) {
    startWorldTransition(world, room.neighbors.left, 1, 0);
    player.x = canvas.width - player.width;
    return true;
  }

  if (!room.walls.top && room.neighbors.up !== undefined && player.y + player.height <= 0) {
    startWorldTransition(world, room.neighbors.up, 0, 1);
    player.y = canvas.height - player.height;
    return true;
  }

  if (!room.walls.bottom && room.neighbors.down !== undefined && player.y >= canvas.height) {
    startWorldTransition(world, room.neighbors.down, 0, -1);
    player.y = 0;
    return true;
  }

  return false;
}

function canUseDoor(session, door, canvas) {
  if (!door || door.toRoomIndex === null) {
    return false;
  }

  if (!isPlayerAlignedWithDoor(session.player, door, canvas)) {
    return false;
  }

  if (door.kind === "unlocked") {
    return true;
  }

  if (door.kind === "key" && session.inventory.normalKeys > 0) {
    session.inventory.normalKeys -= 1;
    door.kind = "unlocked";
    return true;
  }

  if (door.kind === "boss-key" && session.inventory.hasBossKey) {
    door.kind = "unlocked";
    return true;
  }

  return false;
}

function startRoomTransition(session, toRoomIndex, directionX, directionY) {
  const world = session.worldsByKey[session.activeWorldKey];
  startWorldTransition(world, toRoomIndex, directionX, directionY);

  if (session.activeWorldKey === "dungeon") {
    session.progress.dungeon.visitedRooms[toRoomIndex] = true;
  }
}

function startWorldTransition(world, toRoomIndex, directionX, directionY) {
  world.transition = {
    fromRoomIndex: world.currentRoomIndex,
    toRoomIndex,
    directionX,
    directionY,
    elapsed: 0,
    duration: ROOM_TRANSITION_DURATION
  };

  world.currentRoomIndex = toRoomIndex;
}

function getEnteredRoomEdge(completedTransition) {
  if (completedTransition.directionX > 0) {
    return "right";
  }

  if (completedTransition.directionX < 0) {
    return "left";
  }

  if (completedTransition.directionY > 0) {
    return "bottom";
  }

  if (completedTransition.directionY < 0) {
    return "top";
  }

  return null;
}

function pushPlayerOutOfEdgeBlockers(player, roomProps, edge, canvas) {
  const step = 1;

  if (edge === "left") {
    while (player.x < canvas.width && overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
      player.x += step;
    }
    return;
  }

  if (edge === "right") {
    while (player.x > -player.width && overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
      player.x -= step;
    }
    return;
  }

  if (edge === "top") {
    while (player.y < canvas.height && overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
      player.y += step;
    }
    return;
  }

  if (edge === "bottom") {
    while (player.y > -player.height && overlapsBlockingProp(roomProps, getEntityHitbox(player))) {
      player.y -= step;
    }
  }
}

function isPlayerAlignedWithDoor(player, door, canvas) {
  const doorBounds = getDoorBounds(door.edge, canvas, door);

  if (door.edge === "left" || door.edge === "right") {
    const playerCenterY = player.y + player.height / 2;

    return playerCenterY >= doorBounds.y && playerCenterY <= doorBounds.y + doorBounds.height;
  }

  const playerCenterX = player.x + player.width / 2;

  return playerCenterX >= doorBounds.x && playerCenterX <= doorBounds.x + doorBounds.width;
}

function getDoorBounds(edge, canvas, door = null) {
  const horizontalDoorStart = door?.offset ?? Math.floor((canvas.width - DOOR_WIDTH) / 2);
  const verticalDoorStart = door?.offset ?? Math.floor((canvas.height - DOOR_WIDTH) / 2);

  if (edge === "top") {
    return {
      x: horizontalDoorStart,
      y: 0,
      width: DOOR_WIDTH,
      height: 4
    };
  }

  if (edge === "bottom") {
    return {
      x: horizontalDoorStart,
      y: canvas.height - 4,
      width: DOOR_WIDTH,
      height: 4
    };
  }

  if (edge === "left") {
    return {
      x: 0,
      y: verticalDoorStart,
      width: 4,
      height: DOOR_WIDTH
    };
  }

  return {
    x: canvas.width - 4,
    y: verticalDoorStart,
    width: 4,
    height: DOOR_WIDTH
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
