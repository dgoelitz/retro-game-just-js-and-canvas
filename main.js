import { startGame } from "./game/game-loop.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const debugStartKey = window.location.hash.replace("#", "");

ctx.imageSmoothingEnabled = false;

startGame(canvas, ctx, debugStartKey);
