import { system as system24, world as world24 } from "@minecraft/server";
var DEBUG8 = false;
var biomesWithFog = [
  "basalt_deltas",
  "soulsand_valley",
  "warped_forest",
  "crimson_forest",
  "hell",
  "the_end",
  "desert",
  "savanna",
  "mesa",
  "swamp",
  "ice",
  "taiga",
  "mangrove_swamp",
  "extreme_hills",
  "jungle",
  "mushroom_island"
];
var weather = "clear";
world24.afterEvents.playerSpawn.subscribe(() => {
  onReload();
});
function onReload() {
  let players = world24.getPlayers();
  for (let player of players) {
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", "none");
    world24.setDynamicProperty("shapescape_bewe:fog_system.weather_previous", "clear");
  }
}
system24.afterEvents.scriptEventReceive.subscribe(({ id, sourceEntity }) => {
  if (sourceEntity === void 0 || sourceEntity?.typeId !== "minecraft:player")
    return;
  if (id === "shapescape_bewe:fogs.turn_off") {
    sourceEntity.runCommand("/fog @s remove climatic");
    sourceEntity.runCommand("/fog @s remove weather");
  }
  if (id === "shapescape_bewe:fogs.turn_on") {
    onReload();
  }
});
system24.runInterval(() => {
  let players = world24.getPlayers();
  for (let player of players) {
    if (world24.getDynamicProperty("shapescape_bewe:settings.weather.fogs") ?? true) {
      try {
        let biomeCurrent = getCurrentBiome(player);
        const biomeUnified = unifyingBiomes(biomeCurrent);
        weather = world24.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
        const biomeLast = player.getDynamicProperty("shapescape_bewe:fog_system.biome_previous") ?? "none";
        fogClimaticDependingOnBiome(player, biomeCurrent, biomeLast, biomeUnified);
        fogControllDependingOnWeather(player, biomeCurrent, biomeLast, biomeUnified);
      } catch {
      }
    }
  }
}, 5);
function getCurrentBiome(player) {
  const biomesWanted = ["mangrove_swamp"];
  let biomeTagsString = player.getDynamicProperty("shapescape_bewe:fog_system.biome_tags") ?? '["none"]';
  if (player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") !== "[]") {
    biomeTagsString = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_tags", biomeTagsString);
  }
  const biomeTags = JSON.parse(biomeTagsString);
  for (let biomeTag of biomeTags) {
    for (let biomeWanted of biomesWanted) {
      if (biomeTag === biomeWanted)
        return biomeTag;
      else
        return player.getDynamicProperty("shapescape_bewe:environment_detection.biome");
    }
  }
}
function unifyingBiomes(biomeCurrent) {
  if (biomeCurrent == "mangrove_swamp")
    return "swamp";
  if (biomeCurrent == "taiga" || biomeCurrent == "extreme_hills")
    return "ice";
  return biomeCurrent;
}
function fogClimaticDependingOnBiome(player, biomeCurrent, biomeLast, biomeUnified) {
  const intervalStatusClimatic = player.getDynamicProperty("shapescape_bewe:fog_system.interval_status_climatic") ?? "stopInterval";
  const fogStatus = world24.getDynamicProperty("shapescape_bewe:fog_system.weather_previous") ?? "clear";
  if (biomeCurrent !== biomeLast && weather === "clear" || weather === "clear" && fogStatus !== "clear") {
    world24.setDynamicProperty("shapescape_bewe:fog_system.weather_previous", "clear");
    if (biomesWithFog.includes(biomeCurrent)) {
      player.runCommand("/fog @s remove climatic");
      player.runCommand("/fog @s push shapescape_bewe:" + biomeUnified + "_climatic climatic");
      player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", biomeCurrent);
      player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_climatic", "runInterval");
      if (DEBUG8)
        player.sendMessage("push fog climatic - " + biomeUnified);
    } else {
      player.runCommand("/fog @s remove climatic");
      player.runCommand("/fog @s remove weather");
      player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_climatic", "stopInterval");
      player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", biomeCurrent);
      if (DEBUG8)
        player.sendMessage("Remove fog climatic - biome without fog");
    }
  } else if (weather !== "clear" && intervalStatusClimatic === "runInterval") {
    player.runCommand("/fog @s remove climatic");
    player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_climatic", "stopInterval");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", "none");
    if (DEBUG8)
      player.sendMessage("Remove fog climatic - weather is not clear");
  }
}
function fogControllDependingOnWeather(player, biomeCurrent, biomeLast, biomeUnified) {
  const fogStatus = world24.getDynamicProperty("shapescape_bewe:fog_system.weather_previous") ?? "clear";
  if (biomeCurrent !== biomeLast && weather === "rain" || weather === "rain" && fogStatus != "rain") {
    player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_not_clear", "runInterval");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", biomeCurrent);
    fogRainy(player, biomeCurrent, biomeUnified);
    world24.setDynamicProperty("shapescape_bewe:fog_system.weather_previous", "rain");
    if (DEBUG8)
      player.sendMessage("weather rain");
  } else if (biomeCurrent !== biomeLast && weather === "thunderstorm" || weather === "thunderstorm" && fogStatus != "thunderstorm") {
    player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_not_clear", "runInterval");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", biomeCurrent);
    fogStormy(player, biomeCurrent, biomeUnified);
    world24.setDynamicProperty("shapescape_bewe:fog_system.weather_previous", "thunderstorm");
    if (DEBUG8)
      player.sendMessage("weather thunderstorm");
  } else if (weather === "clear" && fogStatus != "clear") {
    if (DEBUG8)
      player.sendMessage("weather is clear");
    player.runCommand("/fog @s remove weather");
    player.setDynamicProperty("shapescape_bewe:fog_system.interval_status_not_clear", "stopInterval");
    world24.setDynamicProperty("shapescape_bewe:fog_system.weather_previous", "clear");
  }
}
function fogRainy(player, biomeCurrent, biomeUnified) {
  if (weather === "rain") {
    player.runCommand("/fog @s remove weather");
    if (!biomesWithFog.includes(biomeCurrent))
      biomeUnified = "general";
    player.runCommand("/fog @s push shapescape_bewe:" + biomeUnified + "_rainy weather");
    if (DEBUG8)
      player.sendMessage("Applying fog rainy on biome: " + biomeCurrent);
  } else if (weather !== "rain") {
    player.runCommand("/fog @s remove weather");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", "none");
    if (DEBUG8)
      player.sendMessage("clear fog after rain");
  }
}
function fogStormy(player, biomeCurrent, biomeUnified) {
  if (weather === "thunderstorm") {
    player.runCommand("/fog @s remove weather");
    if (!biomesWithFog.includes(biomeCurrent))
      biomeUnified = "general";
    player.runCommand("/fog @s push shapescape_bewe:" + biomeUnified + "_stormy weather");
    if (DEBUG8)
      player.sendMessage("Applying fog stormy on biome: " + biomeCurrent);
  } else if (weather !== "thunderstorm") {
    player.runCommand("/fog @s remove weather");
    player.setDynamicProperty("shapescape_bewe:fog_system.biome_previous", "none");
    if (DEBUG8)
      player.sendMessage("clear fog after storm");
  }
}
