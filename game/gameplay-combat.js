import {
  damagePlayerFromProjectiles,
  destroyProjectilesOnWalls,
  updateProjectiles
} from "../combat/projectiles.js";
import {
  blockEnemyWithShield,
  canUseRoomEntryGrace,
  hitEnemy,
  resolveProjectileHitsOnEnemies,
  touchesEnemy,
  updateEnemy
} from "../enemies/enemy.js";
import { damagePlayer, getPlayerHitbox } from "../player/player.js";
import { getShieldHitbox, getShieldSweep } from "../player/shield.js";
import { getAttackHitbox } from "../player/sword.js";
import { hitRoomProps, hitTargetProps } from "../world/room-props.js";

export function updateRoomCombat(session, previousPlayerPosition, deltaTime, canvas, roomState) {
  const attackHitbox = getAttackHitbox(session.player, session.sword);

  for (const enemy of roomState.roomEnemies) {
    updateEnemy(enemy, session.player, deltaTime, canvas, roomState.roomProjectiles, roomState.roomEnemies);
    hitEnemy(enemy, attackHitbox);
  }

  updateProjectiles(roomState.roomProjectiles, deltaTime, canvas);
  destroyProjectilesOnWalls(roomState.roomProjectiles, roomState.room.internalWalls ?? []);
  resolveProjectileHitsOnEnemies(roomState.roomEnemies, roomState.roomProjectiles);
  hitTargetProps(roomState.roomProps, roomState.roomProjectiles);
  hitRoomProps(roomState.roomProps, attackHitbox);
  resolvePlayerDamage(session, previousPlayerPosition, roomState.roomEnemies, roomState.roomProjectiles);
}

function resolvePlayerDamage(session, previousPlayerPosition, roomEnemies, roomProjectiles) {
  const playerHitbox = getPlayerHitbox(session.player);
  const shieldHitbox = getShieldHitbox(session.player, session.shield);
  const shieldSweep = getShieldSweep(session.player, session.shield, previousPlayerPosition);

  for (const enemy of roomEnemies) {
    if (blockEnemyWithShield(enemy, shieldHitbox, session.player.facing)) {
      continue;
    }

    if (canUseRoomEntryGrace(enemy) && session.roomEntryGraceTimer > 0) {
      continue;
    }

    if (touchesEnemy(enemy, playerHitbox)) {
      damagePlayer(session.player);
    }
  }

  if (damagePlayerFromProjectiles(roomProjectiles, playerHitbox, shieldHitbox, shieldSweep)) {
    damagePlayer(session.player);
  }
}
