const WALL_COLOR = "#5f574f";
const WALL_THICKNESS = 4;
const ROOM_BACKGROUND_COLOR = "#1d2b53";
const ROOM_TRANSITION_DURATION = 0.35;

export function createWorld() {
  return {
    currentRoomIndex: 0,
    transition: null,
    rooms: [
      {
        walls: {
          top: true,
          right: false,
          bottom: true,
          left: true
        },
        neighbors: {
          right: 1
        }
      },
      {
        walls: {
          top: false,
          right: false,
          bottom: true,
          left: false
        },
        neighbors: {
          left: 0,
          right: 2,
          up: 3
        }
      },
      {
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: false
        },
        neighbors: {
          left: 1
        }
      },
      {
        walls: {
          top: true,
          right: true,
          bottom: false,
          left: true
        },
        neighbors: {
          down: 1
        }
      }
    ]
  };
}

export function getCurrentRoom(world) {
  return world.rooms[world.currentRoomIndex];
}

export function renderWorld(ctx, world, canvas, renderRoomContents) {
  if (!world.transition) {
    renderRoom(ctx, getCurrentRoom(world), canvas, 0, 0);
    renderRoomContents(world.currentRoomIndex, 0, 0);
    return;
  }

  const progress = world.transition.elapsed / world.transition.duration;
  const fromOffsetX = Math.round(world.transition.directionX * progress * canvas.width);
  const fromOffsetY = Math.round(world.transition.directionY * progress * canvas.height);
  const toOffsetX = fromOffsetX - world.transition.directionX * canvas.width;
  const toOffsetY = fromOffsetY - world.transition.directionY * canvas.height;

  renderRoom(ctx, world.rooms[world.transition.fromRoomIndex], canvas, fromOffsetX, fromOffsetY);
  renderRoomContents(world.transition.fromRoomIndex, fromOffsetX, fromOffsetY);

  renderRoom(ctx, world.rooms[world.transition.toRoomIndex], canvas, toOffsetX, toOffsetY);
  renderRoomContents(world.transition.toRoomIndex, toOffsetX, toOffsetY);
}

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

function renderRoom(ctx, room, canvas, offsetX, offsetY) {
  ctx.fillStyle = ROOM_BACKGROUND_COLOR;
  ctx.fillRect(offsetX, offsetY, canvas.width, canvas.height);

  ctx.fillStyle = WALL_COLOR;

  if (room.walls.top) {
    ctx.fillRect(offsetX, offsetY, canvas.width, WALL_THICKNESS);
  }

  if (room.walls.right) {
    ctx.fillRect(offsetX + canvas.width - WALL_THICKNESS, offsetY, WALL_THICKNESS, canvas.height);
  }

  if (room.walls.bottom) {
    ctx.fillRect(offsetX, offsetY + canvas.height - WALL_THICKNESS, canvas.width, WALL_THICKNESS);
  }

  if (room.walls.left) {
    ctx.fillRect(offsetX, offsetY, WALL_THICKNESS, canvas.height);
  }
}

export function constrainPlayerToRoom(player, world, canvas) {
  const room = getCurrentRoom(world);

  if (room.walls.left && player.x < WALL_THICKNESS) {
    player.x = WALL_THICKNESS;
  }

  if (room.walls.right && player.x + player.width > canvas.width - WALL_THICKNESS) {
    player.x = canvas.width - WALL_THICKNESS - player.width;
  }

  if (room.walls.top && player.y < WALL_THICKNESS) {
    player.y = WALL_THICKNESS;
  }

  if (room.walls.bottom && player.y + player.height > canvas.height - WALL_THICKNESS) {
    player.y = canvas.height - WALL_THICKNESS - player.height;
  }
}

export function tryStartRoomTransition(player, world, canvas) {
  if (world.transition) {
    return false;
  }

  const room = getCurrentRoom(world);

  if (!room.walls.right && room.neighbors.right !== undefined && player.x >= canvas.width) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: room.neighbors.right,
      directionX: -1,
      directionY: 0,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex = room.neighbors.right;
    player.x = 0;
    return true;
  }

  if (!room.walls.left && room.neighbors.left !== undefined && player.x + player.width <= 0) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: room.neighbors.left,
      directionX: 1,
      directionY: 0,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex = room.neighbors.left;
    player.x = canvas.width - player.width;
    return true;
  }

  if (!room.walls.top && room.neighbors.up !== undefined && player.y + player.height <= 0) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: room.neighbors.up,
      directionX: 0,
      directionY: 1,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex = room.neighbors.up;
    player.y = canvas.height - player.height;
    return true;
  }

  if (!room.walls.bottom && room.neighbors.down !== undefined && player.y >= canvas.height) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: room.neighbors.down,
      directionX: 0,
      directionY: -1,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex = room.neighbors.down;
    player.y = 0;
    return true;
  }

  return false;
}
