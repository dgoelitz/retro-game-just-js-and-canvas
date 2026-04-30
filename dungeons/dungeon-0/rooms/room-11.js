import { createSwitch } from "../../../world/room-prop-factories.js";
import { createDoor, createDungeon0RoomDefinition } from "../room-helpers.js";

export function createRoom11() {
  return createDungeon0RoomDefinition({
    roomNumber: 12,
    mapPosition: { x: 2, y: 1 },
    doors: {
      right: createDoor("right", 10, "barred"),
      bottom: createDoor("bottom", 5),
      top: createDoor("top", 12, "boss-key")
    },
    createProps() {
      return [
        createSwitch({
          id: "room-12-switch",
          x: 128,
          y: 40,
          progressFlag: "room12SwitchPressed"
        })
      ];
    },
    onUpdate({ session, activeWorld, helpers }) {
      if (!session.progress.dungeon.flags.room12SwitchPressed) {
        return;
      }

      helpers.unlockDoor(activeWorld.rooms[11], "right");
      helpers.unlockDoor(activeWorld.rooms[10], "left");
    }
  });
}
