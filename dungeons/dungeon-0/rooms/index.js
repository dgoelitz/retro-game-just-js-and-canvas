import { createRoom00 } from "./room-00.js";
import { createRoom01 } from "./room-01.js";
import { createRoom02 } from "./room-02.js";
import { createRoom03 } from "./room-03.js";
import { createRoom04 } from "./room-04.js";
import { createRoom05 } from "./room-05.js";
import { createRoom06 } from "./room-06.js";
import { createRoom07 } from "./room-07.js";
import { createRoom08 } from "./room-08.js";
import { createRoom09Miniboss } from "./room-09-miniboss.js";
import { createRoom10 } from "./room-10.js";
import { createRoom11 } from "./room-11.js";
import { createRoom12Boss } from "./room-12-boss.js";

export const DUNGEON_0_ROOM_BUILDERS = [
  createRoom00,
  createRoom01,
  createRoom02,
  createRoom03,
  createRoom04,
  createRoom05,
  createRoom06,
  createRoom07,
  createRoom08,
  createRoom09Miniboss,
  createRoom10,
  createRoom11,
  createRoom12Boss
];
