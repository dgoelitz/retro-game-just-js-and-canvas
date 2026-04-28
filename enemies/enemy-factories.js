import { createEnemy } from "./enemy.js";
import { getRectangularPathHalfwayPoint, getRectangularPathPosition } from "./enemy-paths.js";

export function createPatrolEnemy({ x = 100, y = 48, patrolMinX = 88, patrolMaxX = 112 } = {}) {
  return createEnemy({
    type: "patrol",
    x,
    y,
    homeX: x,
    homeY: y,
    health: 1,
    patrolMinX,
    patrolMaxX
  });
}

export function createTurretEnemy(overrides = {}) {
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

export function createFixedTurretEnemy(overrides = {}) {
  return createEnemy({
    type: "fixed-turret",
    width: 8,
    height: 8,
    health: 1,
    invincible: true,
    ...overrides
  });
}

export function createStoneEnemy(overrides = {}) {
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

export function createSnakeEnemy(overrides = {}) {
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

export function createRectangularSnakeEnemy(overrides = {}) {
  const pathRect = overrides.pathRect ?? { left: 4, top: 4, right: 148, bottom: 78 };
  const pathProgress = overrides.pathProgress ?? 0;
  const startPosition = getRectangularPathPosition(pathRect, pathProgress);

  return createEnemy({
    type: "snake",
    x: startPosition.x,
    y: startPosition.y,
    width: 8,
    height: 8,
    health: 99,
    invincible: true,
    pathRect,
    pathProgress,
    pathDirection: overrides.pathDirection ?? 1,
    pathSpeed: overrides.pathSpeed ?? 22,
    bodyLength: overrides.bodyLength ?? 5,
    bodySpacing: overrides.bodySpacing ?? 7,
    ...overrides
  });
}

export function createSnakePair(overrides) {
  return [
    createRectangularSnakeEnemy(overrides),
    createRectangularSnakeEnemy({
      ...overrides,
      pathProgress: overrides.pathProgress + getRectangularPathHalfwayPoint(overrides.pathRect)
    })
  ];
}

export function createMinibossEnemy() {
  return createEnemy({
    type: "miniboss",
    x: 76,
    y: 14,
    homeX: 76,
    homeY: 14,
    width: 10,
    height: 10,
    health: 8,
    maxHealth: 8,
    mode: "throw",
    shotCooldown: 0.9,
    shootTimer: 1.6
  });
}

export function createBossEnemy() {
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
