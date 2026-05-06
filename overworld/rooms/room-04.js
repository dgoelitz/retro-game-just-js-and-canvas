import { createNpc } from "../../npcs/npc.js";
import { createOverworldRoomDefinition } from "../room-helpers.js";

export function createRoom04() {
  return createOverworldRoomDefinition({
    walls: {
      top: true,
      right: true,
      bottom: false,
      left: true
    },
    neighbors: {
      down: 3
    },
    createNpcs() {
      return [
        createNpc({
          id: "town-guide",
          x: 72,
          y: 44
        })
      ];
    }
  });
}
