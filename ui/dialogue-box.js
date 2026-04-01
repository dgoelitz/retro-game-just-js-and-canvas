const BOX_COLOR = "#222034";
const BORDER_COLOR = "#fff1e8";
const TEXT_COLOR = "#fff1e8";
const BOX_HEIGHT = 36;
const BOX_MARGIN = 6;
const BOX_PADDING_X = 6;
const BOX_PADDING_Y = 6;
const TEXT_LINE_HEIGHT = 9;
const FONT = "8px 'Trebuchet MS', sans-serif";

export function renderDialogueBox(ctx, canvas, dialogue) {
  const boxX = BOX_MARGIN;
  const boxY = canvas.height - BOX_HEIGHT - BOX_MARGIN;
  const boxWidth = canvas.width - BOX_MARGIN * 2;

  ctx.fillStyle = BOX_COLOR;
  ctx.fillRect(boxX, boxY, boxWidth, BOX_HEIGHT);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxWidth - 1, BOX_HEIGHT - 1);

  ctx.fillStyle = TEXT_COLOR;
  ctx.font = FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const lines = wrapText(ctx, dialogue.pages[dialogue.pageIndex], boxWidth - BOX_PADDING_X * 2);

  lines.forEach((line, index) => {
    ctx.fillText(line, boxX + BOX_PADDING_X, boxY + BOX_PADDING_Y + index * TEXT_LINE_HEIGHT);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] ?? "";

  for (let i = 1; i < words.length; i += 1) {
    const nextLine = `${currentLine} ${words[i]}`;

    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      continue;
    }

    lines.push(currentLine);
    currentLine = words[i];
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
