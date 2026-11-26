import { system as system12, world as world11, MolangVariableMap as MolangVariableMap2 } from "@minecraft/server";
var REFRESH_RATE2 = 1 * 20;
system12.runInterval(() => {
  let players = world11.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const setting_rain_ripples = world11.getDynamicProperty("shapescape_bewe:settings.weather.rain_ripples") ?? true;
  const setting_wind_driven_rain = world11.getDynamicProperty("shapescape_bewe:settings.weather.wind_driven_rain") ?? true;
  const WEATHER = world11.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  const WIND_DIRECTION = world11.getDynamicProperty("shapescape_bewe:wind_direction") ?? { x: 1, y: 0, z: 0 };
  if (WEATHER === "clear")
    return;
  for (let player of players) {
    try {
      if (alreadyProcessed.has(player))
        continue;
      const nearbyPlayers = player.dimension.getEntities({
        location: player.location,
        maxDistance: 16,
        type: "minecraft:player"
      });
      for (let otherPlayer of nearbyPlayers) {
        if (otherPlayer.nameTag !== player.nameTag) {
          alreadyProcessed.add(otherPlayer);
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
      if (player.location.y < 40 || player.dimension.id !== "minecraft:overworld" || BIOME_TEMPERATURE >= 1 || BIOME_TEMPERATURE <= 0.15)
        continue;
      const windDrivenRain_molang = new MolangVariableMap2();
      windDrivenRain_molang.setVector3("wind_direction", WIND_DIRECTION);
      if (setting_rain_ripples) {
        try {
          player.dimension.spawnParticle("shapescape_bewe:water_circle_rain", player.location);
        } catch {
        }
      }
      if (setting_wind_driven_rain) {
        try {
          player.dimension.spawnParticle("shapescape_bewe:rain_wind", player.location, windDrivenRain_molang);
        } catch {
        }
      }
    } catch {
    }
  }
}, REFRESH_RATE2);
var LastWeather = "clear";
var CurrentWeather = "clear";
world11.afterEvents.worldLoad.subscribe(() => {
  LastWeather = world11.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  CurrentWeather = world11.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
});
system12.runInterval(() => {
  let Weather = world11.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  if (Weather != CurrentWeather) {
    LastWeather = CurrentWeather;
    CurrentWeather = Weather;
    if (LastWeather === "rain" && CurrentWeather === "clear") {
      spawn_rainbow();
    }
  }
}, REFRESH_RATE2);
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function spawn_rainbow() {
  const timeOfDay = world11.getTimeOfDay();
  if (timeOfDay > 12e3)
    return;
  const setting_rainbow = world11.getDynamicProperty("shapescape_bewe:settings.weather.rainbow") ?? true;
  if (!setting_rainbow)
    return;
  let players = world11.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  for (let player of players) {
    try {
      if (alreadyProcessed.has(player))
        continue;
      const nearbyPlayers = player.dimension.getEntities({
        location: player.location,
        maxDistance: 128,
        type: "minecraft:player"
      });
      for (let otherPlayer of nearbyPlayers) {
        if (otherPlayer.nameTag !== player.nameTag) {
          alreadyProcessed.add(otherPlayer);
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
      if (player.dimension.id !== "minecraft:overworld" || BIOME_TEMPERATURE >= 1 || BIOME_TEMPERATURE <= 0.15)
        continue;
      const rainbow_rng = getRandomNumber(1, 10);
      if (rainbow_rng > 8)
        continue;
      const angle = getRandomNumber(1, 360);
      const rainbow_location = {
        x: player.location.x,
        y: 64,
        z: player.location.z
      };
      const rainbowMolang = new MolangVariableMap2();
      const lifetime = getRandomNumber(32, 60);
      rainbowMolang.setFloat("lifetime", lifetime);
      rainbowMolang.setFloat("size", 32);
      rainbowMolang.setFloat("range", 128);
      rainbowMolang.setFloat("angle", angle);
      player.dimension.spawnParticle("shapescape_bewe:rainbow", rainbow_location, rainbowMolang);
    } catch {
    }
  }
}
