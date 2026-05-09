import { createInput } from "../input.js";
import { renderGame } from "./renderer.js";
import { createGameRuntime } from "./state-machine.js";

export function startGame(canvas, ctx, debugStartKey = "") {
  const input = createInput();
  const runtime = createGameRuntime(ctx, canvas, input, debugStartKey);
  const { session } = runtime;

  let lastTime = 0;

  function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    runtime.update(deltaTime);
    renderGame(ctx, canvas, session);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}
