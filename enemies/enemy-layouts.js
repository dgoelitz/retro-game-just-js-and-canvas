import {
  createBossEnemy,
  createFixedTurretEnemy,
  createMinibossEnemy,
  createPatrolEnemy,
  createSnakePair,
  createStoneEnemy,
  createTurretEnemy
} from "./enemy-factories.js";

export function createOverworldEnemiesByRoom() {
  return {
    0: [
      createPatrolEnemy()
    ],
    1: [
      createPatrolEnemy({ x: 52, y: 32, patrolMinX: 40, patrolMaxX: 72 }),
      createPatrolEnemy({ x: 104, y: 64, patrolMinX: 92, patrolMaxX: 124 })
    ],
    3: [
      createPatrolEnemy({ x: 36, y: 30, patrolMinX: 24, patrolMaxX: 56 }),
      createPatrolEnemy({ x: 76, y: 58, patrolMinX: 64, patrolMaxX: 92 }),
      createPatrolEnemy({ x: 118, y: 34, patrolMinX: 106, patrolMaxX: 136 })
    ]
  };
}

export function createDungeonEnemiesByRoom() {
  return {
    0: [
      createPatrolEnemy({ x: 56, y: 18, patrolMinX: 28, patrolMaxX: 68 }),
      createPatrolEnemy({ x: 76, y: 26, patrolMinX: 64, patrolMaxX: 96 }),
      createPatrolEnemy({ x: 96, y: 18, patrolMinX: 92, patrolMaxX: 124 })
    ],
    1: [
      createTurretEnemy({ x: 32, y: 0, shotCooldown: 1.2 })
    ],
    2: [
      createStoneEnemy({ x: 42, y: 30, orbitRadiusX: 10, orbitRadiusY: 10, orbitAngle: 0 }),
      createStoneEnemy({ x: 74, y: 56, orbitRadiusX: 8, orbitRadiusY: 8, orbitAngle: Math.PI * 0.66 }),
      createStoneEnemy({ x: 32, y: 60, orbitRadiusX: 10, orbitRadiusY: 10, orbitAngle: Math.PI * 1.2 }),
      createTurretEnemy({ x: 32, y: 0, shotCooldown: 1.1 })
    ],
    3: [
      createFixedTurretEnemy({ x: 0, y: 75, fixedDirection: "right", shotCooldown: 1.4 }),
      createFixedTurretEnemy({ x: 0, y: 54, fixedDirection: "right", shotCooldown: 0.8 }),
      createFixedTurretEnemy({
        x: 152,
        y: 9,
        fixedDirection: "left",
        shotCooldown: 1.0,
        shootTimer: 0,
        projectileSpeed: 86
      }),
      createFixedTurretEnemy({
        x: 152,
        y: 20,
        fixedDirection: "left",
        shotCooldown: 1.0,
        shootTimer: 0.5,
        projectileSpeed: 86
      })
    ],
    4: [
      createPatrolEnemy({ x: 42, y: 30, patrolMinX: 28, patrolMaxX: 60 }),
      createPatrolEnemy({ x: 110, y: 60, patrolMinX: 90, patrolMaxX: 126 }),
      createStoneEnemy({ x: 34, y: 60, orbitRadiusX: 8, orbitRadiusY: 10 }),
      createStoneEnemy({ x: 96, y: 58, orbitRadiusX: 8, orbitRadiusY: 10 }),
      createFixedTurretEnemy({ x: 0, y: 16, fixedDirection: "right", shotCooldown: 1.2 }),
      createFixedTurretEnemy({ x: 152, y: 48, fixedDirection: "left", shotCooldown: 0.9 }),
      createTurretEnemy({ x: 76, y: 0, shotCooldown: 1.0 })
    ],
    5: [
      createTurretEnemy({ x: 76, y: 36, shotCooldown: 1.0 })
    ],
    6: [
      createFixedTurretEnemy({ x: 0, y: 18, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 0, y: 42, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 0, y: 66, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 152, y: 30, fixedDirection: "left", shotCooldown: 1.0 }),
      createFixedTurretEnemy({ x: 152, y: 54, fixedDirection: "left", shotCooldown: 1.0 })
    ],
    7: [
      createPatrolEnemy({ x: 42, y: 26, patrolMinX: 26, patrolMaxX: 58 }),
      createPatrolEnemy({ x: 68, y: 60, patrolMinX: 52, patrolMaxX: 84 }),
      createPatrolEnemy({ x: 96, y: 26, patrolMinX: 84, patrolMaxX: 112 }),
      createPatrolEnemy({ x: 118, y: 60, patrolMinX: 108, patrolMaxX: 134 })
    ],
    8: [
      ...createSnakePair({
        pathRect: { left: 4, top: 4, right: 148, bottom: 78 },
        pathProgress: 12,
        pathDirection: 1
      }),
      ...createSnakePair({
        pathRect: { left: 16, top: 16, right: 136, bottom: 66 },
        pathProgress: 72,
        pathDirection: -1
      }),
      ...createSnakePair({
        pathRect: { left: 28, top: 28, right: 124, bottom: 54 },
        pathProgress: 120,
        pathDirection: 1
      })
    ],
    9: [
      createMinibossEnemy()
    ],
    10: [
      createFixedTurretEnemy({ x: 0, y: 28, fixedDirection: "right", shotCooldown: 1.1 }),
      createFixedTurretEnemy({ x: 0, y: 56, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 152, y: 14, fixedDirection: "left", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 152, y: 42, fixedDirection: "left", shotCooldown: 1.1 }),
      createFixedTurretEnemy({ x: 24, y: 0, fixedDirection: "down", shotCooldown: 1.2 }),
      createFixedTurretEnemy({ x: 128, y: 0, fixedDirection: "down", shotCooldown: 1.2 })
    ],
    12: [
      createBossEnemy()
    ]
  };
}
