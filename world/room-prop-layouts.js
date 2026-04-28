import { WALL_THICKNESS } from "./room-data.js";
import {
  createBush,
  createChest,
  createDungeonEntrance,
  createDungeonExit,
  createSwitch,
  createTarget,
  createWallBlock
} from "./room-prop-factories.js";

export function createOverworldRoomPropsByRoom() {
  return {
    2: [
      createWallBlock({ x: 156, y: 0, width: WALL_THICKNESS, height: 36 }),
      createBush({ x: 152, y: 36 }),
      createBush({ x: 152, y: 44 }),
      createBush({ x: 152, y: 52 }),
      createBush({ x: 152, y: 60 }),
      createWallBlock({ x: 156, y: 68, width: WALL_THICKNESS, height: 22 })
    ],
    5: [
      createWallBlock({ x: 0, y: 0, width: WALL_THICKNESS, height: 36 }),
      createWallBlock({ x: 0, y: 68, width: WALL_THICKNESS, height: 22 }),
      createBush({ x: 56, y: 24 }),
      createBush({ x: 64, y: 24 }),
      createBush({ x: 72, y: 24 }),
      createBush({ x: 104, y: 72 }),
      createBush({ x: 112, y: 72 }),
      createBush({ x: 120, y: 72 })
    ],
    6: [
      createBush({ x: 28, y: 78 }),
      createBush({ x: 36, y: 78 }),
      createBush({ x: 44, y: 78 }),
      createBush({ x: 100, y: 78 }),
      createBush({ x: 108, y: 78 }),
      createBush({ x: 116, y: 78 }),
      createDungeonEntrance({
        x: 66,
        y: 12,
        destination: {
          worldKey: "dungeon",
          roomIndex: 0,
          playerX: 76,
          playerY: 66
        }
      })
    ]
  };
}

export function createDungeonRoomPropsByRoom() {
  return {
    0: [
      createDungeonExit({
        x: 66,
        y: 72,
        destination: {
          worldKey: "overworld",
          roomIndex: 6,
          playerX: 76,
          playerY: 24
        }
      })
    ],
    1: [
      createTarget({
        id: "room-2-target",
        x: 120,
        y: 0,
        progressFlag: "room2TargetDestroyed"
      })
    ],
    2: [
      createChest({
        id: "room-3-map",
        x: 72,
        y: 40,
        rewardKind: "map",
        progressFlag: "mapChestOpened",
        hidden: true
      })
    ],
    4: [
      createChest({
        id: "room-5-boss-key",
        x: 72,
        y: 40,
        rewardKind: "boss-key",
        progressFlag: "bossKeyChestOpened",
        hidden: true
      })
    ],
    5: [
      createTarget({
        id: "room-6-left-target",
        x: 0,
        y: 4,
        progressFlag: "room6LeftTargetDestroyed"
      }),
      createTarget({
        id: "room-6-right-target",
        x: 152,
        y: 4,
        progressFlag: "room6RightTargetDestroyed"
      })
    ],
    6: [
      createChest({
        id: "room-7-key",
        x: 72,
        y: 10,
        rewardKind: "normal-key",
        progressFlag: "keyChestOpened"
      })
    ],
    7: [
      createChest({
        id: "room-8-compass",
        x: 72,
        y: 40,
        rewardKind: "compass",
        progressFlag: "compassChestOpened",
        hidden: true
      })
    ],
    9: [
      createChest({
        id: "room-10-shield",
        x: 72,
        y: 40,
        rewardKind: "shield",
        progressFlag: "shieldChestOpened",
        hidden: true
      })
    ],
    10: [
      createChest({
        id: "room-11-heart-piece",
        x: 72,
        y: 40,
        rewardKind: "piece-of-heart",
        progressFlag: "heartPieceChestOpened",
        hidden: true
      })
    ],
    11: [
      createSwitch({
        id: "room-12-switch",
        x: 128,
        y: 40,
        progressFlag: "room12SwitchPressed"
      })
    ],
    12: [
      createChest({
        id: "room-13-final-treasure",
        x: 72,
        y: 40,
        rewardKind: "final-treasure",
        progressFlag: "finalTreasureChestOpened",
        hidden: true
      })
    ]
  };
}
