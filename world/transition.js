import { getRoundedHitbox, rectanglesOverlap } from "../utils.js";
import { isPlayerAlignedWithDoor } from "./doors/geometry.js";
import { WORLD_KEY_DUNGEON } from "./keys.js";
import { DUNGEON_ROOM_ENTRY_GRACE_DURATION, WALL_THICKNESS } from "./rooms/constants.js";

const ROOM_TRANSITION_DURATION = 0.35;
const ROOM_EDGE_TRANSITIONS = [
  {
    edge: "right",
    neighborKey: "right",
    directionX: -1,
    directionY: 0,
    hasCrossed(player, canvas) {
      return player.x >= canvas.width;
    },
    movePlayerIntoNextRoom(player) {
      player.x = 0;
    },
    keepPlayerInsideRoom(player, canvas) {
      player.x = canvas.width - WALL_THICKNESS - player.width;
    },
    pushPlayerOutOfBlockers(player) {
      player.x += 1;
    },
    canKeepPushing(player, canvas) {
      return player.x < canvas.width;
    }
  },
  {
    edge: "left",
    neighborKey: "left",
    directionX: 1,
    directionY: 0,
    hasCrossed(player) {
      return player.x + player.width <= 0;
    },
    movePlayerIntoNextRoom(player, canvas) {
      player.x = canvas.width - player.width;
    },
    keepPlayerInsideRoom(player) {
      player.x = WALL_THICKNESS;
    },
    pushPlayerOutOfBlockers(player) {
      player.x -= 1;
    },
    canKeepPushing(player) {
      return player.x > -player.width;
    }
  },
  {
    edge: "top",
    neighborKey: "up",
    directionX: 0,
    directionY: 1,
    hasCrossed(player) {
      return player.y + player.height <= 0;
    },
    movePlayerIntoNextRoom(player, canvas) {
      player.y = canvas.height - player.height;
    },
    keepPlayerInsideRoom(player) {
      player.y = WALL_THICKNESS;
    },
    pushPlayerOutOfBlockers(player) {
      player.y -= 1;
    },
    canKeepPushing(player) {
      return player.y > -player.height;
    }
  },
  {
    edge: "bottom",
    neighborKey: "down",
    directionX: 0,
    directionY: -1,
    hasCrossed(player, canvas) {
      return player.y >= canvas.height;
    },
    movePlayerIntoNextRoom(player) {
      player.y = 0;
    },
    keepPlayerInsideRoom(player, canvas) {
      player.y = canvas.height - WALL_THICKNESS - player.height;
    },
    pushPlayerOutOfBlockers(player) {
      player.y += 1;
    },
    canKeepPushing(player, canvas) {
      return player.y < canvas.height;
    }
  }
];

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
  const enteredFromEdge = getTransitionByDirection(completedTransition);

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
  const crossedEdge = findCrossedRoomEdge(player, canvas);

  if (!crossedEdge) {
    return false;
  }

  const door = room.doors[crossedEdge.edge];

  if (!canUseDoor(session, door, canvas)) {
    crossedEdge.keepPlayerInsideRoom(player, canvas);
    return false;
  }

  crossedEdge.movePlayerIntoNextRoom(player, canvas);
  startRoomTransition(session, door.toRoomIndex, crossedEdge.directionX, crossedEdge.directionY);
  return true;
}

function tryStartOpenEdgeTransition(player, world, canvas) {
  const room = world.rooms[world.currentRoomIndex];

  for (const edgeTransition of ROOM_EDGE_TRANSITIONS) {
    const hasWall = room.walls[edgeTransition.edge];
    const neighboringRoomIndex = room.neighbors[edgeTransition.neighborKey];

    if (hasWall || neighboringRoomIndex === undefined || !edgeTransition.hasCrossed(player, canvas)) {
      continue;
    }

    startWorldTransition(
      world,
      neighboringRoomIndex,
      edgeTransition.directionX,
      edgeTransition.directionY
    );
    edgeTransition.movePlayerIntoNextRoom(player, canvas);
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

  if (session.activeWorldKey === WORLD_KEY_DUNGEON) {
    applyDungeonRoomEntryState(session, toRoomIndex);
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

function findCrossedRoomEdge(player, canvas) {
  return ROOM_EDGE_TRANSITIONS.find((edgeTransition) => edgeTransition.hasCrossed(player, canvas)) ?? null;
}

function getTransitionByDirection(transition) {
  return ROOM_EDGE_TRANSITIONS.find((edgeTransition) => (
    edgeTransition.directionX === transition.directionX
    && edgeTransition.directionY === transition.directionY
  )) ?? null;
}

function pushPlayerOutOfEdgeBlockers(player, roomProps, edgeTransition, canvas) {
  while (edgeTransition.canKeepPushing(player, canvas) && overlapsBlockingProp(roomProps, getRoundedHitbox(player))) {
    edgeTransition.pushPlayerOutOfBlockers(player);
  }
}

function applyDungeonRoomEntryState(session, roomIndex) {
  session.progress.dungeon.visitedRooms[roomIndex] = true;
  session.roomEntryGraceTimer = DUNGEON_ROOM_ENTRY_GRACE_DURATION;
  session.blockedDoorMessagesShown = {};
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
