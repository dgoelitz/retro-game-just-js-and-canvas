const MAP_BACKGROUND_COLOR = "#0f0f18";
const MAP_PANEL_COLOR = "#1a1c2c";
const MAP_PANEL_BORDER_COLOR = "#c2c3c7";
const VISITED_ROOM_COLOR = "#5f574f";
const UNVISITED_ROOM_COLOR = "#000000";
const CURRENT_ROOM_COLOR = "#ffcd75";
const TREASURE_MARKER_COLOR = "#ff004d";
const HUD_TEXT_COLOR = "#fff1e8";
const ROOM_SIZE = 10;
const ROOM_GAP = 4;
const MAP_AREA_PADDING = 10;
const INVENTORY_COLUMN_WIDTH = 50;

export function renderMapScreen(ctx, canvas, world, inventory, progress) {
  const panelBounds = getMapPanelBounds(canvas);
  const mapAreaBounds = getMapAreaBounds(panelBounds);
  const inventoryColumnBounds = getInventoryColumnBounds(panelBounds);
  const dungeonRooms = world.rooms;
  const roomPositions = dungeonRooms.map((room) => room.mapPosition);
  const mapBounds = getDungeonMapBounds(roomPositions);
  const mapPixelSize = getDungeonMapPixelSize(mapBounds);
  const mapOrigin = getCenteredMapOrigin(mapAreaBounds, mapPixelSize);

  ctx.fillStyle = MAP_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = MAP_PANEL_COLOR;
  ctx.fillRect(panelBounds.x, panelBounds.y, panelBounds.width, panelBounds.height);

  ctx.strokeStyle = MAP_PANEL_BORDER_COLOR;
  ctx.strokeRect(panelBounds.x + 0.5, panelBounds.y + 0.5, panelBounds.width - 1, panelBounds.height - 1);

  dungeonRooms.forEach((room, roomIndex) => {
    const roomX = mapOrigin.x + (room.mapPosition.x - mapBounds.minX) * (ROOM_SIZE + ROOM_GAP);
    const roomY = mapOrigin.y + (room.mapPosition.y - mapBounds.minY) * (ROOM_SIZE + ROOM_GAP);
    const hasVisitedRoom = progress.visitedRooms[roomIndex];

    if (!inventory.hasMap && !hasVisitedRoom) {
      return;
    }

    ctx.fillStyle = hasVisitedRoom ? VISITED_ROOM_COLOR : UNVISITED_ROOM_COLOR;
    ctx.fillRect(roomX, roomY, ROOM_SIZE, ROOM_SIZE);

    if (roomIndex === world.currentRoomIndex) {
      ctx.fillStyle = CURRENT_ROOM_COLOR;
      ctx.fillRect(roomX + 2, roomY + 2, ROOM_SIZE - 4, ROOM_SIZE - 4);
    }

    if (inventory.hasCompass && hasUnclaimedTreasure(progress, room.roomNumber)) {
      ctx.fillStyle = TREASURE_MARKER_COLOR;
      ctx.fillRect(roomX + ROOM_SIZE - 3, roomY - 2, 2, 4);
      ctx.fillRect(roomX + ROOM_SIZE - 4, roomY - 2, 4, 2);
    }
  });

  renderMapInventory(ctx, inventoryColumnBounds, inventory);
}

function renderMapInventory(ctx, inventoryColumnBounds, inventory) {
  const lineHeight = 8;
  const startX = inventoryColumnBounds.x;
  const startY = inventoryColumnBounds.y;

  ctx.fillStyle = HUD_TEXT_COLOR;
  ctx.font = "6px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(`Keys: ${inventory.normalKeys}`, startX, startY);
  ctx.fillText(`Boss Key: ${inventory.hasBossKey ? "Y" : "N"}`, startX, startY + lineHeight);
  ctx.fillText(`Map: ${inventory.hasMap ? "Y" : "N"}`, startX, startY + lineHeight * 2);
  ctx.fillText(`Magnet: ${inventory.hasCompass ? "Y" : "N"}`, startX, startY + lineHeight * 3);
}

function getMapPanelBounds(canvas) {
  return {
    x: 10,
    y: 8,
    width: canvas.width - 20,
    height: canvas.height - 16
  };
}

function getMapAreaBounds(panelBounds) {
  return {
    x: panelBounds.x + MAP_AREA_PADDING,
    y: panelBounds.y + MAP_AREA_PADDING,
    width: panelBounds.width - INVENTORY_COLUMN_WIDTH - MAP_AREA_PADDING * 2,
    height: panelBounds.height - MAP_AREA_PADDING * 2
  };
}

function getInventoryColumnBounds(panelBounds) {
  return {
    x: panelBounds.x + panelBounds.width - INVENTORY_COLUMN_WIDTH - 6,
    y: panelBounds.y + 16,
    width: INVENTORY_COLUMN_WIDTH,
    height: panelBounds.height - 32
  };
}

function getDungeonMapBounds(roomPositions) {
  return roomPositions.reduce((bounds, position) => ({
    minX: Math.min(bounds.minX, position.x),
    minY: Math.min(bounds.minY, position.y),
    maxX: Math.max(bounds.maxX, position.x),
    maxY: Math.max(bounds.maxY, position.y)
  }), {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  });
}

function getDungeonMapPixelSize(mapBounds) {
  const roomColumns = mapBounds.maxX - mapBounds.minX + 1;
  const roomRows = mapBounds.maxY - mapBounds.minY + 1;

  return {
    width: roomColumns * ROOM_SIZE + (roomColumns - 1) * ROOM_GAP,
    height: roomRows * ROOM_SIZE + (roomRows - 1) * ROOM_GAP
  };
}

function getCenteredMapOrigin(mapAreaBounds, mapPixelSize) {
  return {
    x: Math.round(mapAreaBounds.x + (mapAreaBounds.width - mapPixelSize.width) / 2),
    y: Math.round(mapAreaBounds.y + (mapAreaBounds.height - mapPixelSize.height) / 2)
  };
}

function hasUnclaimedTreasure(progress, roomNumber) {
  const treasureFlagByRoomNumber = {
    3: "mapChestOpened",
    5: "bossKeyChestOpened",
    7: "keyChestOpened",
    8: "compassChestOpened",
    10: "shieldChestOpened",
    11: "heartPieceChestOpened",
    13: "finalTreasureChestOpened"
  };
  const treasureFlag = treasureFlagByRoomNumber[roomNumber];

  return Boolean(treasureFlag) && !progress.flags[treasureFlag];
}
