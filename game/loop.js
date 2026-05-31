import { createInput } from "../input.js";
import { renderGame } from "./renderer.js";
import { createGameRuntime } from "./state-machine.js";

const FIXED_UPDATES_PER_SECOND = 60;
const FIXED_DELTA_TIME = 1 / FIXED_UPDATES_PER_SECOND;
const MAX_FRAME_TIME = 0.25;
const MAX_UPDATES_PER_FRAME = 5;

export function startGame(canvas, ctx, debugStartKey = "") {
  const input = createInput();
  const runtime = createGameRuntime(ctx, canvas, input, debugStartKey);
  const { session } = runtime;

  let lastTimestamp = null;
  let accumulatedTime = 0;

  function gameLoop(timestamp) {
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
      requestAnimationFrame(gameLoop);
      return;
    }

    const elapsedTime = Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_TIME);
    lastTimestamp = timestamp;

    accumulatedTime += elapsedTime;

    let updatesThisFrame = 0;
    while (accumulatedTime >= FIXED_DELTA_TIME && updatesThisFrame < MAX_UPDATES_PER_FRAME) {
      runtime.update(FIXED_DELTA_TIME);
      accumulatedTime -= FIXED_DELTA_TIME;
      updatesThisFrame++;
    }

    if (updatesThisFrame === MAX_UPDATES_PER_FRAME) {
      accumulatedTime = 0;
    }

    renderGame(ctx, canvas, session);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
