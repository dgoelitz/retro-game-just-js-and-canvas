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

export function tryStartRoomTransition(player, world, canvas) {
  if (world.transition) {
    return false;
  }

  const room = world.rooms[world.currentRoomIndex];

  if (!room.walls.right && room.neighbors.right !== undefined && player.x >= canvas.width) {
    startRoomTransition(world, room.neighbors.right, -1, 0);
    player.x = 0;
    return true;
  }

  if (!room.walls.left && room.neighbors.left !== undefined && player.x + player.width <= 0) {
    startRoomTransition(world, room.neighbors.left, 1, 0);
    player.x = canvas.width - player.width;
    return true;
  }

  if (!room.walls.top && room.neighbors.up !== undefined && player.y + player.height <= 0) {
    startRoomTransition(world, room.neighbors.up, 0, 1);
    player.y = canvas.height - player.height;
    return true;
  }

  if (!room.walls.bottom && room.neighbors.down !== undefined && player.y >= canvas.height) {
    startRoomTransition(world, room.neighbors.down, 0, -1);
    player.y = 0;
    return true;
  }

  return false;
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

function startRoomTransition(world, toRoomIndex, directionX, directionY) {
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
