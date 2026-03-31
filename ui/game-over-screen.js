const OVERLAY_COLOR = "rgba(0, 0, 0, 0.7)";
const GAME_OVER_COLOR = "#ff004d";
const PROMPT_COLOR = "#fff1e8";
const TITLE_FONT = "16px 'Trebuchet MS', sans-serif";
const PROMPT_FONT = "8px 'Trebuchet MS', sans-serif";

export function renderGameOverScreen(ctx, canvas) {
  ctx.fillStyle = OVERLAY_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = GAME_OVER_COLOR;
  ctx.font = TITLE_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = PROMPT_COLOR;
  ctx.font = PROMPT_FONT;
  ctx.fillText("Press Space to continue", canvas.width / 2, canvas.height / 2 + 10);
}
