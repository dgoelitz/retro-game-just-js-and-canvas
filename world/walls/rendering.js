import { getDoorBounds } from "../doors/geometry.js";
import { WALL_COLOR, WALL_THICKNESS } from "../rooms/constants.js";

const WALL_SPRITE_SIZE = 4;
const WALL_EDGE_FRAME = { x: 0, y: 0, width: WALL_SPRITE_SIZE, height: WALL_SPRITE_SIZE };
const WALL_CORNER_FRAME = { x: WALL_SPRITE_SIZE, y: 0, width: WALL_SPRITE_SIZE, height: WALL_SPRITE_SIZE };
const WALL_EDGES = ["top", "right", "bottom", "left"];
const WALL_EDGE_ROTATION = {
  top: 0,
  right: Math.PI / 2,
  bottom: Math.PI,
  left: -Math.PI / 2
};
const WALL_CORNER_ROTATION = {
  topLeft: 0,
  topRight: Math.PI / 2,
  bottomRight: Math.PI,
  bottomLeft: -Math.PI / 2
};

const wallSprites = new Image();
wallSprites.src = "assets/walls.png";

export function drawOpenEdgeRoomWalls(ctx, room, roomBounds) {
  for (const edge of WALL_EDGES) {
    if (!room.walls[edge]) {
      continue;
    }

    drawWallSegment(ctx, getFullWallSegment(roomBounds, edge), edge);
  }

  drawRoomCorners(ctx, roomBounds, getOpenEdgeCorners(room.walls));
}

export function drawDoorRoomWalls(ctx, room, roomBounds) {
  for (const edge of WALL_EDGES) {
    const door = room.doors[edge];
    const doorBounds = getDoorBounds(edge, roomBounds, door);
    const wallSegments = getWallSegmentsAroundDoor(edge, roomBounds, doorBounds, door);

    for (const segment of wallSegments) {
      drawWallSegment(ctx, segment, edge);
    }
  }

  drawRoomCorners(ctx, roomBounds, {
    topLeft: true,
    topRight: true,
    bottomRight: true,
    bottomLeft: true
  });
}

export function drawInternalWall(ctx, wall) {
  if (wall.height === WALL_THICKNESS) {
    drawWallSegment(ctx, wall, "top");
    return;
  }

  if (wall.width === WALL_THICKNESS) {
    drawWallSegment(ctx, wall, "left");
    return;
  }

  drawFallbackWall(ctx, wall);
}

function getFullWallSegment(roomBounds, edge) {
  if (edge === "top") {
    return { x: roomBounds.left, y: roomBounds.top, width: roomBounds.width, height: WALL_THICKNESS };
  }

  if (edge === "right") {
    return {
      x: roomBounds.right - WALL_THICKNESS,
      y: roomBounds.top,
      width: WALL_THICKNESS,
      height: roomBounds.height
    };
  }

  if (edge === "bottom") {
    return {
      x: roomBounds.left,
      y: roomBounds.bottom - WALL_THICKNESS,
      width: roomBounds.width,
      height: WALL_THICKNESS
    };
  }

  return { x: roomBounds.left, y: roomBounds.top, width: WALL_THICKNESS, height: roomBounds.height };
}

function getOpenEdgeCorners(walls) {
  return {
    topLeft: walls.top && walls.left,
    topRight: walls.top && walls.right,
    bottomRight: walls.bottom && walls.right,
    bottomLeft: walls.bottom && walls.left
  };
}

function getWallSegmentsAroundDoor(edge, roomBounds, doorBounds, door) {
  if (!door) {
    return [getFullWallSegment(roomBounds, edge)];
  }

  if (isHorizontalEdge(edge)) {
    return [
      {
        x: roomBounds.left,
        y: doorBounds.y,
        width: doorBounds.x - roomBounds.left,
        height: WALL_THICKNESS
      },
      {
        x: doorBounds.x + doorBounds.width,
        y: doorBounds.y,
        width: roomBounds.right - (doorBounds.x + doorBounds.width),
        height: WALL_THICKNESS
      }
    ];
  }

  return [
    {
      x: doorBounds.x,
      y: roomBounds.top,
      width: WALL_THICKNESS,
      height: doorBounds.y - roomBounds.top
    },
    {
      x: doorBounds.x,
      y: doorBounds.y + doorBounds.height,
      width: WALL_THICKNESS,
      height: roomBounds.bottom - (doorBounds.y + doorBounds.height)
    }
  ];
}

