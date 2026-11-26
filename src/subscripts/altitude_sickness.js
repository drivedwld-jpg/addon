import {
  system,
  world,
  EquipmentSlot,
  EntityComponentTypes,
  TicksPerSecond,
  EntityDamageCause,
  MolangVariableMap,
  GameMode
} from "@minecraft/server";
var DATA = [{ "altitude": { "min": 115, "max": 115 }, "delay": 30, "effects_frequency": 10, "effects": { "damage": 0, "nausea_duration": 3 } }, { "altitude": { "min": 120, "max": 120 }, "delay": 10, "effects_frequency": 5, "effects": { "damage": 0, "nausea_duration": 5 } }, { "altitude": { "min": 130, "max": 130 }, "delay": 10, "effects_frequency": 5, "effects": { "damage": 1, "nausea_duration": 6 } }, { "altitude": { "min": 140, "max": 140 }, "delay": 10, "effects_frequency": 5, "effects": { "damage": 1, "nausea_duration": 7 } }];
var INTERVAL = 1 * TicksPerSecond;
var DEBUG = false;
var TIP_TAG = "shapescape_bewe_ALTITUDE_SICKNESS_TIP";
var TAG_PREFIX = `shapescape_bewe_ALTITUDE_SICKNESS`;
system.runInterval(() => {
  if (system.currentTick % INTERVAL === 0) {
    const players = world.getPlayers();
    for (const player of players) {
      checkAltitude(player);
    }
  }
}, 1);
world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    const tags = event.player.getTags();
    for (const tag of tags) {
      if (tag.includes(TAG_PREFIX)) {
        event.player.removeTag(tag);
      }
    }
    const initArray = [];
    for (const threshold of DATA) {
      initArray.push({
        altitude: {
          min: threshold.altitude.min,
          max: threshold.altitude.max
        },
        duration: 0
        // Start with 0 exposure time
      });
    }
    event.player.setDynamicProperty(`altitude_sickness_data`, JSON.stringify(initArray));
    event.player.setDynamicProperty(`altitude_sickness`, false);
  }
});
function checkAltitude(player) {
  const allowedGamemode = player.getGameMode() !== GameMode.Creative && player.getGameMode() !== GameMode.Spectator;
  if (!allowedGamemode)
    return;
  const property = player.getDynamicProperty(`altitude_sickness_data`);
  if (property === void 0) {
    const initArray = [];
    for (const threshold of DATA) {
      initArray.push({
        altitude: {
          min: threshold.altitude.min,
          max: threshold.altitude.max
        },
        duration: 0
        // Start with 0 exposure time
      });
    }
    player.setDynamicProperty(`altitude_sickness_data`, JSON.stringify(initArray));
  }
  const playerData = JSON.parse(player.getDynamicProperty(`altitude_sickness_data`));
  const setting = player.getDynamicProperty(`shapescape_bewe:settings.states.altitude_sickness`) ?? true;
  let altitude = player.location.y;
  const freeAltitudeEntities = player.dimension.getEntities({
    maxDistance: 8,
    type: "shapescape_bewe:hiker_cabin_entity",
    location: player.location
  });
  if (freeAltitudeEntities.length > 0) {
    altitude = 0;
  }
  if (player.dimension.id === "minecraft:nether")
    altitude = 0;
  const newPlayerData = [];
  let index = -1;
  for (const threshold of DATA) {
    index++;
    const EFFECT_TAG = `${TAG_PREFIX}_${index}`;
    let currentData = playerData.find(
      (data) => data.altitude.min === threshold.altitude.min && data.altitude.max === threshold.altitude.max
    );
    if (currentData !== void 0) {
      const hasHelmet = player.getComponent(EntityComponentTypes.Equippable)?.getEquipment(EquipmentSlot.Head)?.typeId === "shapescape_bewe:altitude_helmet";
      if ((!setting || altitude < threshold.altitude.min || hasHelmet) && currentData.duration > 0) {
        currentData.duration -= INTERVAL / TicksPerSecond;
        if (currentData.duration <= 0 && player.hasTag(EFFECT_TAG)) {
          player.setDynamicProperty(`altitude_sickness`, false);
          player.removeTag(EFFECT_TAG);
        }
      } else if (altitude > threshold.altitude.min && currentData.duration <= threshold.delay) {
        currentData.duration += INTERVAL / TicksPerSecond;
        if (currentData.duration >= threshold.delay && !player.hasTag(EFFECT_TAG)) {
          player.setDynamicProperty(`altitude_sickness`, true);
          player.addTag(EFFECT_TAG);
        }
      }
      if (setting && player.hasTag(EFFECT_TAG) && system.currentTick % (Math.round(threshold.effects_frequency / 2) * TicksPerSecond) === 0) {
        particles(player);
      }
      if (setting && player.hasTag(EFFECT_TAG) && system.currentTick % (threshold.effects_frequency * TicksPerSecond) === 0) {
        if (!player.hasTag(TIP_TAG)) {
          player.sendMessage({ translate: `shapescape_bewe.altitude_sickness.tip` });
          player.playSound(`note.bass`, { location: player.location });
          player.addTag(TIP_TAG);
        }
        if (threshold.effects.damage > 0) {
          player.applyDamage(threshold.effects.damage, {
            cause: EntityDamageCause.drowning
            // For some reason suffocation doesn't work here
          });
        }
        player.addEffect("minecraft:nausea", threshold.effects.nausea_duration * TicksPerSecond, {
          amplifier: 0,
          showParticles: false
        });
      }
    } else {
      currentData = {
        altitude: {
          min: threshold.altitude.min,
          max: threshold.altitude.max
        },
        duration: 0
        // Start with 0 exposure time
      };
    }
    newPlayerData.push(currentData);
  }
  if (DEBUG) {
    world.sendMessage(`=============
=============`);
    for (const data of playerData) {
      world.sendMessage(`Altitude: ${JSON.stringify(data.altitude)} <=> Duration: ${JSON.stringify(data.duration)}`);
    }
  }
  player.setDynamicProperty(`altitude_sickness_data`, JSON.stringify(newPlayerData));
}
function particles(player) {
  const headLocation = player.getHeadLocation();
  const direction = player.getViewDirection();
  const velocity = player.getVelocity();
  const particleLocation = {
    x: headLocation.x + direction.x + velocity.x * 8,
    y: headLocation.y + 0.1 + direction.y + velocity.y * 8,
    z: headLocation.z + direction.z + velocity.z * 8
  };
  const molang = new MolangVariableMap();
  molang.setFloat("variable.direction_x", velocity.x);
  molang.setFloat("variable.direction_y", velocity.y);
  molang.setFloat("variable.direction_z", velocity.z);
  try {
    player.spawnParticle("shapescape_bewe:altitude_sickness_dots", particleLocation, molang);
  } catch {
  }
}
