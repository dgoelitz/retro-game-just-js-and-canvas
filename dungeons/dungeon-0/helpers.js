import { DOOR_WIDTH } from "../../world/rooms/constants.js";

export function createDungeon0RoomDefinition({
  roomNumber,
  mapPosition,
  treasureFlag = null,
  doors = {},
  internalWalls = [],
  oneWayPlatforms = [],
  createEnemies = null,
  createProps = null,
  entryDialogue = null,
  onUpdate = null
}) {
  return {
    roomNumber,
    mapPosition,
    treasureFlag,
    doors,
    internalWalls,
    oneWayPlatforms,
    createEnemies,
    createProps,
    entryDialogue,
    onUpdate
  };
}

export function createDoor(edge, toRoomIndex, kind = "unlocked", extras = {}) {
  return {
    edge,
    toRoomIndex,
    kind,
    width: DOOR_WIDTH,
    offset: extras.offset ?? null
  };
}

export function createWall(x, y, width, height) {
  return {
    x,
    y,
    width,
    height
  };
}

export function createOneWayPlatform(x, y, width, height, blocksDirection) {
  return {
    x,
    y,
    width,
    height,
    blocksDirection
  };
}
