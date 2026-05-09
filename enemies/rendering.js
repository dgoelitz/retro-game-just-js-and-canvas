import { ZERO_OFFSET } from "../utils.js";
import { getMinibossSpinAuraPadding } from "./bosses/miniboss.js";
import { ENEMY_RENDERING } from "./core/constants.js";
import { getDrawEnemy, getSnakeSegments } from "./core/geometry.js";
import {
  MINIBOSS_MODE_SPIN,
  isEnemyStunned
} from "./core/state.js";

export function renderEnemy(ctx, enemy, offset = ZERO_OFFSET, options = {}) {
  if (!enemy.alive) {
    return;
  }

  const drawEnemy = getDrawEnemy(enemy);
  const color = getEnemyColor(enemy);
  const isTemporarilyTransparent = options.transparent ?? false;

  ctx.save();
  ctx.globalAlpha = getEnemyAlpha(enemy, isTemporarilyTransparent);
  ctx.fillStyle = color;

  if (enemy.type === "snake") {
    renderSnake(ctx, enemy, offset);
    ctx.restore();
    return;
  }

  if (enemy.type === "miniboss" && enemy.mode === MINIBOSS_MODE_SPIN) {
    const spinAuraPadding = getMinibossSpinAuraPadding();

    ctx.fillRect(
      drawEnemy.x + offset.x - spinAuraPadding,
      drawEnemy.y + offset.y - spinAuraPadding,
      drawEnemy.width + spinAuraPadding * 2,
      drawEnemy.height + spinAuraPadding * 2
    );
    ctx.restore();
    return;
  }

  ctx.fillRect(drawEnemy.x + offset.x, drawEnemy.y + offset.y, drawEnemy.width, drawEnemy.height);
  ctx.restore();
}

function renderSnake(ctx, enemy, offset) {
  const segments = getSnakeSegments(enemy);

  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const segment = segments[i];
    ctx.fillRect(
      Math.round(segment.x) + offset.x,
      Math.round(segment.y) + offset.y,
      segment.width,
      segment.height
    );
  }
}

function getEnemyAlpha(enemy, isTemporarilyTransparent) {
  const elapsedFlashTime = enemy.invulnerableDuration - enemy.invulnerableTimer;
  const flashPhase = Math.floor(elapsedFlashTime / enemy.flashInterval);
  const isTransparentDuringDamageFlash = enemy.invulnerableTimer > 0 && flashPhase % 2 === 0;

  if (isTemporarilyTransparent || isTransparentDuringDamageFlash) {
    return ENEMY_RENDERING.transparentAlpha;
  }

  return 1;
}

function getEnemyColor(enemy) {
  const baseColor = ENEMY_RENDERING.colorsByType[enemy.type] ?? ENEMY_RENDERING.colorsByType.patrol;

  if (!isEnemyStunned(enemy)) {
    return baseColor;
  }

  return isUsingStunnedFlashColor(enemy) ? ENEMY_RENDERING.stunnedFlashColor : baseColor;
}

function isUsingStunnedFlashColor(enemy) {
  const stunTimer = enemy.abilityTimer;
  const flashPhase = Math.floor(stunTimer / enemy.flashInterval);

  return flashPhase % 2 === 0;
}
