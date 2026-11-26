import { Vec3 } from "../vendor/bedrock-boost.js";
import { system as system8, world as world7 } from "@minecraft/server";
var lastEventLocation = new Vec3(0, 0, 0);
function placeHikerCabinBlockAndDespawn(event) {
  const dimension = event.dimension;
  const location = event.block.location;
  const scoreboard = world7.scoreboard.getObjective("shapescape_bewe_hiker_cabin_block");
  if (scoreboard !== void 0)
    return;
  if (lastEventLocation.equals(location)) {
    return;
  }
  try {
    dimension.setBlockType(location, "minecraft:air");
  } catch {
    return;
  }
  lastEventLocation = Vec3.from(location);
  dimension.runCommand(`summon shapescape_bewe:hiker_cabin_entity ${location.x} ${location.y} ${location.z} ~~`);
}
system8.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("shapescape_bewe:hiker_cabin_block", {
    onTick: (event2) => {
      placeHikerCabinBlockAndDespawn(event2);
    }
  });
});
