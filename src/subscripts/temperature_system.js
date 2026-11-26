import {
  system as system36,
  world as world39,
  EntityDamageCause as EntityDamageCause12,
  MolangVariableMap as MolangVariableMap18,
  EntityComponentTypes as EntityComponentTypes10,
  GameMode as GameMode10,
  TicksPerSecond as TicksPerSecond9
} from "@minecraft/server";
var BASE_STEP = 1.5;
var DIFFICULTY_TABLE2 = /* @__PURE__ */ new Map([
  [0, 1],
  // Easy
  [1, 1.5],
  // Normal
  [2, 2]
  // Hard
]);
var DEBUG15 = false;
var TEMPERATURE_LIMIT_NEGATIVE = -0.65;
var TEMPERATURE_LIMIT_POSITIVE = 0.65;
var REFRESH_RATE_UPDATE = 1 * 20;
var REFRESH_RATE_CALCULATION = 1 * 20;
var EFFECTS_INTERVAL = 1 * 20;
var MAX_PROGRESS = 300;
function calculateTemperature(player) {
  let biomeTemperature = player.getDynamicProperty(
    "shapescape_bewe:environment_detection.biome_temperature"
  ) ?? 0;
  biomeTemperature = biomeTemperature * 2 - 1;
  biomeTemperature = biomeTemperature * 0.85 /* biomeTemperature */;
  if (biomeTemperature > 0.8) {
    biomeTemperature = 0.7;
  }
  let blocksTemperatureHeat = player.getDynamicProperty(
    "shapescape_bewe:temperature.blocks.heat"
  ) ?? 0;
  let blocksTemperatureCold = player.getDynamicProperty(
    "shapescape_bewe:temperature.blocks.cold"
  ) ?? 0;
  blocksTemperatureHeat = blocksTemperatureHeat * 0.01;
  blocksTemperatureCold = blocksTemperatureCold * 0.01;
  let blocksTemperature = 0;
  if (biomeTemperature > 0) {
    blocksTemperature = blocksTemperatureCold + blocksTemperatureHeat * 0.02;
  } else {
    blocksTemperature = blocksTemperatureHeat + blocksTemperatureCold * 0.02;
  }
  blocksTemperature = blocksTemperature * 1 /* blocksTemperature */;
  blocksTemperature = clamp(blocksTemperature, -0.3, 0.3);
  const heaterBlock = player.getDynamicProperty(
    "shapescape_bewe:temperature.heaterBlock"
  ) ?? 0;
  if (heaterBlock > 1) {
    blocksTemperature += 0.5;
  }
  const coolerBlock = player.getDynamicProperty(
    "shapescape_bewe:temperature.coolerBlock"
  ) ?? 0;
  if (coolerBlock > 1) {
    blocksTemperature -= 0.5;
  }
  let shelterTemperature = player.getDynamicProperty("shapescape_bewe:temperature.shelter") ?? 0;
  if (shelterTemperature >= 3) {
    shelterTemperature = shelterTemperature * 0.03;
    shelterTemperature = shelterTemperature * 1 /* shelter */;
    if (biomeTemperature > 0.3) {
      shelterTemperature = -shelterTemperature;
    }
  } else
    shelterTemperature = 0;
  let timeOfDayTemperature = world39.getDynamicProperty(
    "shapescape_bewe:temperature.time_of_day"
  ) ?? 0;
  if (player.dimension.id === "minecraft:overworld") {
    timeOfDayTemperature = timeOfDayTemperature * 0.01;
    timeOfDayTemperature = timeOfDayTemperature * 0.5 /* timeOfDay */;
    if (shelterTemperature > 0) {
      timeOfDayTemperature = timeOfDayTemperature * 0.3;
    }
  } else
    timeOfDayTemperature = 0;
  let armorTemperature = player.getDynamicProperty("shapescape_bewe:temperature.armor") ?? 0;
  armorTemperature = armorTemperature * 0.01;
  if (biomeTemperature > 0 && armorTemperature > 0.3) {
    armorTemperature = 0.3;
  }
  if (biomeTemperature < 0 && armorTemperature < 0) {
    armorTemperature = 0;
  }
  armorTemperature = armorTemperature * 1 /* armorTemperature */;
  let isInWaterTemperature = 0;
  if (player.isInWater) {
    if (biomeTemperature > 0) {
      isInWaterTemperature = -0.1 * 1 /* isInWaterTemperature */;
    } else {
      isInWaterTemperature = -0.2 * 1 /* isInWaterTemperature */;
    }
  }
  let altitudeTemperature = 0;
  let altitude = player.location.y;
  if (altitude < 50)
    altitudeTemperature = 0.03;
  if (altitude < 40)
    altitudeTemperature = 0.06;
  if (altitude < 30)
    altitudeTemperature = 0.08;
  if (altitude < 15)
    altitudeTemperature = 0.1;
  if (altitude < -10)
    altitudeTemperature = 0.12;
  if (altitude < -20)
    altitudeTemperature = 0.14;
  if (altitude < -30)
    altitudeTemperature = 0.16;
  if (altitude < -40)
    altitudeTemperature = 0.19;
  if (altitude < -50)
    altitudeTemperature = 0.23;
  if (altitude > 60)
    altitudeTemperature = -0.01;
  if (altitude > 70)
    altitudeTemperature = -0.05;
  if (altitude > 80)
    altitudeTemperature = -0.08;
  if (altitude > 90)
    altitudeTemperature = -0.13;
  if (altitude > 100)
    altitudeTemperature = -0.17;
  if (altitude > 120)
    altitudeTemperature = -0.2;
  if (altitude > 135)
    altitudeTemperature = -0.22;
  if (altitude > 160)
    altitudeTemperature = -0.24;
  if (altitude > 185)
    altitudeTemperature = -0.26;
  if (altitude > 210)
    altitudeTemperature = -0.31;
  let movementTemperature = 0;
  if (player.isSprinting && !player.isGliding) {
    if (biomeTemperature > 0) {
      movementTemperature += 0.05;
    } else {
      movementTemperature += 0.1;
    }
  }
  if (player.isGliding) {
    movementTemperature -= 0.05;
  }
  const WEATHER = world39.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  let weatherTemperature = 0;
  if (player.dimension.id === "minecraft:overworld") {
    if (biomeTemperature < 0) {
      if (WEATHER === "rain")
        weatherTemperature = -0.18;
      if (WEATHER === "thunderstorm")
        weatherTemperature = -0.3;
    }
    if (biomeTemperature >= 0) {
      if (WEATHER === "rain")
        weatherTemperature = -0.14;
      if (WEATHER === "thunderstorm")
        weatherTemperature = -0.24;
    }
    if (shelterTemperature > 0) {
      weatherTemperature = weatherTemperature * 0.3;
    }
  }
  weatherTemperature = weatherTemperature * 1 /* weatherTemperature */;
  let onFireTemperature = 0;
  const onfire = player.getComponent(EntityComponentTypes10.OnFire);
  if (onfire) {
    if (biomeTemperature < 0) {
      onFireTemperature = 1.5;
    } else {
      onFireTemperature = 1;
    }
  }
  const wetStateThreshold = 0.2;
  const currentWetState = player.getDynamicProperty("wet_state") ?? 0;
  let wetStateTemperature = 0;
  if (currentWetState > wetStateThreshold) {
    wetStateTemperature = -currentWetState;
  }
  const muddyStateThreshold = 0.5;
  const currentMuddyState = player.getDynamicProperty("muddy_state") ?? 0;
  let muddyStateTemperature = 0;
  if (currentMuddyState > muddyStateThreshold) {
    muddyStateTemperature = -currentMuddyState * 0.15;
  }
  let itemTemperature = player.getDynamicProperty("shapescape_bewe:temperature.item") ?? 0;
  itemTemperature = itemTemperature * 0.01;
  itemTemperature = itemTemperature * 1.3 /* itemTemperature */;
  let foodTemperature = player.getDynamicProperty("shapescape_bewe:temperature.food") ?? 0;
  foodTemperature = foodTemperature * 0.01;
  if (biomeTemperature > 0 && foodTemperature > 0) {
    foodTemperature = foodTemperature * 0.4;
  }
  if (biomeTemperature < 0 && foodTemperature < 0) {
    foodTemperature = foodTemperature * 0.4;
  }
  foodTemperature = clamp(
    foodTemperature * 1.3 /* foodTemperature */,
    -0.3,
    0.3
  );
  let dimensionTemperature = 0;
  if (player.dimension.id === "minecraft:nether") {
    dimensionTemperature = 0.4;
  } else if (player.dimension.id === "minecraft:the_end") {
    dimensionTemperature = -1.1;
  }
  let temperature = biomeTemperature + timeOfDayTemperature + blocksTemperature + shelterTemperature + armorTemperature + isInWaterTemperature + weatherTemperature + itemTemperature + foodTemperature + movementTemperature + altitudeTemperature + onFireTemperature + wetStateTemperature + muddyStateTemperature + dimensionTemperature;
  let world_temperature = biomeTemperature + timeOfDayTemperature + blocksTemperature + shelterTemperature + isInWaterTemperature + weatherTemperature + altitudeTemperature + dimensionTemperature;
  if (DEBUG15) {
    player.sendMessage(`------------`);
    player.sendMessage(`biome: ${biomeTemperature}`);
    player.sendMessage(`time: ${timeOfDayTemperature}`);
    player.sendMessage(`blocks: ${blocksTemperature}`);
    player.sendMessage(`shelter: ${shelterTemperature}`);
    player.sendMessage(`armor: ${armorTemperature}`);
    player.sendMessage(`water: ${isInWaterTemperature}`);
    player.sendMessage(`weather: ${weatherTemperature}`);
    player.sendMessage(`item: ${itemTemperature}`);
    player.sendMessage(`food: ${foodTemperature}`);
    player.sendMessage(`movement: ${movementTemperature}`);
    player.sendMessage(`altitude: ${altitudeTemperature}`);
    player.sendMessage(`onFire: ${onFireTemperature}`);
    player.sendMessage(`wetState: ${wetStateTemperature}`);
    player.sendMessage(`muddyState: ${muddyStateTemperature}`);
    player.sendMessage(`dimension: ${dimensionTemperature}`);
  }
  player.setDynamicProperty(
    "shapescape_bewe:surrounding_temperature",
    world_temperature
  );
  player.setDynamicProperty("shapescape_bewe:temperature_target", temperature);
}
function updateTemperature(player) {
  const currentTemperature = player.getDynamicProperty("shapescape_bewe:temperature") ?? 0.5;
  const targetTemperature = player.getDynamicProperty("shapescape_bewe:temperature_target") ?? 0.5;
  const difference = Math.abs(targetTemperature - currentTemperature);
  const interpolationFactor = Math.min(1e-4 + difference * 0.01, 0.05) * REFRESH_RATE_UPDATE;
  const easedTemperature = easeOutCirc(interpolationFactor);
  const newTemperature = currentTemperature + (targetTemperature - currentTemperature) * easedTemperature;
  player.setDynamicProperty("shapescape_bewe:temperature", newTemperature);
  if (DEBUG15) {
    const displayCurrentTemperature = Math.round(newTemperature * 100) / 100;
    const displayTargetTemperature = Math.round(targetTemperature * 100) / 100;
    const message = `\xA7bTemperature: \xA7f${displayCurrentTemperature} \xA76| \xA7bTarget Temperature: \xA7f${displayTargetTemperature}`;
    player.onScreenDisplay.setActionBar({ text: message });
  }
}
function effects(player) {
  const temperature = player.getDynamicProperty("shapescape_bewe:temperature") ?? 0;
  const targetTemperature = player.getDynamicProperty("shapescape_bewe:temperature_target") ?? 0;
  let freezingProgress = player.getDynamicProperty("shapescape_bewe:temperature.freezing") ?? 0;
  let overheatingProgress = player.getDynamicProperty("shapescape_bewe:temperature.overheating") ?? 0;
  let freezingImmune = player.getDynamicProperty("f_i") ?? false;
  let overheatingImmune = player.getDynamicProperty("o_i") ?? false;
  const allowedGamemode = player.getGameMode() !== GameMode10.Creative && player.getGameMode() !== GameMode10.Spectator;
  if (!allowedGamemode)
    return;
  const isFreezing = temperature <= TEMPERATURE_LIMIT_NEGATIVE;
  const isOverheating = temperature >= TEMPERATURE_LIMIT_POSITIVE;
  const difficulty2 = player.getDynamicProperty(`shapescape_bewe:settings.options.difficulty`) ?? 0;
  const step = BASE_STEP * Math.abs(temperature * 2.5) * (DIFFICULTY_TABLE2.get(difficulty2) ?? 1);
  if (isFreezing) {
    freezingProgress = freezingProgress + step;
  } else if (freezingProgress > 0) {
    freezingProgress = Math.max(freezingProgress - 10, 0);
  }
  if (isOverheating) {
    overheatingProgress = overheatingProgress + step;
  } else if (overheatingProgress > 0) {
    overheatingProgress = Math.max(overheatingProgress - 10, 0);
  }
  player.setDynamicProperty(
    "shapescape_bewe:temperature.freezing",
    freezingProgress
  );
  player.setDynamicProperty(
    "shapescape_bewe:temperature.overheating",
    overheatingProgress
  );
  if (freezingProgress > 0 && isFreezing && freezingImmune === false) {
    freezing(player, freezingProgress, targetTemperature);
  }
  if (overheatingProgress > 0 && isOverheating && overheatingImmune === false) {
    overheating(player, overheatingProgress, targetTemperature);
  }
}
function freezing(player, progress, targetTemperature) {
  const cameraShake = false;
  const currentSeconds = system36.currentTick / TicksPerSecond9;
  let settingFreezingEffects = player.getDynamicProperty(
    "shapescape_bewe:settings.temperature.freezing_effects"
  ) ?? true;
  let settingFreezingDamage = player.getDynamicProperty(
    "shapescape_bewe:settings.temperature.freezing_damage"
  ) ?? true;
  if (settingFreezingEffects || settingFreezingDamage)
    randomTip2(player, "freezing", progress);
  if (!settingFreezingEffects && !settingFreezingDamage)
    return;
  if (progress > 10 && currentSeconds % 1 === 0 && targetTemperature < TEMPERATURE_LIMIT_NEGATIVE) {
    player.runCommand(
      "/playanimation @s animation.shapescape_bewe.player.freezing null 0.1"
    );
  }
  if (progress > 10 && progress < 60) {
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.02 1.05 positional`);
  }
  if (progress > 15 && currentSeconds % 4 === 0 && targetTemperature < TEMPERATURE_LIMIT_NEGATIVE) {
    if (settingFreezingEffects)
      particleColdBreath(player);
  }
  if (progress >= 60 && progress < 90) {
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.05 1.05 positional`);
  }
  if (progress > 60 && currentSeconds % 10 === 0) {
    if (settingFreezingEffects)
      player.playSound("fall.powder_snow", {
        location: player.location,
        volume: 0.9,
        pitch: 0.9
      });
  }
  if (progress >= 90 && progress < 120) {
    if (settingFreezingEffects)
      player.addEffect("slowness", 25, { showParticles: false, amplifier: 0 });
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.1 1.05 positional`);
  }
  if (progress >= 120 && progress < 180) {
    if (settingFreezingEffects)
      player.addEffect("slowness", 25, { showParticles: false, amplifier: 1 });
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.12 1.05`);
    if (currentSeconds % 5 === 0 && targetTemperature < TEMPERATURE_LIMIT_NEGATIVE) {
      if (settingFreezingDamage)
        player.applyDamage(1, { cause: EntityDamageCause12.freezing });
    }
  }
  if (progress >= 180 && progress < 220) {
    if (settingFreezingEffects)
      player.addEffect("slowness", 25, { showParticles: false, amplifier: 1 });
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.15 1.05`);
    if (currentSeconds % 3 === 0 && targetTemperature < TEMPERATURE_LIMIT_NEGATIVE) {
      if (settingFreezingDamage)
        player.applyDamage(1, { cause: EntityDamageCause12.freezing });
    }
  }
  if (progress >= 220) {
    if (currentSeconds % 2 === 0 && targetTemperature < TEMPERATURE_LIMIT_NEGATIVE) {
      if (settingFreezingDamage)
        player.applyDamage(2, { cause: EntityDamageCause12.freezing });
    }
    if (settingFreezingEffects)
      player.addEffect("slowness", 25, { showParticles: false, amplifier: 1 });
    if (settingFreezingEffects && cameraShake)
      player.runCommand(`/camerashake add @s 0.18 1.05`);
  }
  if (progress > MAX_PROGRESS) {
    player.setDynamicProperty("shapescape_bewe:temperature.freezing", 300);
  }
}
function overheating(player, progress, targetTemperature) {
  const currentSeconds = system36.currentTick / TicksPerSecond9;
  let setting_heat_effects = player.getDynamicProperty(
    "shapescape_bewe:settings.temperature.heat_effects"
  ) ?? true;
  let setting_heat_damage = player.getDynamicProperty(
    "shapescape_bewe:settings.temperature.heat_damage"
  ) ?? true;
  if (!setting_heat_effects && !setting_heat_damage)
    return;
  randomTip2(player, "overheating", progress);
  if (currentSeconds % 4 === 0 && targetTemperature > TEMPERATURE_LIMIT_POSITIVE) {
    player.runCommand(
      "/playanimation @s animation.shapescape_bewe.player.overheat null 1"
    );
  }
  if (currentSeconds % 8 === 0 && targetTemperature > TEMPERATURE_LIMIT_POSITIVE) {
    particleSweat(player);
  }
  if (progress > 5 && progress < 60) {
    if (currentSeconds % 10 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 100, { showParticles: false, amplifier: 0 });
    }
  }
  if (progress >= 60 && progress < 90) {
    if (setting_heat_effects)
      player.addEffect("weakness", 40, { showParticles: false, amplifier: 0 });
    if (currentSeconds % 7 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 120, { showParticles: false, amplifier: 0 });
    }
  }
  if (progress >= 90 && progress < 120) {
    if (currentSeconds % 7 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 120, { showParticles: false, amplifier: 0 });
    }
    if (setting_heat_effects)
      player.addEffect("mining_fatigue", 40, {
        showParticles: false,
        amplifier: 0
      });
    if (setting_heat_effects)
      player.addEffect("weakness", 40, { showParticles: false, amplifier: 0 });
    if (setting_heat_effects)
      player.addEffect("slowness", 40, { showParticles: false, amplifier: 0 });
  }
  if (progress >= 120 && progress < 180) {
    if (currentSeconds % 7 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 120, { showParticles: false, amplifier: 0 });
    }
    if (setting_heat_effects)
      player.addEffect("mining_fatigue", 40, {
        showParticles: false,
        amplifier: 0
      });
    if (setting_heat_effects)
      player.addEffect("weakness", 40, { showParticles: false, amplifier: 1 });
    if (currentSeconds % 5 === 0 && targetTemperature > TEMPERATURE_LIMIT_POSITIVE) {
      if (setting_heat_damage)
        player.applyDamage(1, { cause: EntityDamageCause12.fireTick });
    }
  }
  if (progress >= 180 && progress < 220) {
    if (currentSeconds % 7 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 120, { showParticles: false, amplifier: 0 });
    }
    if (setting_heat_effects)
      player.addEffect("mining_fatigue", 40, {
        showParticles: false,
        amplifier: 0
      });
    if (setting_heat_effects)
      player.addEffect("weakness", 40, { showParticles: false, amplifier: 1 });
    if (setting_heat_effects)
      player.addEffect("blindness", 60, { showParticles: false, amplifier: 1 });
    if (currentSeconds % 3 === 0 && targetTemperature > TEMPERATURE_LIMIT_POSITIVE) {
      if (setting_heat_damage)
        player.applyDamage(1, { cause: EntityDamageCause12.fireTick });
    }
  }
  if (progress >= 220) {
    if (currentSeconds % 7 === 0) {
      if (setting_heat_effects)
        player.addEffect("nausea", 120, { showParticles: false, amplifier: 0 });
    }
    if (setting_heat_effects)
      player.addEffect("mining_fatigue", 40, {
        showParticles: false,
        amplifier: 0
      });
    if (setting_heat_effects)
      player.addEffect("weakness", 40, { showParticles: false, amplifier: 1 });
    if (setting_heat_effects)
      player.addEffect("blindness", 60, { showParticles: false, amplifier: 1 });
    if (currentSeconds % 2 === 0 && targetTemperature > TEMPERATURE_LIMIT_POSITIVE) {
      if (setting_heat_damage)
        player.applyDamage(2, { cause: EntityDamageCause12.fireTick });
    }
  }
  if (progress > MAX_PROGRESS) {
    player.setDynamicProperty("shapescape_bewe:temperature.overheating", 300);
  }
}
function particleSweat(player) {
  const headLocation = player.getHeadLocation();
  const direction = player.getViewDirection();
  const velocity = player.getVelocity();
  const particleLocation = {
    x: headLocation.x + direction.x * 0.1 + velocity.x * 5,
    y: headLocation.y + 0.1 + direction.y * 0.1 + velocity.y * 5,
    z: headLocation.z + direction.z * 0.1 + velocity.z * 5
  };
  let speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  const molang = new MolangVariableMap18();
  molang.setFloat("variable.size_from_velocity", 1 + speed * 4);
  try {
    player.dimension.spawnParticle(
      "shapescape_bewe:sweat",
      particleLocation,
      molang
    );
  } catch {
  }
}
function particleColdBreath(player) {
  const headLocation = player.getHeadLocation();
  const direction = player.getViewDirection();
  const particleLocation = {
    x: headLocation.x + direction.x * 0.2,
    y: headLocation.y - 0.1 + direction.y * 0.2,
    z: headLocation.z + direction.z * 0.2
  };
  const molang = new MolangVariableMap18();
  molang.setSpeedAndDirection("variable.particle", 0.6, direction);
  try {
    player.dimension.spawnParticle(
      "shapescape_bewe:cold_breath",
      particleLocation,
      molang
    );
  } catch {
  }
  player.playSound("mob.horse.breathe", {
    location: player.location,
    volume: 0.8,
    pitch: 1.3
  });
}
function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function randomTip2(player, temperature, progres) {
  const tipSetting = player.getDynamicProperty(
    `shapescape_bewe:settings.options.chat_warnings`
  ) ?? true;
  if (!tipSetting)
    return;
  let messageNumber = 0;
  if (progres >= 15 && progres < 60) {
    messageNumber = 1;
  } else if (progres >= 60 && progres < 120) {
    messageNumber = 2;
  } else if (progres >= 120 && progres < 300) {
    messageNumber = 3;
  }
  player.removeTag(
    `shapescape_bewe_TEMPERATURE_TIP.${temperature}_${messageNumber + 1}`
  );
  if (messageNumber === 0) {
    return;
  }
  if (player.hasTag(`shapescape_bewe_TEMPERATURE_TIP.${temperature}_${messageNumber}`))
    return;
  player.addTag(`shapescape_bewe_TEMPERATURE_TIP.${temperature}_${messageNumber}`);
  const message = {
    rawtext: [
      {
        translate: `shapescape_bewe.temperature.tip.${temperature}.${messageNumber}`
      }
    ]
  };
  player.sendMessage(message);
  player.playSound(`note.bass`, {
    location: player.location
  });
}
world39.afterEvents.entityDie.subscribe((event) => {
  const player = event.deadEntity;
  if (player.typeId !== "minecraft:player")
    return;
  player.setDynamicProperty("shapescape_bewe:temperature", 0);
  player.setDynamicProperty("shapescape_bewe:temperature_target", 0);
  player.setDynamicProperty("shapescape_bewe:temperature.freezing", 0);
  player.setDynamicProperty("shapescape_bewe:temperature.overheating", 0);
});
system36.runInterval(() => {
  let players = world39.getPlayers();
  for (let player of players) {
    if (system36.currentTick % REFRESH_RATE_UPDATE === 0) {
      updateTemperature(player);
    }
    if (system36.currentTick % REFRESH_RATE_CALCULATION === 0) {
      calculateTemperature(player);
    }
    if (system36.currentTick % EFFECTS_INTERVAL === 0) {
      effects(player);
    }
  }
}, 1);
