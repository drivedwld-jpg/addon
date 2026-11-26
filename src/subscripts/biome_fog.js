import { system as system20, world as world20, MolangVariableMap as MolangVariableMap8 } from "@minecraft/server";
var DEBUG7 = false;
function getRandomNumber4(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var TRIGGER_COOLDOWN2 = 8.1 * 20;
system20.runInterval(() => {
  if ((world20.getDynamicProperty("shapescape_bewe:settings.weather.biome_fog") ?? true) === false)
    return;
  const WEATHER = world20.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  if (WEATHER !== "clear")
    return;
  let afterRainFog = world20.getDynamicProperty("shapescape_bewe:after_rain_fog_iteration") ?? 0;
  if (afterRainFog > 0)
    return;
  const time = world20.getTimeOfDay();
  if (time > 22500 || time < 600)
    return;
  if (time > 14e3 && time < 22e3)
    return;
  if (DEBUG7)
    world20.sendMessage("Biome fog trigger");
  biome_fog();
}, TRIGGER_COOLDOWN2);
function biome_fog() {
  let players = world20.getPlayers();
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
      let fog_type = "none";
      if (BIOME_TEMPERATURE >= 1)
        continue;
      if (biomeTags.length === 0 || biome === "")
        continue;
      if (BIOME_TEMPERATURE < 0.15)
        fog_type = "cold";
      if (biomeTags.includes("jungle") || biome === "jungle")
        fog_type = "jungle";
      if (biomeTags.includes("swamp") || biomeTags.includes("mangrove_swamp") || biome === "swamp")
        fog_type = "swamp";
      if (fog_type === "none")
        continue;
      const fogMolang = new MolangVariableMap8();
      const lifetime = getRandomNumber4(8, 12);
      fogMolang.setFloat("distance_min", 5);
      fogMolang.setFloat("distance_max", 80);
      fogMolang.setFloat("lifetime", lifetime);
      if (fog_type === "jungle") {
        fogMolang.setFloat("density", 100);
        fogMolang.setFloat("color_r", 0.3);
        fogMolang.setFloat("color_g", 0.8);
        fogMolang.setFloat("color_b", 0.3);
        fogMolang.setFloat("max_opacity", 0.2);
      }
      if (fog_type === "swamp") {
        fogMolang.setFloat("density", 80);
        fogMolang.setFloat("color_r", 0.3);
        fogMolang.setFloat("color_g", 0.4);
        fogMolang.setFloat("color_b", 0.2);
        fogMolang.setFloat("max_opacity", 0.3);
      }
      if (fog_type === "cold") {
        fogMolang.setFloat("density", 150);
        fogMolang.setFloat("color_r", 1);
        fogMolang.setFloat("color_g", 1);
        fogMolang.setFloat("color_b", 1);
        fogMolang.setFloat("max_opacity", 0.25);
      }
      let location = { x: player.location.x, y: 70, z: player.location.z };
      player.dimension.spawnParticle("shapescape_bewe:ground_fog_emitter", location, fogMolang);
    } catch {
    }
  }
}
