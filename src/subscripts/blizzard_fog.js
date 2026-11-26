import { system as system21, world as world21, MolangVariableMap as MolangVariableMap9 } from "@minecraft/server";
var REFRESH_RATE7 = 8 * 20;
system21.runInterval(() => {
  if ((world21.getDynamicProperty("shapescape_bewe:settings.weather.blizzard") ?? true) === false)
    return;
  let players = world21.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const WEATHER = world21.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  if (WEATHER !== "thunderstorm")
    return;
  for (let player of players) {
    try {
      if (alreadyProcessed.has(player))
        continue;
      const nearbyPlayers = player.dimension.getEntities({
        location: player.location,
        maxDistance: 32,
        type: "minecraft:player"
      });
      for (let otherPlayer of nearbyPlayers) {
        if (otherPlayer.nameTag !== player.nameTag) {
          alreadyProcessed.add(otherPlayer);
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
      if (BIOME_TEMPERATURE > 0.15)
        continue;
      if (player.location.y < 40 || player.dimension.id !== "minecraft:overworld")
        continue;
      const fogMolang = new MolangVariableMap9();
      fogMolang.setFloat("distance_min", 5);
      fogMolang.setFloat("distance_max", 20);
      fogMolang.setFloat("lifetime", 9);
      fogMolang.setFloat("density", 15);
      fogMolang.setFloat("color_r", 1);
      fogMolang.setFloat("color_g", 1);
      fogMolang.setFloat("color_b", 1);
      fogMolang.setFloat("max_opacity", 0.3);
      let location = { x: player.location.x, y: 70, z: player.location.z };
      player.dimension.spawnParticle("shapescape_bewe:ground_fog_emitter", location, fogMolang);
    } catch {
    }
  }
}, REFRESH_RATE7);
