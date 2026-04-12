export const WALL_COLOR = "#5f574f";
export const WALL_THICKNESS = 4;
export const ROOM_BACKGROUND_COLOR = "#1d2b53";
export const DOOR_WIDTH = 16;

export function createOverworldRooms() {
  return [
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
        right: false,
        bottom: true,
        left: false
      },
      neighbors: {
        left: 1,
        right: 5
      }
    },
    {
      walls: {
        top: false,
        right: true,
        bottom: false,
        left: true
      },
      neighbors: {
        up: 4,
        down: 1
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
        down: 3
      }
    },
    {
      walls: {
        top: true,
        right: false,
        bottom: true,
        left: false
      },
      neighbors: {
        left: 2,
        right: 6
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
        left: 5
      }
    }
  ];
}

export function createDungeonRooms() {
  return [
    createDungeonRoom(1, { x: 2, y: 4 }, {
      top: createDoor("top", 1, "barred")
    }),
    createDungeonRoom(2, { x: 2, y: 3 }, {
      left: createDoor("left", 2),
      right: createDoor("right", 7),
      top: createDoor("top", 5, "barred"),
      bottom: createDoor("bottom", 0)
    }),
    createDungeonRoom(3, { x: 1, y: 3 }, {
      right: createDoor("right", 1),
      top: createDoor("top", 3)
    }),
    createDungeonRoom(4, { x: 1, y: 2 }, {
      left: createDoor("left", 4, "unlocked", { offset: 14 }),
      right: createDoor("right", 5),
      top: createDoor("top", 6, "unlocked", { offset: 38 }),
      bottom: createDoor("bottom", 2)
    }, {
      internalWalls: [
        createWall(0, 67, 120, 4),
        createWall(30, 0, 4, 45),
        createWall(30, 33, 90, 16),
      ]
    }),
    createDungeonRoom(5, { x: 0, y: 2 }, {
      right: createDoor("right", 3, "unlocked", { offset: 14 })
    }),
    createDungeonRoom(6, { x: 2, y: 2 }, {
      left: createDoor("left", 3),
      right: createDoor("right", 8),
      top: createDoor("top", 11, "barred"),
      bottom: createDoor("bottom", 1)
    }, {
      oneWayPlatforms: [
        createWall(44, 34, 72, 4)
      ],
      internalWalls: [
        createWall(58, 50, 12, 4)
      ]
    }),
    createDungeonRoom(7, { x: 1, y: 1 }, {
      right: createDoor("right", 11),
      bottom: createDoor("bottom", 3, "unlocked", { offset: 38 })
    }),
    createDungeonRoom(8, { x: 3, y: 3 }, {
      left: createDoor("left", 1),
      top: createDoor("top", 8)
    }),
    createDungeonRoom(9, { x: 3, y: 2 }, {
      left: createDoor("left", 5),
      right: createDoor("right", 9),
      top: createDoor("top", 10),
      bottom: createDoor("bottom", 7)
    }, {
      internalWalls: [
        createWall(60, 26, 28, 28)
      ]
    }),
    createDungeonRoom(10, { x: 4, y: 2 }, {
      left: createDoor("left", 8, "barred")
    }),
    createDungeonRoom(11, { x: 3, y: 1 }, {
      left: createDoor("left", 11, "barred"),
      bottom: createDoor("bottom", 8)
    }),
    createDungeonRoom(12, { x: 2, y: 1 }, {
      right: createDoor("right", 10, "barred"),
      bottom: createDoor("bottom", 5),
      top: createDoor("top", 12, "boss-key")
    }),
    createDungeonRoom(13, { x: 2, y: 0 }, {
      bottom: createDoor("bottom", 11)
    })
  ];
}

function createDungeonRoom(roomNumber, mapPosition, doors, extras = {}) {
  return {
    roomNumber,
    mapPosition,
    walls: {
      top: true,
      right: true,
      bottom: true,
      left: true
    },
    neighbors: {},
    doors,
    internalWalls: extras.internalWalls ?? [],
    oneWayPlatforms: extras.oneWayPlatforms ?? []
  };
}

function createDoor(edge, toRoomIndex, kind = "unlocked", extras = {}) {
  return {
    edge,
    toRoomIndex,
    kind,
    width: DOOR_WIDTH,
    offset: extras.offset ?? null
  };
}

function createWall(x, y, width, height) {
  return {
    x,
    y,
    width,
    height
  };
}
