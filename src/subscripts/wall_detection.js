import { system as system57, world as world60 } from "@minecraft/server";
var DEBUG25 = false;
var REFRESH_RATE20 = 5;
var RADIUS2 = 3;
var PROCESSING_TAG3 = "shapescape_bewe_wall_detection_process";
system57.runInterval(() => {
  let players = world60.getPlayers();
  for (let player of players) {
    if (!player.hasTag(PROCESSING_TAG3)) {
      try {
        wallCheck(player);
      } catch {
        continue;
      }
    }
  }
}, REFRESH_RATE20);
world60.afterEvents.playerSpawn.subscribe((event) => {
  event.player.removeTag(PROCESSING_TAG3);
});
function getWallsInRadius2(player, radius) {
  return new Promise((resolve) => {
    const generator = function* () {
      const windSource = world60.getDynamicProperty("shapescape_bewe:wind_source") ?? 2;
      const location = {
        x: player.location.x,
        y: player.location.y + 1,
        z: player.location.z
      };
      let direction = { x: 0, y: 0, z: 0 };
      let walls = 0;
      switch (windSource) {
        case 0:
          direction.z = -1;
          break;
        case 1:
          direction.z = 1;
          break;
        case 2:
          direction.x = -1;
          break;
        case 3:
          direction.x = 1;
          break;
        default:
          break;
      }
      const block = player.dimension.getBlockFromRay(location, direction, {
        includeLiquidBlocks: true,
        includePassableBlocks: false,
        maxDistance: radius
      })?.block;
      if (block)
        walls += 1;
      yield;
      resolve(walls);
    };
    system57.runJob(generator());
  });
}
async function wallCheck(player) {
  player.addTag(PROCESSING_TAG3);
  const wall = await getWallsInRadius2(player, RADIUS2);
  if (DEBUG25)
    console.warn("wall:", wall);
  player.setDynamicProperty("shapescape_bewe:detected_walls", wall);
  player.removeTag(PROCESSING_TAG3);
}
