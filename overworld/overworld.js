import { OVERWORLD_ROOM_BUILDERS } from "./rooms/index.js";

export function createOverworldRooms() {
  return OVERWORLD_ROOM_BUILDERS.map((buildRoomDefinition) => {
    const roomDefinition = buildRoomDefinition();

    return {
      walls: roomDefinition.walls,
      neighbors: roomDefinition.neighbors
    };
  });
}

export function createOverworldEnemiesByRoom() {
  return createRoomContentMap("createEnemies");
}

export function createOverworldRoomPropsByRoom() {
  return createRoomContentMap("createProps");
}

export function createOverworldNpcsByRoom() {
  return createRoomContentMap("createNpcs");
}

function createRoomContentMap(factoryName) {
  const contentByRoom = {};

  OVERWORLD_ROOM_BUILDERS.forEach((buildRoomDefinition, roomIndex) => {
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
