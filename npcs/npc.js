import { rectanglesOverlap, ZERO_OFFSET } from "../game-utils.js";

const NPC_COLOR = "#00e756";
const TALK_DISTANCE = 6;

export function createNpc(overrides = {}) {
  return {
    id: "npc",
    x: 72,
    y: 44,
    width: 8,
    height: 8,
    ...overrides
  };
}

export function renderNpc(ctx, npc, offset = ZERO_OFFSET) {
  ctx.fillStyle = NPC_COLOR;
  ctx.fillRect(Math.round(npc.x) + offset.x, Math.round(npc.y) + offset.y, npc.width, npc.height);
}

export function touchesNpc(npc, hitbox) {
  return rectanglesOverlap(npc, hitbox);
}

export function canTalkToNpc(npc, hitbox) {
  const interactionBounds = {
    x: npc.x - TALK_DISTANCE,
    y: npc.y - TALK_DISTANCE,
    width: npc.width + TALK_DISTANCE * 2,
    height: npc.height + TALK_DISTANCE * 2
  };

  return rectanglesOverlap(interactionBounds, hitbox);
}
