export function createOverworldRoomDefinition({
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
