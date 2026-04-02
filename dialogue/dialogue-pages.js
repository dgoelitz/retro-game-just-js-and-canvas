import {
  DIALOGUE_BOX_MARGIN,
  DIALOGUE_BOX_PADDING_X,
  DIALOGUE_FONT,
  DIALOGUE_MAX_TEXT_LINES
} from "./dialogue-config.js";

export function createDialoguePages(ctx, canvas, text) {
  ctx.save();
  ctx.font = DIALOGUE_FONT;

  const maxWidth = canvas.width - DIALOGUE_BOX_MARGIN * 2 - DIALOGUE_BOX_PADDING_X * 2;
  const pages = paginateText(ctx, text, maxWidth, DIALOGUE_MAX_TEXT_LINES);

  ctx.restore();

  return pages;
}

function paginateText(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ").filter(Boolean);
  const pages = [];
  let currentLines = [];
  let currentWords = [];

  for (const word of words) {
    const candidateLineWords = [...currentWords, word];
    const candidateLine = candidateLineWords.join(" ");

    if (ctx.measureText(candidateLine).width <= maxWidth) {
      currentWords = candidateLineWords;
      continue;
    }

    if (currentWords.length > 0) {
      currentLines.push(currentWords.join(" "));
      currentWords = [word];

      if (currentLines.length < maxLines) {
        continue;
      }

      pages.push(createPage(currentLines));
      currentLines = [];
      continue;
    }

    currentLines.push(word);

    if (currentLines.length === maxLines) {
      pages.push(createPage(currentLines));
      currentLines = [];
    }
  }

  if (currentWords.length > 0) {
    currentLines.push(currentWords.join(" "));
  }

  if (currentLines.length > 0) {
    pages.push(createPage(currentLines));
  }

  return pages;
}

function createPage(lines) {
  return {
    lines,
    fullText: lines.join(" ")
  };
}
