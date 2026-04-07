import { createEnemy } from "./enemy.js";

export function createEnemiesByRoom() {
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

export function createEnemiesByWorldKey() {
  return {
    overworld: createEnemiesByRoom(),
    dungeon: {}
  };
}

function createPatrolEnemy({ x = 100, y = 48, patrolMinX = 88, patrolMaxX = 112 } = {}) {
  return createEnemy({
    x,
    y,
    homeX: x,
    homeY: y,
    patrolMinX,
    patrolMaxX
  });
}
