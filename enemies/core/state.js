import { ENEMY_MODES } from "./constants.js";

export const ENEMY_MODE_PATROL = ENEMY_MODES.patrol.PATROL;
export const ENEMY_MODE_CHASE = ENEMY_MODES.patrol.CHASE;
export const ENEMY_MODE_RETURN = ENEMY_MODES.patrol.RETURN;
export const MINIBOSS_MODE_THROW = ENEMY_MODES.miniboss.THROW;
export const MINIBOSS_MODE_SPIN = ENEMY_MODES.miniboss.SPIN;
export const MINIBOSS_MODE_REST = ENEMY_MODES.miniboss.REST;
export const BOSS_MODE_SLAM = ENEMY_MODES.boss.SLAM;
export const BOSS_MODE_IMPACT = ENEMY_MODES.boss.IMPACT;
export const BOSS_MODE_STUNNED = ENEMY_MODES.boss.STUNNED;

export function isEnemyStunned(enemy) {
  return enemy.type === "miniboss" && enemy.mode === MINIBOSS_MODE_REST
    || enemy.type === "boss" && enemy.mode === BOSS_MODE_STUNNED;
}

export function canUseRoomEntryGrace(enemy) {
  return enemy.type !== "boss" && enemy.type !== "miniboss";
}
