import { createDungeon0Rooms } from "../dungeons/dungeon-0/dungeon-0.js";
export { WALL_COLOR, WALL_THICKNESS, ROOM_BACKGROUND_COLOR, DOOR_WIDTH } from "./room-constants.js";

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
  return createDungeon0Rooms();
}
