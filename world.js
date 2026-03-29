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
        }
      },
      {
        walls: {
          top: true,
          right: true,
          bottom: true,
          left: false
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
    renderRoom(ctx, getCurrentRoom(world), canvas, 0);
    renderRoomContents(world.currentRoomIndex, 0);
    return;
  }

  const transitionOffset = (world.transition.elapsed / world.transition.duration) * canvas.width;
  const fromOffset = Math.round(world.transition.direction * transitionOffset);
  const toOffset = fromOffset - world.transition.direction * canvas.width;

  renderRoom(ctx, world.rooms[world.transition.fromRoomIndex], canvas, fromOffset);
  renderRoomContents(world.transition.fromRoomIndex, fromOffset);

  renderRoom(ctx, world.rooms[world.transition.toRoomIndex], canvas, toOffset);
  renderRoomContents(world.transition.toRoomIndex, toOffset);
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

function renderRoom(ctx, room, canvas, offsetX) {
  ctx.fillStyle = ROOM_BACKGROUND_COLOR;
  ctx.fillRect(offsetX, 0, canvas.width, canvas.height);

  ctx.fillStyle = WALL_COLOR;

  if (room.walls.top) {
    ctx.fillRect(offsetX, 0, canvas.width, WALL_THICKNESS);
  }

  if (room.walls.right) {
    ctx.fillRect(offsetX + canvas.width - WALL_THICKNESS, 0, WALL_THICKNESS, canvas.height);
  }

  if (room.walls.bottom) {
    ctx.fillRect(offsetX, canvas.height - WALL_THICKNESS, canvas.width, WALL_THICKNESS);
  }

  if (room.walls.left) {
    ctx.fillRect(offsetX, 0, WALL_THICKNESS, canvas.height);
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

  if (!room.walls.right && player.x >= canvas.width) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: world.currentRoomIndex + 1,
      direction: -1,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex += 1;
    player.x = 0;
    return true;
  }

  if (!room.walls.left && player.x + player.width <= 0) {
    world.transition = {
      fromRoomIndex: world.currentRoomIndex,
      toRoomIndex: world.currentRoomIndex - 1,
      direction: 1,
      elapsed: 0,
      duration: ROOM_TRANSITION_DURATION
    };
    world.currentRoomIndex -= 1;
    player.x = canvas.width - player.width;
    return true;
  }

  return false;
}
