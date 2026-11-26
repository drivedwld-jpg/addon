import {
  system as system37,
  world as world40
} from "@minecraft/server";
var REFRESH_RATE12 = 2 * 20;
var PROCESSING_TAG = "shapescape_bewe_temperature_block_process";
world40.afterEvents.playerSpawn.subscribe((event) => {
  event.player.removeTag(PROCESSING_TAG);
});
var heat_blocks = {
  "minecraft:fire": 4,
  "minecraft:soul_fire": 4,
  // campfire extinguished detection in calculation
  "minecraft:campfire": 12,
  "minecraft:soul_campfire": 12,
  "minecraft:lava": 8,
  "minecraft:magma": 2,
  // cauldron lava detection in calculation
  "minecraft:cauldron": 5,
  "minecraft:lit_furnace": 5,
  "minecraft:lit_blast_furnace": 5,
  "minecraft:lit_smoker": 5,
  "minecraft:torch": 1,
  "minecraft:soul_torch": 1,
  "minecraft:lit_pumpkin": 2,
  "minecraft:lantern": 1,
  "minecraft:soul_lantern": 1,
  // COLD
  "minecraft:ice": -5,
  "minecraft:blue_ice": -6,
  "minecraft:forested_ice": -8,
  "minecraft:packed_ice": -8,
  "minecraft:snow": -3,
  "minecraft:snow_layer": -2,
  "minecraft:powder_snow": -2,
  "minecraft:water": -0.5
};
function getHeatBlocksInRadius(dimension, origin, radius) {
  return new Promise((resolve) => {
    const generator = function* () {
      const heatBlocks = [];
      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          for (let z = -radius; z <= radius; z++) {
            try {
              let block = void 0;
              try {
                block = dimension.getBlock({
                  x: origin.x + x,
                  y: origin.y + y,
                  z: origin.z + z
                });
              } catch {
              }
              if (block && !block.isAir && heat_blocks.hasOwnProperty(block.typeId)) {
                heatBlocks.push(block);
              }
              yield;
            } catch {
              yield;
            }
          }
        }
      }
      resolve(heatBlocks);
    };
    system37.runJob(generator());
  });
}
async function temperature_update(player) {
  player.addTag(PROCESSING_TAG);
  const radius = 5;
  const nearbyHeatBlocks = await getHeatBlocksInRadius(player.dimension, player.location, radius);
  if (!player)
    return;
  let totalHeat = 0;
  let totalCold = 0;
  for (let block of nearbyHeatBlocks) {
    if (block.typeId === "minecraft:campfire" || block.typeId === "minecraft:soul_campfire") {
      let is_extinguished = block.permutation.getState("extinguished");
      if (is_extinguished)
        continue;
    }
    if (block.typeId === "minecraft:cauldron") {
      let liquid = block.permutation.getState("cauldron_liquid");
      let fill_level = block.permutation.getState("fill_level");
      if (liquid !== "lava" || fill_level === 0)
        continue;
    }
    const heatValue = heat_blocks[block.typeId];
    if (heatValue === void 0)
      continue;
    if (heatValue > 0) {
      totalHeat += heatValue;
    } else {
      totalCold += heatValue;
    }
  }
  player.setDynamicProperty("shapescape_bewe:temperature.blocks.heat", totalHeat);
  player.setDynamicProperty("shapescape_bewe:temperature.blocks.cold", totalCold);
  player.removeTag(PROCESSING_TAG);
}
system37.runInterval(() => {
  let players = world40.getPlayers();
  for (let player of players) {
    if (!player.hasTag(PROCESSING_TAG)) {
      try {
        temperature_update(player);
      } catch {
      }
    }
  }
}, REFRESH_RATE12);
system37.runInterval(() => {
  const entities = world40.getDimension("overworld").getEntities({ families: ["shapescape_bewe_thermometer_block"] });
  for (let entity of entities) {
    if (!entity.hasTag(PROCESSING_TAG)) {
      try {
        temperature_update_thermometer_block(entity);
      } catch {
        continue;
      }
    }
  }
}, REFRESH_RATE12 * 4);
async function temperature_update_thermometer_block(thermometer_block) {
  thermometer_block.addTag(PROCESSING_TAG);
  const radius = 5;
  const nearbyHeatBlocks = await getHeatBlocksInRadius(thermometer_block.dimension, thermometer_block.location, radius);
  if (!thermometer_block)
    return;
  let totalHeat = 0;
  let totalCold = 0;
  for (let block of nearbyHeatBlocks) {
    if (block.typeId === "minecraft:campfire" || block.typeId === "minecraft:soul_campfire") {
      let is_extinguished = block.permutation.getState("extinguished");
      if (is_extinguished)
        continue;
    }
    if (block.typeId === "minecraft:cauldron") {
      let liquid = block.permutation.getState("cauldron_liquid");
      let fill_level = block.permutation.getState("fill_level");
      if (liquid !== "lava" || fill_level === 0)
        continue;
    }
    const heatValue = heat_blocks[block.typeId];
    if (heatValue > 0) {
      totalHeat += heatValue;
    } else {
      totalCold += heatValue;
    }
  }
  if (thermometer_block.isValid) {
    thermometer_block.setDynamicProperty("shapescape_bewe:temperature.blocks.heat", totalHeat);
    thermometer_block.setDynamicProperty("shapescape_bewe:temperature.blocks.cold", totalCold);
    thermometer_block.removeTag(PROCESSING_TAG);
  }
}
