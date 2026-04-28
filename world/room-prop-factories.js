import { WALL_THICKNESS } from "./room-data.js";

export function createBush(overrides = {}) {
  return {
    kind: "bush",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: true,
    cuttable: true,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

export function createDungeonEntrance(overrides = {}) {
  return {
    kind: "dungeon-entrance",
    x: 0,
    y: 0,
    width: 28,
    height: 20,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

export function createDungeonExit(overrides = {}) {
  return {
    kind: "dungeon-exit",
    x: 0,
    y: 0,
    width: 28,
    height: 16,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

export function createWallBlock(overrides = {}) {
  return {
    kind: "wall-block",
    x: 0,
    y: 0,
    width: WALL_THICKNESS,
    height: 8,
    blocksMovement: true,
    cuttable: false,
    destroyed: false,
    hidden: false,
    ...overrides
  };
}

export function createChest(overrides = {}) {
  return {
    kind: "chest",
    x: 0,
    y: 0,
    width: 12,
    height: 8,
    blocksMovement: true,
    cuttable: false,
    destroyed: false,
    hidden: false,
    opened: false,
    rewardKind: null,
    progressFlag: null,
    ...overrides
  };
}

export function createTarget(overrides = {}) {
  return {
    kind: "target",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    progressFlag: null,
    ...overrides
  };
}

export function createSwitch(overrides = {}) {
  return {
    kind: "switch",
    x: 0,
    y: 0,
    width: 8,
    height: 8,
    blocksMovement: false,
    cuttable: false,
    destroyed: false,
    hidden: false,
    activated: false,
    progressFlag: null,
    ...overrides
  };
}
