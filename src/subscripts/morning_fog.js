import { system as system19, world as world19, MolangVariableMap as MolangVariableMap7 } from "@minecraft/server";
var DEBUG6 = false;
function getRandomNumber3(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var TRIGGER_COOLDOWN = 8 * 20;
system19.runInterval(() => {
  if ((world19.getDynamicProperty("shapescape_bewe:settings.weather.morning_fog") ?? true) === false)
    return;
  const time = world19.getTimeOfDay();
  if (time > 23e3 || time < 400) {
    if (DEBUG6)
      world19.sendMessage("Morning fog trigger");
    morning_fog();
  }
}, TRIGGER_COOLDOWN);
function morning_fog() {
  let players = world19.getPlayers();
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
      const biome = player.getDynamicProperty("shapescape_bewe:environment_detection.biome") ?? "";
      const biomeTagsProperty = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") ?? "[]";
      const biomeTags = JSON.parse(biomeTagsProperty);
      let fog_type = "normal";
      if (BIOME_TEMPERATURE >= 1)
        continue;
      if (BIOME_TEMPERATURE >= 0.15)
        fog_type = "normal";
      if (BIOME_TEMPERATURE < 0.15)
        fog_type = "cold";
      if (biomeTags.includes("jungle") || biome === "jungle")
        fog_type = "jungle";
      if (biomeTags.includes("swamp") || biomeTags.includes("mangrove_swamp") || biome === "swamp")
        fog_type = "swamp";
      const fogMolang = new MolangVariableMap7();
      const lifetime = getRandomNumber3(10, 15);
      fogMolang.setFloat("distance_min", 5);
      fogMolang.setFloat("distance_max", 120);
      fogMolang.setFloat("lifetime", lifetime);
      if (fog_type === "normal") {
        fogMolang.setFloat("density", 300);
        fogMolang.setFloat("color_r", 0.85);
        fogMolang.setFloat("color_g", 1);
        fogMolang.setFloat("color_b", 0.85);
        fogMolang.setFloat("max_opacity", 0.2);
      }
      if (fog_type === "jungle") {
        fogMolang.setFloat("density", 300);
        fogMolang.setFloat("color_r", 0.5);
        fogMolang.setFloat("color_g", 1);
        fogMolang.setFloat("color_b", 0.5);
        fogMolang.setFloat("max_opacity", 0.2);
      }
      if (fog_type === "swamp") {
        fogMolang.setFloat("density", 300);
        fogMolang.setFloat("color_r", 0.1);
        fogMolang.setFloat("color_g", 0.3);
        fogMolang.setFloat("color_b", 0);
        fogMolang.setFloat("max_opacity", 0.25);
      }
      if (fog_type === "cold") {
        fogMolang.setFloat("density", 300);
        fogMolang.setFloat("color_r", 1);
        fogMolang.setFloat("color_g", 1);
        fogMolang.setFloat("color_b", 1);
        fogMolang.setFloat("max_opacity", 0.2);
      }
      let location = { x: player.location.x, y: 70, z: player.location.z };
      player.dimension.spawnParticle("shapescape_bewe:3d_fog_emitter", location, fogMolang);
    } catch {
    }
  }
}
