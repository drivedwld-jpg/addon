import { Vec3 } from "../vendor/bedrock-boost.js";
import {
  system as system33,
  world as world33,
  MolangVariableMap as MolangVariableMap16,
  BlockVolume as BlockVolume8,
  EntityDamageCause as EntityDamageCause10,
  GameMode as GameMode9
} from "@minecraft/server";
var REFRESH_RATE11 = 1 * 20;
system33.runInterval(() => {
  if (system33.currentTick % REFRESH_RATE11 !== 0)
    return;
  if ((world33.getDynamicProperty(
    "shapescape_bewe:settings.weather.sandstorm"
  ) ?? true) === false)
    return;
  let players = world33.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const WEATHER = world33.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  const WIND_DIRECTION = world33.getDynamicProperty(
    "shapescape_bewe:wind_direction"
  ) ?? { x: 1, y: 0, z: 0 };
  if (WEATHER !== "thunderstorm")
    return;
  for (let player of players) {
    const dimension = player.dimension;
    const location = player.location;
    const biome = player.getDynamicProperty(
      "shapescape_bewe:environment_detection.biome"
    ) ?? "";
    const biomeTagsProperty = player.getDynamicProperty(
      "shapescape_bewe:environment_detection.biome_tags"
    ) ?? "[]";
    const biomeTags = JSON.parse(biomeTagsProperty);
    if (biome === "")
      continue;
    if (!biomeTags.includes("desert") && biome !== "desert" && !biomeTags.includes("mesa") && biome !== "mesa")
      continue;
    if (location.y < 40 || dimension.id !== "minecraft:overworld")
      continue;
    const allowedGamemode = player.getGameMode() !== GameMode9.Creative && player.getGameMode() !== GameMode9.Spectator;
    if (!allowedGamemode)
      continue;
    applyAgainstWindEffects(player, false, true);
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
    const windDrivenRain_molang = new MolangVariableMap16();
    windDrivenRain_molang.setVector3("wind_direction", WIND_DIRECTION);
    try {
      dimension.spawnParticle("shapescape_bewe:sandstorm_clouds", location);
      dimension.spawnParticle(
        "shapescape_bewe:sandstorm",
        location,
        windDrivenRain_molang
      );
    } catch {
    }
    if (system33.currentTick % 40 === 0) {
      const entitiesToLevitateMob = dimension.getEntities({
        location,
        maxDistance: 32,
        families: ["mob"]
      });
      const entitiesToLevitateMonster = dimension.getEntities({
        location,
        maxDistance: 32,
        families: ["monster"]
      });
      const entitesToLevitate = [
        ...entitiesToLevitateMob,
        ...entitiesToLevitateMonster
      ];
      for (const entity of entitesToLevitate) {
        if (Math.random() < 0.3)
          continue;
        entity.addEffect("minecraft:levitation", 25 + Math.random() * 10, {
          amplifier: 2,
          // Random level between 1 and 2
          showParticles: false
        });
        entity.removeEffect("minecraft:slow_falling");
        entity.addEffect("minecraft:slow_falling", 80, {
          amplifier: 0,
          // Random level between 0 and 2
          showParticles: false
        });
      }
    }
    if (system33.currentTick % 60 === 0) {
      const normRevertWindDir = Vec3.from(WIND_DIRECTION).multiply(-1).normalize();
      const P1 = {
        x: location.x + (Math.round(normRevertWindDir.x) === 0 ? 20 : Math.round(normRevertWindDir.x) * 30),
        y: location.y + 1,
        z: location.z + (Math.round(normRevertWindDir.z) === 0 ? 20 : Math.round(normRevertWindDir.z) * 30)
      };
      const P2 = {
        x: location.x - (Math.round(normRevertWindDir.x) === 0 ? 20 : -Math.round(normRevertWindDir.x) * 30),
        y: location.y,
        z: location.z - (Math.round(normRevertWindDir.z) === 0 ? 20 : -Math.round(normRevertWindDir.z) * 30)
      };
      const volume = new BlockVolume8(P1, P2);
      let index = 0;
      for (const location2 of volume.getBlockLocationIterator()) {
        if (Math.random() < 0.975)
          continue;
        let block;
        try {
          block = dimension.getBlock(location2);
        } catch {
        }
        if (block && block.isAir) {
          index++;
          system33.runTimeout(() => {
            try {
              dimension.spawnEntity("shapescape_bewe:tumbleweed", block.center());
            } catch {
            }
          }, index * 10);
        }
      }
    }
  }
}, 1);
var SOUND_COOLDOWN4 = 8 * 20;
var COOLDOWN_NORMAL2 = "shapescape_bewe_sandstorm_normal";
var COOLDOWN_SHELTER2 = "shapescape_bewe_sandstorm_shelter";
world33.afterEvents.playerSpawn.subscribe((event) => {
  clear_cooldowns3(event.player);
});
function clear_cooldowns3(player) {
  player.removeTag(COOLDOWN_NORMAL2);
  player.removeTag(COOLDOWN_SHELTER2);
}
system33.runInterval(() => {
  sandstorm_sound();
}, 1);
function sandstorm_sound() {
  if ((world33.getDynamicProperty(
    "shapescape_bewe:settings.weather.sandstorm"
  ) ?? true) === false)
    return;
  let players = world33.getPlayers();
  const WEATHER = world33.getDynamicProperty(
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
      if (player.hasTag(COOLDOWN_NORMAL2)) {
        if (in_shelter === true) {
          player.removeTag(COOLDOWN_NORMAL2);
          player.runCommand("/stopsound @s shapescape_bewe.sandstorm");
        }
      }
      if (player.hasTag(COOLDOWN_SHELTER2)) {
        if (in_shelter === false) {
          player.removeTag(COOLDOWN_SHELTER2);
          player.runCommand("/stopsound @s shapescape_bewe.sandstorm");
        }
      }
      const biome = player.getDynamicProperty(
        "shapescape_bewe:environment_detection.biome"
      ) ?? "";
      const biomeTagsProperty = player.getDynamicProperty(
        "shapescape_bewe:environment_detection.biome_tags"
      ) ?? "[]";
      const biomeTags = JSON.parse(biomeTagsProperty);
      if (biome === "")
        continue;
      if (!biomeTags.includes("desert") && biome !== "desert" && !biomeTags.includes("mesa") && biome !== "mesa")
        continue;
      if (player.location.y < 50 || player.dimension.id !== "minecraft:overworld")
        continue;
      if (player.hasTag(COOLDOWN_NORMAL2) || player.hasTag(COOLDOWN_SHELTER2))
        continue;
      if (!in_shelter) {
        player.addTag(COOLDOWN_NORMAL2);
        player.playSound("shapescape_bewe.sandstorm", { volume: 0.7 });
      } else {
        player.addTag(COOLDOWN_SHELTER2);
        player.playSound("shapescape_bewe.sandstorm", { volume: 0.3 });
      }
      system33.runTimeout(() => {
        player.removeTag(COOLDOWN_NORMAL2);
        player.removeTag(COOLDOWN_SHELTER2);
      }, SOUND_COOLDOWN4);
    } catch {
    }
  }
}
function applyAgainstWindEffects(player, shouldPlayAnimation = true, shouldApplyWindDamage = true) {
  const playerFlatLocation = Vec3.from(player.location).setY(0);
  const previousPlayerLocation = Vec3.from(
    player.getDynamicProperty(
      "shapescape_bewe:player_previous_location"
    ) ?? { x: 0.5, y: 0, z: 0.5 }
  ).setY(0);
  const threshold = playerFlatLocation.subtract(previousPlayerLocation);
  if (playerFlatLocation === void 0 || previousPlayerLocation === void 0 || threshold.length() < 0.01) {
    return;
  }
  const playerGeneralDirection = playerFlatLocation.subtract(
    previousPlayerLocation
  );
  const playerNormalizedDirection = playerGeneralDirection.normalize();
  const windDirection = Vec3.from(
    world33.getDynamicProperty("shapescape_bewe:wind_direction") ?? {
      x: 1,
      y: 0,
      z: 0
    }
  ).normalize();
  if (playerNormalizedDirection.dot(windDirection) < 0.5) {
    if (shouldPlayAnimation) {
      player.playAnimation("animation.shapescape_bewe.player.sandstorm_pose");
    }
    if (system33.currentTick % 60 === 0 && shouldApplyWindDamage) {
      player.applyDamage(1.1, { cause: EntityDamageCause10.none });
      randomTip(player, "sandstorm_against_wind");
    }
  }
  player.setDynamicProperty(
    "shapescape_bewe:player_previous_location",
    playerFlatLocation
  );
}
world33.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    event.player.removeTag(`shapescape_bewe_sandstorm_wind`);
  }
});
function randomTip(player, temperature) {
  const tipSetting = player.getDynamicProperty(
    `shapescape_bewe:settings.options.chat_warnings`
  ) ?? true;
  if (!tipSetting)
    return;
  if (player.hasTag(`shapescape_bewe_sandstorm_wind`))
    return;
  player.addTag(`shapescape_bewe_sandstorm_wind`);
  const message = {
    rawtext: [
      {
        translate: `shapescape_bewe.sandstorm_against_wind.tip`
      }
    ]
  };
  player.sendMessage(message);
  player.playSound(`note.bass`, {
    location: player.location
  });
}