export function drawWallSegment(ctx, segment, edge) {
  if (!isWallSpriteReady()) {
    drawFallbackWall(ctx, segment);
    return;
  }

  for (const tile of getWallTiles(segment, edge)) {
    drawWallSpriteFrame(ctx, WALL_EDGE_FRAME, tile.x, tile.y, WALL_EDGE_ROTATION[edge]);
  }
}

export function drawWallSegmentWithCorners(ctx, segment, edge, cornerNames = []) {
  if (!isWallSpriteReady()) {
    drawFallbackWall(ctx, segment);
    return;
  }

  drawWallSegment(ctx, segment, edge);

  for (const corner of getWallSegmentCorners(segment, cornerNames)) {
    drawWallSpriteFrame(ctx, WALL_CORNER_FRAME, corner.x, corner.y, WALL_CORNER_ROTATION[corner.name]);
  }
}

function getWallSegmentCorners(segment, cornerNames) {
  return cornerNames.map((name) => getWallSegmentCornerPosition(segment, name));
}

function getWallSegmentCornerPosition(segment, cornerName) {
  const xByCorner = {
    topLeft: segment.x,
    bottomLeft: segment.x,
    topRight: segment.x + segment.width - WALL_THICKNESS,
    bottomRight: segment.x + segment.width - WALL_THICKNESS
  };
  const yByCorner = {
    topLeft: segment.y,
    topRight: segment.y,
    bottomRight: segment.y + segment.height - WALL_THICKNESS,
    bottomLeft: segment.y + segment.height - WALL_THICKNESS
  };

  return {
    name: cornerName,
    x: xByCorner[cornerName],
    y: yByCorner[cornerName]
  };
}

function getWallTiles(segment, edge) {
  const tileCount = getWallTileCount(segment, edge);
  const tiles = [];

  for (let i = 0; i < tileCount; i += 1) {
    tiles.push(getWallTilePosition(segment, edge, i));
  }

  return tiles;
}

function getWallTileCount(segment, edge) {
  const segmentLength = isHorizontalEdge(edge) ? segment.width : segment.height;

  return Math.ceil(segmentLength / WALL_SPRITE_SIZE);
}

function getWallTilePosition(segment, edge, index) {
  if (isHorizontalEdge(edge)) {
    return {
      x: segment.x + index * WALL_SPRITE_SIZE,
      y: segment.y
    };
  }

  return {
    x: segment.x,
    y: segment.y + index * WALL_SPRITE_SIZE
  };
}

function drawRoomCorners(ctx, roomBounds, corners) {
  if (!isWallSpriteReady()) {
    return;
  }

  const cornerTiles = getCornerTiles(roomBounds, corners);

  for (const corner of cornerTiles) {
    drawWallSpriteFrame(ctx, WALL_CORNER_FRAME, corner.x, corner.y, WALL_CORNER_ROTATION[corner.name]);
  }
}

function getCornerTiles(roomBounds, corners) {
  const allCorners = [
    { name: "topLeft", x: roomBounds.left, y: roomBounds.top },
    { name: "topRight", x: roomBounds.right - WALL_THICKNESS, y: roomBounds.top },
    { name: "bottomRight", x: roomBounds.right - WALL_THICKNESS, y: roomBounds.bottom - WALL_THICKNESS },
    { name: "bottomLeft", x: roomBounds.left, y: roomBounds.bottom - WALL_THICKNESS }
  ];

  return allCorners.filter((corner) => corners[corner.name]);
}

function drawWallSpriteFrame(ctx, frame, x, y, rotation) {
  const tileCenter = WALL_SPRITE_SIZE / 2;

  ctx.save();
  ctx.translate(x + tileCenter, y + tileCenter);
  ctx.rotate(rotation);
  ctx.drawImage(
    wallSprites,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    -tileCenter,
    -tileCenter,
    WALL_SPRITE_SIZE,
    WALL_SPRITE_SIZE
  );
  ctx.restore();
}

function drawFallbackWall(ctx, wall) {
  ctx.fillStyle = WALL_COLOR;
  ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
}

function isHorizontalEdge(edge) {
  return edge === "top" || edge === "bottom";
}

function isWallSpriteReady() {
  return wallSprites.complete && wallSprites.naturalWidth > 0;
}
