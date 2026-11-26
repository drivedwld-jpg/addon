import { system as system39, world as world42 } from "@minecraft/server";
var DEBUG16 = false;
var REFRESH_RATE14 = 5 * 20;
var RADIUS = 10;
var PROCESSING_TAG2 = "shapescape_bewe_temperature_shelter_process";
world42.afterEvents.playerSpawn.subscribe((event) => {
  event.player.removeTag(PROCESSING_TAG2);
});
function getWallsInRadius(player, radius) {
  if (!player.isValid)
    return;
  const location = {
    x: player.location.x,
    y: player.location.y + 1,
    z: player.location.z
  };
  const directions = [
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 }
  ];
  let walls = 0;
  for (const direction of directions) {
    const block = player.dimension.getBlockFromRay(location, direction, {
      includeLiquidBlocks: false,
      includePassableBlocks: false,
      maxDistance: radius
    })?.block;
    if (block)
      walls += 1;
  }
  return walls;
}
async function shelter_check(player) {
  player.addTag(PROCESSING_TAG2);
  const cover = await getWallsInRadius(player, RADIUS);
  if (DEBUG16)
    console.warn("Cover:", cover);
  player.setDynamicProperty("shapescape_bewe:temperature.shelter", cover);
  player.removeTag(PROCESSING_TAG2);
}
system39.runInterval(() => {
  let players = world42.getPlayers();
  for (let player of players) {
    if (!player.hasTag(PROCESSING_TAG2)) {
      try {
        shelter_check(player);
      } catch {
        continue;
      }
    }
  }
}, REFRESH_RATE14);
system39.runInterval(() => {
  const entities = world42.getDimension("overworld").getEntities({ families: ["shapescape_bewe_thermometer_block"] });
  for (let entity of entities) {
    if (!entity.hasTag(PROCESSING_TAG2)) {
      try {
        shelter_check_thermometer_block(entity);
      } catch {
        continue;
      }
    }
  }
}, REFRESH_RATE14 * 2);
async function shelter_check_thermometer_block(thermometer_block) {
  thermometer_block.addTag(PROCESSING_TAG2);
  const cover = await getWallsInRadius(thermometer_block, RADIUS);
  if (thermometer_block.isValid) {
    thermometer_block.setDynamicProperty("shapescape_bewe:temperature.shelter", cover);
    thermometer_block.removeTag(PROCESSING_TAG2);
  }
}
