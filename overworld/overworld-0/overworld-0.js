import { OVERWORLD_0_ROOM_BUILDERS } from "./rooms/index.js";

export function createOverworld0Rooms() {
  return OVERWORLD_0_ROOM_BUILDERS.map((buildRoomDefinition) => {
    const roomDefinition = buildRoomDefinition();

    return {
      walls: roomDefinition.walls,
      neighbors: roomDefinition.neighbors
    };
  });
}

export function createOverworld0EnemiesByRoom() {
  return createRoomContentMap("createEnemies");
}

export function createOverworld0RoomPropsByRoom() {
  return createRoomContentMap("createProps");
}

export function createOverworld0NpcsByRoom() {
  return createRoomContentMap("createNpcs");
}

function createRoomContentMap(factoryName) {
  const contentByRoom = {};

  OVERWORLD_0_ROOM_BUILDERS.forEach((buildRoomDefinition, roomIndex) => {
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
