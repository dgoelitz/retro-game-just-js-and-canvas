export const WALL_COLOR = "#5f574f";
export const WALL_THICKNESS = 4;
export const ROOM_BACKGROUND_COLOR = "#1d2b53";

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
    {
      walls: {
        top: true,
        right: true,
        bottom: true,
        left: true
      },
      neighbors: {}
    }
  ];
}
