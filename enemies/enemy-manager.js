import { createEnemy } from "./enemy.js";

export function createEnemiesByRoom() {
  return {
    0: [
      createEnemy()
    ],
    1: [
      createEnemy({
        x: 52,
        y: 32,
        homeX: 52,
        homeY: 32,
        patrolMinX: 40,
        patrolMaxX: 72
      }),
      createEnemy({
        x: 104,
        y: 76,
        homeX: 104,
        homeY: 76,
        patrolMinX: 92,
        patrolMaxX: 124
      })
    ],
    3: [
      createEnemy({
        x: 36,
        y: 30,
        homeX: 36,
        homeY: 30,
        patrolMinX: 24,
        patrolMaxX: 56
      }),
      createEnemy({
        x: 76,
        y: 58,
        homeX: 76,
        homeY: 58,
        patrolMinX: 64,
        patrolMaxX: 92
      }),
      createEnemy({
        x: 118,
        y: 34,
        homeX: 118,
        homeY: 34,
        patrolMinX: 106,
        patrolMaxX: 136
      })
    ]
  };
}
