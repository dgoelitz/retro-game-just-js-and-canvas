export function createInput() {
  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    attack: false,
    interact: false,
    shield: false,
    map: false
  };

  const blockedKeys = [
    "arrowleft",
    "arrowright",
    "arrowup",
    "arrowdown",
    "a",
    "d",
    "w",
    "s",
    " ",
    "enter",
    "shift",
    "tab"
  ];

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (blockedKeys.includes(key)) {
      event.preventDefault();
    }

    if (key === "arrowleft" || key === "a") input.left = true;
    if (key === "arrowright" || key === "d") input.right = true;
    if (key === "arrowup" || key === "w") input.up = true;
    if (key === "arrowdown" || key === "s") input.down = true;
    if (key === " " && !event.repeat) input.attack = true;
    if (key === "enter" && !event.repeat) input.interact = true;
    if (key === "shift") input.shield = true;
    if (key === "tab" && !event.repeat) input.map = true;
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") input.left = false;
    if (key === "arrowright" || key === "d") input.right = false;
    if (key === "arrowup" || key === "w") input.up = false;
    if (key === "arrowdown" || key === "s") input.down = false;
    if (key === "shift") input.shield = false;
  });

  return input;
}
