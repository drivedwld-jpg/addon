import { system as system18, world as world18, MolangVariableMap as MolangVariableMap6 } from "@minecraft/server";
var DEBUG5 = false;
var REFRESH_RATE6 = 1 * 20;
var AFTER_RAIN_FOG_DURATION = 90;
var LastWeather2 = "clear";
var CurrentWeather2 = "clear";
var after_rain_fog_iteration = 0;
var after_rain_fog_cooldown = 0;
world18.afterEvents.worldLoad.subscribe(() => {
  LastWeather2 = world18.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  CurrentWeather2 = world18.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  world18.setDynamicProperty("shapescape_bewe:after_rain_fog_iteration", after_rain_fog_iteration);
});
function getRandomNumber2(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
system18.runInterval(() => {
  let Weather = world18.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  if (Weather != CurrentWeather2) {
    LastWeather2 = CurrentWeather2;
    CurrentWeather2 = Weather;
    if (LastWeather2 === "rain" && CurrentWeather2 === "clear") {
      if (DEBUG5)
        world18.sendMessage("After rain fog");
      after_rain_fog();
      after_rain_fog_iteration = AFTER_RAIN_FOG_DURATION / 5;
      world18.setDynamicProperty("shapescape_bewe:after_rain_fog_iteration", after_rain_fog_iteration);
    }
  }
  if (after_rain_fog_iteration > 0) {
    if (after_rain_fog_cooldown === 0) {
      after_rain_fog_cooldown = 1;
      system18.runTimeout(() => {
        if (after_rain_fog_iteration > 2) {
          after_rain_fog();
        }
        after_rain_fog_cooldown = 0;
        after_rain_fog_iteration -= 1;
        world18.setDynamicProperty("shapescape_bewe:after_rain_fog_iteration", after_rain_fog_iteration);
        if (DEBUG5)
          world18.sendMessage(`After rain fog trigger. Left: ${after_rain_fog_iteration}`);
      }, 5 * 20);
    }
  }
}, REFRESH_RATE6);
function after_rain_fog() {
  if ((world18.getDynamicProperty("shapescape_bewe:settings.weather.after_rain_fog") ?? true) === false)
    return;
  let players = world18.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  for (let player of players) {
    try {
      if (player.location.y < 40)
        continue;
      if (player.dimension.id !== "minecraft:overworld")
        continue;
      if (alreadyProcessed.has(player))
        continue;
      const nearbyPlayers = player.dimension.getEntities({
        location: player.location,
        maxDistance: 64,
        type: "minecraft:player"
      });
      for (let otherPlayer of nearbyPlayers) {
        if (otherPlayer.nameTag !== player.nameTag) {
          alreadyProcessed.add(otherPlayer);
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
      let fog_type = "normal";
      if (BIOME_TEMPERATURE >= 1)
        continue;
      if (BIOME_TEMPERATURE >= 0.15)
        fog_type = "normal";
      if (BIOME_TEMPERATURE < 0.15)
        fog_type = "cold";
      const fogMolang = new MolangVariableMap6();
      const lifetime = getRandomNumber2(8, 10);
      fogMolang.setFloat("distance_min", 15);
      fogMolang.setFloat("distance_max", 120);
      fogMolang.setFloat("lifetime", lifetime);
      if (fog_type === "normal") {
        fogMolang.setFloat("density", 200);
        fogMolang.setFloat("color_r", 0.7);
        fogMolang.setFloat("color_g", 0.7);
        fogMolang.setFloat("color_b", 0.7);
        fogMolang.setFloat("max_opacity", 0.35);
      }
      if (fog_type === "cold") {
        fogMolang.setFloat("density", 200);
        fogMolang.setFloat("color_r", 1);
        fogMolang.setFloat("color_g", 1);
        fogMolang.setFloat("color_b", 1);
        fogMolang.setFloat("max_opacity", 0.45);
      }
      let location = { x: player.location.x, y: 70, z: player.location.z };
      player.dimension.spawnParticle("shapescape_bewe:3d_fog_emitter", location, fogMolang);
    } catch {
    }
  }
}
