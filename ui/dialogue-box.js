import {
  DIALOGUE_BORDER_COLOR,
  DIALOGUE_BOX_COLOR,
  DIALOGUE_BOX_HEIGHT,
  DIALOGUE_BOX_MARGIN,
  DIALOGUE_BOX_PADDING_X,
  DIALOGUE_BOX_PADDING_Y,
  DIALOGUE_FONT,
  DIALOGUE_TEXT_COLOR,
  DIALOGUE_TEXT_LINE_HEIGHT
} from "../dialogue/dialogue-config.js";

export function renderDialogueBox(ctx, canvas, dialogue) {
  const boxBounds = getDialogueBoxBounds(canvas);
  const currentPage = dialogue.pages[dialogue.pageIndex];
  const lines = getVisibleLines(currentPage, dialogue.visibleCharacters);

  drawDialogueBackground(ctx, boxBounds);
  configureDialogueText(ctx);
  drawDialogueLines(ctx, boxBounds, lines);
}

function getDialogueBoxBounds(canvas) {
  return {
    x: DIALOGUE_BOX_MARGIN,
    y: canvas.height - DIALOGUE_BOX_HEIGHT - DIALOGUE_BOX_MARGIN,
    width: canvas.width - DIALOGUE_BOX_MARGIN * 2,
    height: DIALOGUE_BOX_HEIGHT
  };
}

function drawDialogueBackground(ctx, boxBounds) {
  ctx.fillStyle = DIALOGUE_BOX_COLOR;
  ctx.fillRect(boxBounds.x, boxBounds.y, boxBounds.width, boxBounds.height);

  ctx.strokeStyle = DIALOGUE_BORDER_COLOR;
  ctx.lineWidth = 1;
  ctx.strokeRect(boxBounds.x + 0.5, boxBounds.y + 0.5, boxBounds.width - 1, boxBounds.height - 1);
}

function configureDialogueText(ctx) {
  ctx.fillStyle = DIALOGUE_TEXT_COLOR;
  ctx.font = DIALOGUE_FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

function drawDialogueLines(ctx, boxBounds, lines) {
  lines.forEach((line, i) => {
    const textX = boxBounds.x + DIALOGUE_BOX_PADDING_X;
    const textY = boxBounds.y + DIALOGUE_BOX_PADDING_Y + i * DIALOGUE_TEXT_LINE_HEIGHT;

    ctx.fillText(line, textX, textY);
  });
}

function getVisibleLines(page, visibleCharacters) {
  if (!page) {
    return [];
  }

  const visibleLines = [];
  let remainingCharacters = Math.floor(visibleCharacters);

  for (let i = 0; i < page.lines.length; i += 1) {
    const line = page.lines[i];
    const visibleLine = getVisibleLineText(line, remainingCharacters);
    const isLastLine = i === page.lines.length - 1;

    visibleLines.push(visibleLine);
    remainingCharacters = getRemainingCharacters(remainingCharacters, line, isLastLine);
  }

  return visibleLines;
}

function getRemainingCharacters(remainingCharacters, line, isLastLine) {
  if (remainingCharacters <= 0) {
    return 0;
  }

  const hiddenCharacters = Math.max(remainingCharacters - line.length, 0);

  if (isLastLine) {
    return hiddenCharacters;
  }

  return Math.max(hiddenCharacters - 1, 0);
}

function getVisibleLineText(line, remainingCharacters) {
  if (remainingCharacters <= 0) {
    return "";
  }

  return line.slice(0, remainingCharacters);
}
