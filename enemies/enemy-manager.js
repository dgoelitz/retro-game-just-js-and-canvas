import { createEnemy } from "./enemy.js";

export function createEnemiesByWorldKey() {
  return {
    overworld: createOverworldEnemiesByRoom(),
    dungeon: createDungeonEnemiesByRoom()
  };
}

function createOverworldEnemiesByRoom() {
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

function createDungeonEnemiesByRoom() {
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
      createStoneEnemy({ x: 70, y: 24, orbitRadiusX: 8, orbitRadiusY: 10 }),
      createStoneEnemy({ x: 92, y: 46, orbitRadiusX: 8, orbitRadiusY: 10 }),
      createFixedTurretEnemy({ x: 8, y: 18, fixedDirection: "right", shotCooldown: 1.2 }),
      createFixedTurretEnemy({ x: 142, y: 40, fixedDirection: "left", shotCooldown: 0.9 }),
      createTurretEnemy({ x: 76, y: 8, shotCooldown: 1.0 })
    ],
    5: [
      createTurretEnemy({ x: 78, y: 26, shotCooldown: 1.0 })
    ],
    6: [
      createFixedTurretEnemy({ x: 6, y: 18, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 6, y: 42, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 6, y: 66, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 150, y: 30, fixedDirection: "left", shotCooldown: 1.0 }),
      createFixedTurretEnemy({ x: 150, y: 54, fixedDirection: "left", shotCooldown: 1.0 })
    ],
    7: [
      createPatrolEnemy({ x: 42, y: 26, patrolMinX: 26, patrolMaxX: 58 }),
      createPatrolEnemy({ x: 68, y: 60, patrolMinX: 52, patrolMaxX: 84 }),
      createPatrolEnemy({ x: 96, y: 26, patrolMinX: 84, patrolMaxX: 112 }),
      createPatrolEnemy({ x: 118, y: 60, patrolMinX: 108, patrolMaxX: 134 })
    ],
    8: [
      createSnakeEnemy({ x: 32, y: 16, homeX: 32, homeY: 16, orbitRadiusX: 42, orbitRadiusY: 22, orbitSpeed: 0.7 }),
      createSnakeEnemy({ x: 74, y: 40, homeX: 74, homeY: 40, orbitRadiusX: 18, orbitRadiusY: 12, orbitSpeed: 0.8 }),
      createSnakeEnemy({ x: 70, y: 30, homeX: 78, homeY: 36, orbitRadiusX: 30, orbitRadiusY: 20, orbitSpeed: -0.6 })
    ],
    9: [
      createMinibossEnemy()
    ],
    10: [
      createFixedTurretEnemy({ x: 6, y: 12, fixedDirection: "right", shotCooldown: 1.1 }),
      createFixedTurretEnemy({ x: 6, y: 34, fixedDirection: "right", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 6, y: 58, fixedDirection: "right", shotCooldown: 1.1 }),
      createFixedTurretEnemy({ x: 150, y: 24, fixedDirection: "left", shotCooldown: 0.9 }),
      createFixedTurretEnemy({ x: 150, y: 48, fixedDirection: "left", shotCooldown: 1.1 })
    ],
    12: [
      createBossEnemy()
    ]
  };
}

function createPatrolEnemy({ x = 100, y = 48, patrolMinX = 88, patrolMaxX = 112 } = {}) {
  return createEnemy({
    type: "patrol",
    x,
    y,
    homeX: x,
    homeY: y,
    patrolMinX,
    patrolMaxX
  });
}

function createTurretEnemy(overrides = {}) {
  return createEnemy({
    type: "turret",
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    chaseRange: 0,
    ...overrides
  });
}

function createFixedTurretEnemy(overrides = {}) {
  return createEnemy({
    type: "fixed-turret",
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    ...overrides
  });
}

function createStoneEnemy(overrides = {}) {
  const centerX = overrides.x ?? 100;
  const centerY = overrides.y ?? 48;
  const orbitRadiusX = overrides.orbitRadiusX ?? 10;
  const orbitRadiusY = overrides.orbitRadiusY ?? 10;
  const orbitAngle = overrides.orbitAngle ?? 0;

  return createEnemy({
    type: "stone",
    x: centerX + Math.cos(orbitAngle) * orbitRadiusX,
    y: centerY + Math.sin(orbitAngle) * orbitRadiusY,
    homeX: centerX,
    homeY: centerY,
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    orbitAngle,
    orbitRadiusX,
    orbitRadiusY,
    ...overrides
  });
}

function createSnakeEnemy(overrides = {}) {
  const centerX = overrides.homeX ?? overrides.x ?? 100;
  const centerY = overrides.homeY ?? overrides.y ?? 48;
  const orbitRadiusX = overrides.orbitRadiusX ?? 10;
  const orbitRadiusY = overrides.orbitRadiusY ?? 10;
  const orbitAngle = overrides.orbitAngle ?? 0;

  return createEnemy({
    type: "snake",
    x: centerX + Math.cos(orbitAngle) * orbitRadiusX,
    y: centerY + Math.sin(orbitAngle) * orbitRadiusY,
    homeX: centerX,
    homeY: centerY,
    width: 8,
    height: 8,
    health: 99,
    invincible: true,
    orbitAngle,
    orbitRadiusX,
    orbitRadiusY,
    ...overrides
  });
}

function createMinibossEnemy() {
  return createEnemy({
    type: "miniboss",
    x: 76,
    y: 14,
    homeX: 76,
    homeY: 14,
    width: 10,
    height: 10,
    health: 8,
    mode: "throw",
    shotCooldown: 0.9
  });
}

function createBossEnemy() {
  return createEnemy({
    type: "boss",
    x: 66,
    y: 4,
    homeX: 66,
    homeY: 4,
    width: 18,
    height: 18,
    health: 8,
    mode: "slam",
    slamAxis: "horizontal",
    slamWall: "top",
    directionX: 1,
    directionY: 1,
    speed: 34,
    shotCooldown: 2.4,
    shootTimer: 1.2
  });
}
