import { system as system23, world as world23, MolangVariableMap as MolangVariableMap10 } from "@minecraft/server";
var REFRESH_RATE8 = 7 * 20;
function getRandomNumber5(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
system23.runInterval(() => {
  if ((world23.getDynamicProperty("shapescape_bewe:settings.weather.night_fog") ?? true) === false)
    return;
  const time = world23.getTimeOfDay();
  if (time > 14e3 && time < 22e3) {
    night_fog();
  }
}, REFRESH_RATE8);
function night_fog() {
  let players = world23.getPlayers();
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
      const fogMolang = new MolangVariableMap10();
      const lifetime = getRandomNumber5(8, 10);
      fogMolang.setFloat("distance_min", 15);
      fogMolang.setFloat("distance_max", 120);
      fogMolang.setFloat("lifetime", lifetime);
      if (fog_type === "normal") {
        fogMolang.setFloat("density", 30);
        fogMolang.setFloat("color_r", 0.3);
        fogMolang.setFloat("color_g", 0.3);
        fogMolang.setFloat("color_b", 0.3);
        fogMolang.setFloat("max_opacity", 0.45);
      }
      if (fog_type === "cold") {
        fogMolang.setFloat("density", 30);
        fogMolang.setFloat("color_r", 0.9);
        fogMolang.setFloat("color_g", 0.9);
        fogMolang.setFloat("color_b", 0.9);
        fogMolang.setFloat("max_opacity", 0.45);
      }
      let location = { x: player.location.x, y: 70, z: player.location.z };
      player.dimension.spawnParticle("shapescape_bewe:3d_fog_emitter", location, fogMolang);
    } catch {
    }
  }
}
