import {
  DIALOGUE_BOX_MARGIN,
  DIALOGUE_BOX_PADDING_X,
  DIALOGUE_FONT,
  DIALOGUE_MAX_TEXT_LINES
} from "./dialogue-config.js";

export function createDialoguePages(ctx, canvas, text) {
  ctx.save();
  ctx.font = DIALOGUE_FONT;

  const textAreaWidth = getDialogueTextAreaWidth(canvas);
  const pages = paginateText(ctx, text, textAreaWidth, DIALOGUE_MAX_TEXT_LINES);

  ctx.restore();

  return pages;
}

function getDialogueTextAreaWidth(canvas) {
  const horizontalMargin = DIALOGUE_BOX_MARGIN * 2;
  const horizontalPadding = DIALOGUE_BOX_PADDING_X * 2;

  return canvas.width - horizontalMargin - horizontalPadding;
}

function paginateText(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ").filter(Boolean);
  const pages = [];
  let currentLineWords = [];
  let currentPageLines = [];

  for (const word of words) {
    const candidateLineWords = [...currentLineWords, word];
    const candidateLineText = joinWords(candidateLineWords);

    if (doesTextFitOnLine(ctx, candidateLineText, maxWidth)) {
      currentLineWords = candidateLineWords;
      continue;
    }

    if (hasWords(currentLineWords)) {
      currentPageLines = commitCurrentLine(currentLineWords, currentPageLines, pages, maxLines);
      currentLineWords = [word];
      continue;
    }

    currentPageLines = appendLine(currentPageLines, word);
    currentPageLines = flushFullPage(pages, currentPageLines, maxLines);
  }

  currentPageLines = commitCurrentLine(currentLineWords, currentPageLines, pages, maxLines);

  pushTrailingPage(pages, currentPageLines);

  return pages;
}

function doesTextFitOnLine(ctx, text, maxWidth) {
  return ctx.measureText(text).width <= maxWidth;
}

function hasWords(words) {
  return words.length > 0;
}

function joinWords(words) {
  return words.join(" ");
}

function appendLine(pageLines, lineText) {
  return [...pageLines, lineText];
}

function commitCurrentLine(currentLineWords, currentPageLines, pages, maxLines) {
  if (currentLineWords.length === 0) {
    return currentPageLines;
  }

  const completedLineText = joinWords(currentLineWords);
  const pageLinesWithCurrentLine = appendLine(currentPageLines, completedLineText);

  return flushFullPage(pages, pageLinesWithCurrentLine, maxLines);
}

function flushFullPage(pages, pageLines, maxLines) {
  if (pageLines.length < maxLines) {
    return pageLines;
  }

  pages.push(pageLines);
  return [];
}

function pushTrailingPage(pages, pageLines) {
  if (pageLines.length === 0) {
    return;
  }

  pages.push(pageLines);
}
