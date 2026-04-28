export function getRectangularPathPosition(pathRect, progress) {
  const width = pathRect.right - pathRect.left;
  const height = pathRect.bottom - pathRect.top;
  const perimeter = (width + height) * 2;
  const distance = ((progress % perimeter) + perimeter) % perimeter;

  if (distance < width) {
    return {
      x: pathRect.left + distance,
      y: pathRect.top
    };
  }

  if (distance < width + height) {
    return {
      x: pathRect.right,
      y: pathRect.top + distance - width
    };
  }

  if (distance < width * 2 + height) {
    return {
      x: pathRect.right - (distance - width - height),
      y: pathRect.bottom
    };
  }

  return {
    x: pathRect.left,
    y: pathRect.bottom - (distance - width * 2 - height)
  };
}

export function getRectangularPathHalfwayPoint(pathRect) {
  const width = pathRect.right - pathRect.left;
  const height = pathRect.bottom - pathRect.top;

  return width + height;
}
