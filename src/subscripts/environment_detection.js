import { system as system17, world as world17 } from "@minecraft/server";
var DEBUG4 = false;
var REFRESH_RATE5 = 1 * 20;
system17.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity?.typeId !== "minecraft:player")
    return;
  let player = event.sourceEntity;
  if (event.id === `shapescape_bewe:environment_detection.weather` && event.message) {
    world17.setDynamicProperty("shapescape_bewe:environment_detection.weather", event.message);
  }
  if (event.id === `shapescape_bewe:environment_detection.light_level` && event.message) {
    player.setDynamicProperty("shapescape_bewe:environment_detection.light_level", parseInt(event.message));
  }
  if (event.id === `shapescape_bewe:environment_detection.biome` && event.message) {
    player.setDynamicProperty("shapescape_bewe:environment_detection.biome", event.message);
  }
  if (event.id === `shapescape_bewe:environment_detection.biome_tags` && event.message) {
    let biomeTags = [];
    let biomeTagsProperty = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags");
    if (biomeTagsProperty && typeof biomeTagsProperty === "string") {
      biomeTags = JSON.parse(biomeTagsProperty);
    }
    biomeTags.push(event.message);
    player.setDynamicProperty("shapescape_bewe:environment_detection.biome_tags", JSON.stringify(biomeTags));
  }
  if (event.id === `shapescape_bewe:environment_detection.biome_temperature` && event.message) {
    player.setDynamicProperty("shapescape_bewe:environment_detection.biome_temperature", parseFloat(event.message));
  }
});
function get_environment_info(player) {
  if (DEBUG4) {
    let weather2 = "None";
    let lightLevel = "None";
    let biome = "None";
    let biomeTags = "None";
    let biomeTemperature = "None";
    if (world17.getDynamicProperty("shapescape_bewe:environment_detection.weather") !== void 0) {
      weather2 = world17.getDynamicProperty("shapescape_bewe:environment_detection.weather");
    }
    if (player.getDynamicProperty("shapescape_bewe:environment_detection.light_level") !== void 0) {
      lightLevel = player.getDynamicProperty("shapescape_bewe:environment_detection.light_level");
    }
    if (player.getDynamicProperty("shapescape_bewe:environment_detection.biome") !== void 0) {
      biome = player.getDynamicProperty("shapescape_bewe:environment_detection.biome");
    }
    if (player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") !== void 0) {
      biomeTags = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags");
    }
    if (player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") !== void 0) {
      biomeTemperature = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature");
    }
    let rawtext = {
      text: `\xA7bBiome: \xA7f${biome} \xA76| \xA7bBiome Temperature: \xA7f${biomeTemperature} \xA76| \xA7bWeather: \xA7f${weather2} \xA76| \xA7bLight Level: \xA7f${lightLevel} \xA76|
\xA7bBiome Tags: \xA7f${biomeTags}`
    };
    player.onScreenDisplay.setActionBar(rawtext);
  }
  player.setDynamicProperty("shapescape_bewe:environment_detection.biome_tags", "[]");
  player.dimension.spawnEntity("shapescape_bewe:environment_detection", player.location);
}
system17.runInterval(() => {
  let players = world17.getPlayers();
  for (let player of players) {
    try {
      get_environment_info(player);
    } catch {
    }
  }
}, REFRESH_RATE5);
