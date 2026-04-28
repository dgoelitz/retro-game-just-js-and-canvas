import { DOOR_WIDTH, WALL_THICKNESS } from "./room-data.js";

export function getRoomBounds(canvas, offset) {
  return {
    left: offset.x,
    top: offset.y,
    right: offset.x + canvas.width,
    bottom: offset.y + canvas.height,
    width: canvas.width,
    height: canvas.height
  };
}

export function getDoorBounds(edge, roomBounds, door = null) {
  const horizontalDoorStart = door?.offset ?? Math.floor((roomBounds.width - DOOR_WIDTH) / 2);
  const verticalDoorStart = door?.offset ?? Math.floor((roomBounds.height - DOOR_WIDTH) / 2);

  if (edge === "top") {
    return {
      x: roomBounds.left + horizontalDoorStart,
      y: roomBounds.top,
      width: DOOR_WIDTH,
      height: WALL_THICKNESS
    };
  }

  if (edge === "bottom") {
    return {
      x: roomBounds.left + horizontalDoorStart,
      y: roomBounds.bottom - WALL_THICKNESS,
      width: DOOR_WIDTH,
      height: WALL_THICKNESS
    };
  }

  if (edge === "left") {
    return {
      x: roomBounds.left,
      y: roomBounds.top + verticalDoorStart,
      width: WALL_THICKNESS,
      height: DOOR_WIDTH
    };
  }

  return {
    x: roomBounds.right - WALL_THICKNESS,
    y: roomBounds.top + verticalDoorStart,
    width: WALL_THICKNESS,
    height: DOOR_WIDTH
  };
}

export function isPlayerAlignedWithDoor(player, door, canvas) {
  if (!door) {
    return false;
  }

  const roomBounds = getRoomBounds(canvas, {
    x: 0,
    y: 0
  });
  const doorBounds = getDoorBounds(door.edge, roomBounds, door);

  if (door.edge === "left" || door.edge === "right") {
    const playerCenterY = player.y + player.height / 2;

    return playerCenterY >= doorBounds.y && playerCenterY <= doorBounds.y + doorBounds.height;
  }

  const playerCenterX = player.x + player.width / 2;

  return playerCenterX >= doorBounds.x && playerCenterX <= doorBounds.x + doorBounds.width;
}
