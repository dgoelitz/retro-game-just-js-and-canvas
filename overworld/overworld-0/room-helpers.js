export function createOverworld0RoomDefinition({
  walls,
  neighbors,
  createEnemies = null,
  createProps = null,
  createNpcs = null
}) {
  return {
    walls,
    neighbors,
    createEnemies,
    createProps,
    createNpcs
  };
}
