import { DUNGEON_0_ROOM_BUILDERS } from "./rooms/index.js";

export const DUNGEON_0_ROOM_COUNT = DUNGEON_0_ROOM_BUILDERS.length;

export function createDungeon0Rooms() {
  return DUNGEON_0_ROOM_BUILDERS.map((buildRoomDefinition) => createWorldRoom(buildRoomDefinition()));
}

export function createDungeon0EnemiesByRoom() {
  return createRoomContentMap("createEnemies");
}

export function createDungeon0RoomPropsByRoom() {
  return createRoomContentMap("createProps");
}

function createWorldRoom(roomDefinition) {
  return {
    roomNumber: roomDefinition.roomNumber,
    mapPosition: roomDefinition.mapPosition,
    treasureFlag: roomDefinition.treasureFlag,
    walls: {
      top: true,
      right: true,
      bottom: true,
      left: true
    },
    neighbors: {},
    doors: roomDefinition.doors,
    internalWalls: roomDefinition.internalWalls ?? [],
    oneWayPlatforms: roomDefinition.oneWayPlatforms ?? []
  };
}

function createRoomContentMap(factoryName) {
  const contentByRoom = {};

  DUNGEON_0_ROOM_BUILDERS.forEach((buildRoomDefinition, roomIndex) => {
    const roomDefinition = buildRoomDefinition();
    const createContent = roomDefinition[factoryName];

    if (!createContent) {
      return;
    }

    const roomContent = createContent();

    if (roomContent.length > 0) {
      contentByRoom[roomIndex] = roomContent;
    }
  });

  return contentByRoom;
}

export function getDungeon0RoomDefinition(roomIndex) {
  const buildRoomDefinition = DUNGEON_0_ROOM_BUILDERS[roomIndex];

  return buildRoomDefinition ? buildRoomDefinition() : null;
}
