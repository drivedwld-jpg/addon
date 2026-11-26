import {
  system as system13,
  world as world12,
  MolangVariableMap as MolangVariableMap3,
  EntityDamageCause as EntityDamageCause2,
  GameMode as GameMode2
} from "@minecraft/server";
var REFRESH_RATE3 = 1 * 20;
system13.runInterval(() => {
  if (system13.currentTick % REFRESH_RATE3 !== 0)
    return;
  if ((world12.getDynamicProperty(
    "shapescape_bewe:settings.weather.blizzard"
  ) ?? true) === false)
    return;
  let players = world12.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const WEATHER = world12.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  const WIND_DIRECTION = world12.getDynamicProperty(
    "shapescape_bewe:wind_direction"
  ) ?? { x: 1, y: 0, z: 0 };
  if (WEATHER !== "thunderstorm")
    return;
  for (let player of players) {
    const allowedGamemode = player.getGameMode() !== GameMode2.Creative && player.getGameMode() !== GameMode2.Spectator;
    if (!allowedGamemode)
      continue;
    const dimension = player.dimension;
    const location = player.location;
    try {
      if (alreadyProcessed.has(player))
        continue;
      const nearbyPlayers = dimension.getEntities({
        location,
        maxDistance: 32,
        type: "minecraft:player"
      });
      for (let otherPlayer of nearbyPlayers) {
        if (otherPlayer.nameTag !== player.nameTag) {
          alreadyProcessed.add(otherPlayer);
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty(
        "shapescape_bewe:environment_detection.biome_temperature"
      ) ?? 0.5;
      if (BIOME_TEMPERATURE > 0.15)
        continue;
      if (location.y < 40 || dimension.id !== "minecraft:overworld")
        continue;
      const windDrivenRain_molang = new MolangVariableMap3();
      windDrivenRain_molang.setVector3("wind_direction", WIND_DIRECTION);
      dimension.spawnParticle(
        "shapescape_bewe:blizzard",
        location,
        windDrivenRain_molang
      );
    } catch {
    }
    if (system13.currentTick % 40 === 0) {
      const entitiesToSlow = dimension.getEntities({
        location,
        maxDistance: 32,
        excludeFamilies: ["player"]
      });
      for (const entity of entitiesToSlow) {
        entity.removeEffect("minecraft:slowness");
        entity.addEffect("minecraft:slowness", 50, {
          amplifier: 1,
          // Random level between 0 and 2
          showParticles: false
        });
      }
    }
    let blockToCheck = void 0;
    if (system13.currentTick % 120 === 0 && Math.random() < 0.6) {
      const playerVelocity = player.getVelocity();
      if (Math.abs(playerVelocity.x) < 0.1 && Math.abs(playerVelocity.z) < 0.1) {
        try {
          blockToCheck = player.dimension.getBlock({
            x: player.location.x,
            y: player.location.y - 1,
            z: player.location.z
          });
          if (blockToCheck?.isAir || blockToCheck === void 0) {
            continue;
          }
          let northBlock = blockToCheck.north(1)?.above(1);
          let southBlock = blockToCheck.south(1)?.above(1);
          let eastBlock = blockToCheck.east(1)?.above(1);
          let westBlock = blockToCheck.west(1)?.above(1);
          let blocks = [northBlock, southBlock, eastBlock, westBlock];
          for (let block of blocks) {
            if (block === void 0 || block.isLiquid) {
              continue;
            }
            if ((block.isAir || block.typeId.includes("minecraft:light_block") || block.typeId.includes("minecraft:snow_layer")) && !block.below(1)?.typeId.includes("minecraft:air")) {
              block.setType("minecraft:snow");
              system13.runTimeout(() => {
                if (block.typeId.includes("minecraft:snow")) {
                  block.setType("minecraft:air");
                }
              }, 500);
              continue;
            }
            if ((block.above(1)?.isAir || block.above(1)?.typeId.includes("minecraft:light_block") || block.above(1)?.typeId.includes("minecraft:snow_layer")) && !block.below(1)?.typeId.includes("minecraft:air")) {
              block.above(1)?.setType("minecraft:snow");
              system13.runTimeout(() => {
                if (block.above(1)?.typeId.includes("minecraft:snow")) {
                  block.above(1)?.setType("minecraft:air");
                }
              }, 500);
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  }
}, 1);
var SOUND_COOLDOWN = 9.5 * 20;
var COOLDOWN_NORMAL = "shapescape_bewe_blizzard_normal";
var COOLDOWN_SHELTER = "shapescape_bewe_blizzard_shelter";
world12.afterEvents.playerSpawn.subscribe((event) => {
  clear_cooldowns2(event.player);
});
function clear_cooldowns2(player) {
  player.removeTag(COOLDOWN_NORMAL);
  player.removeTag(COOLDOWN_SHELTER);
}
system13.runInterval(() => {
  blizzard_sound();
}, 1);
function blizzard_sound() {
  if ((world12.getDynamicProperty(
    "shapescape_bewe:settings.weather.blizzard"
  ) ?? true) === false)
    return;
  let players = world12.getPlayers();
  const WEATHER = world12.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  if (WEATHER !== "thunderstorm")
    return;
  for (let player of players) {
    try {
      let in_shelter = false;
      let ray_location = {
        x: player.location.x,
        y: player.location.y + 1.5,
        z: player.location.z
      };
      let block = player.dimension.getBlockFromRay(
        ray_location,
        { x: 0, y: 1, z: 0 },
        { maxDistance: 16, includePassableBlocks: false }
      );
      if (player.dimension.getBlock(ray_location)?.isLiquid)
        in_shelter = true;
      if (block !== void 0)
        in_shelter = true;
      if (player.location.y < 55)
        in_shelter = true;
      if (player.hasTag(COOLDOWN_NORMAL)) {
        if (in_shelter === true) {
          player.removeTag(COOLDOWN_NORMAL);
          player.runCommand("/stopsound @s shapescape_bewe.blizzard");
        }
      }
      if (player.hasTag(COOLDOWN_SHELTER)) {
        if (in_shelter === false) {
          player.removeTag(COOLDOWN_SHELTER);
          player.runCommand("/stopsound @s shapescape_bewe.blizzard");
        }
      }
      const BIOME_TEMPERATURE = player.getDynamicProperty(
        "shapescape_bewe:environment_detection.biome_temperature"
      ) ?? 0.5;
      if (BIOME_TEMPERATURE > 0.15)
        continue;
      if (player.location.y < 50 || player.dimension.id !== "minecraft:overworld")
        continue;
      if (player.hasTag(COOLDOWN_NORMAL) || player.hasTag(COOLDOWN_SHELTER))
        continue;
      if (!in_shelter) {
        player.addTag(COOLDOWN_NORMAL);
        player.playSound("shapescape_bewe.blizzard", { volume: 0.7 });
      } else {
        player.addTag(COOLDOWN_SHELTER);
        player.playSound("shapescape_bewe.blizzard", { volume: 0.3 });
      }
      system13.runTimeout(() => {
        player.removeTag(COOLDOWN_NORMAL);
        player.removeTag(COOLDOWN_SHELTER);
      }, SOUND_COOLDOWN);
    } catch {
    }
  }
}
