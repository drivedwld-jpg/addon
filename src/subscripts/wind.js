import {
  system as system55,
  world as world58,
  MolangVariableMap as MolangVariableMap21,
  Player as Player32,
  GameMode as GameMode13
} from "@minecraft/server";
var DEBUG23 = false;
var REFRESH_RATE_UPDATE2 = 1 * 20;
var DIMENSIONS = [
  "minecraft:overworld",
  "minecraft:nether",
  "minecraft:the_end"
];
var applyParticles = true;
var COOLDOWN_WIND_QUIET = "shapescape_bewe_wind_quiet_cooldown";
var COOLDOWN_WIND_LOUD = "shapescape_bewe_wind_loud_cooldown";
var cooldown_tags2 = [COOLDOWN_WIND_QUIET, COOLDOWN_WIND_LOUD];
function easeOutCirc2(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 2));
}
function random_int2(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
world58.afterEvents.playerSpawn.subscribe((event) => {
  clear_cooldowns4(event.player);
});
function clear_cooldowns4(player) {
  for (let tag of cooldown_tags2) {
    player.removeTag(tag);
  }
}
system55.runInterval(() => {
  if (world58.getDynamicProperty(
    "shapescape_bewe:settings.weather.wind_system"
  ) ?? true) {
    const timeOfDay = world58.getTimeOfDay();
    if (timeOfDay >= 0 && timeOfDay <= 100) {
      setWindForce2();
      const windDirection = world58.getDynamicProperty(
        "shapescape_bewe:wind_system.wind_direction.set_in_morning"
      ) ?? { x: 1, y: 0, z: 0 };
      const windForceX = Math.abs(windDirection.x);
      const windForceZ = Math.abs(windDirection.z);
      const windForce = Math.max(windForceX, windForceZ);
      if (windForce > 0.5)
        world58.setDynamicProperty(
          "shapescape_bewe:wind_system.push_entities_this_day",
          true
        );
      else
        world58.setDynamicProperty(
          "shapescape_bewe:wind_system.push_entities_this_day",
          false
        );
    }
    setWindForceForRainInWindlessDay();
    updateWindForceDependingOnWeather();
  }
}, 100);
system55.runInterval(() => {
  if ((world58.getDynamicProperty(
    "shapescape_bewe:wind_system.push_entities_this_day"
  ) ?? false) && (world58.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear") === "clear" && (world58.getDynamicProperty(
    "shapescape_bewe:settings.weather.wind_system"
  ) ?? true)) {
    if (DEBUG23)
      console.warn("Try to push player");
    if (Math.random() > 0.4) {
      if (DEBUG23)
        console.warn("Push player");
      world58.setDynamicProperty("shapescape_bewe:wind_system.push_entities", true);
      let stopPushingEntities = system55.runTimeout(() => {
        world58.setDynamicProperty("shapescape_bewe:wind_system.push_entities", false);
        system55.clearRun(stopPushingEntities);
        if (DEBUG23)
          console.warn("Stop pushing player");
      }, 40 + 20 * Math.random() * 20);
    }
  }
}, 10 + 20 * Math.random() * 10 * 60);
function setWindForce2() {
  const windForce = { x: 0, y: 0, z: 0 };
  const mainForce = Math.random() + 0.01;
  const additionalForce = Math.random() * 0.4 - 0.2;
  const windSource = Math.floor(Math.random() * 4);
  world58.setDynamicProperty("shapescape_bewe:wind_source", windSource);
  switch (windSource) {
    case 0:
      windForce.x = additionalForce;
      windForce.y = 0;
      windForce.z = mainForce;
      if (DEBUG23)
        console.warn("Wind Source - north");
      break;
    case 1:
      windForce.x = additionalForce;
      windForce.y = 0;
      windForce.z = mainForce * -1;
      if (DEBUG23)
        console.warn("Wind Source - south");
      break;
    case 2:
      windForce.x = mainForce;
      windForce.y = 0;
      windForce.z = additionalForce;
      if (DEBUG23)
        console.warn("Wind Source - west");
      break;
    case 3:
      windForce.x = mainForce * -1;
      windForce.y = 0;
      windForce.z = additionalForce;
      if (DEBUG23)
        console.warn("Wind Source - east");
      break;
    default:
      break;
  }
  world58.setDynamicProperty(
    "shapescape_bewe:wind_system.wind_direction.set_in_morning",
    windForce
  );
}
function setWindForceForRainInWindlessDay() {
  const weather2 = world58.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  const weatherStatus = world58.getDynamicProperty(
    "shapescape_bewe:wind_system.weather_previous_status"
  ) ?? "clear";
  if (weather2 === "clear" && weatherStatus !== "clear") {
    world58.setDynamicProperty(
      "shapescape_bewe:wind_system.weather_previous_status",
      "clear"
    );
    if (DEBUG23)
      console.warn("weather changed to clear");
    world58.setDynamicProperty("shapescape_bewe:wind_system.push_entities", false);
  } else if ((weather2 === "rain" || weather2 === "thunderstorm") && weatherStatus !== "notClear") {
    world58.setDynamicProperty(
      "shapescape_bewe:wind_system.weather_previous_status",
      "notClear"
    );
    world58.setDynamicProperty("shapescape_bewe:wind_system.push_entities", true);
    if (DEBUG23)
      console.warn("weather changed to rain");
  }
}
function updateWindForceDependingOnWeather() {
  const newTargetWindForce = world58.getDynamicProperty(
    "shapescape_bewe:wind_system.wind_direction.set_in_morning"
  ) ?? { x: 1, y: 0, z: 0 };
  const weather2 = world58.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  if (weather2 === "rain") {
    newTargetWindForce.x *= 1.5 / 1 /* weatherRain */;
    newTargetWindForce.z *= 1.5 / 1 /* weatherRain */;
  } else if (weather2 === "thunderstorm") {
    newTargetWindForce.x *= 2 / 1 /* weatherThunder */;
    newTargetWindForce.z *= 2 / 1 /* weatherThunder */;
  }
  world58.setDynamicProperty(
    "shapescape_bewe:wind_system.wind_direction.target",
    newTargetWindForce
  );
}
system55.runInterval(() => {
  if (world58.getDynamicProperty(
    "shapescape_bewe:settings.weather.wind_system"
  ) ?? true) {
    const currentWindForce = world58.getDynamicProperty(
      "shapescape_bewe:wind_direction"
    ) ?? { x: 1, y: 0, z: 0 };
    const targetWindForce = world58.getDynamicProperty(
      "shapescape_bewe:wind_system.wind_direction.target"
    ) ?? {
      x: 1,
      y: 0,
      z: 0
    };
    if (currentWindForce != targetWindForce)
      easingWindForceChange(currentWindForce, targetWindForce);
  }
}, 20);
function easingWindForceChange(currentWindForce, targetWindForce) {
  const differenceX = Math.abs(targetWindForce.x - currentWindForce.x);
  const differenceZ = Math.abs(targetWindForce.z - currentWindForce.z);
  const interpolationFactorX = Math.min(1e-4 + differenceX * 1e-4, 0.05) * REFRESH_RATE_UPDATE2;
  const interpolationFactorZ = Math.min(1e-4 + differenceZ * 1e-4, 0.05) * REFRESH_RATE_UPDATE2;
  const easedWindForceX = easeOutCirc2(interpolationFactorX);
  const easedWindForceZ = easeOutCirc2(interpolationFactorZ);
  const newWindForce = {
    x: currentWindForce.x + (targetWindForce.x - currentWindForce.x) * easedWindForceX,
    y: 0,
    z: currentWindForce.z + (targetWindForce.z - currentWindForce.z) * easedWindForceZ
  };
  world58.setDynamicProperty("shapescape_bewe:wind_direction", newWindForce);
  if (DEBUG23) {
    const display_currentWindForceX = Math.round(newWindForce.x * 100) / 100;
    const display_targetWindForceX = Math.round(targetWindForce.x * 100) / 100;
    const display_currentWindForceZ = Math.round(newWindForce.z * 100) / 100;
    const display_targetWindForceZ = Math.round(targetWindForce.z * 100) / 100;
    const message = `\xA7bwindForce: \xA7f${display_currentWindForceX}, \xA7f${display_currentWindForceZ} \xA76| \xA7bTarget windForce: \xA7f${display_targetWindForceX}, \xA7f${display_targetWindForceZ}`;
    let players = world58.getPlayers();
    for (let player of players) {
      player.onScreenDisplay.setActionBar({ text: message });
    }
  }
}
system55.runInterval(() => {
  if (world58.getDynamicProperty(
    "shapescape_bewe:settings.weather.wind_system"
  ) ?? true) {
    const entities_player = [];
    const entities_mob = [];
    const entities_monster = [];
    for (const dimensionID of DIMENSIONS) {
      const dimension = world58.getDimension(dimensionID);
      entities_player.push(...dimension.getEntities({ families: ["player"] }));
      entities_mob.push(...dimension.getEntities({ families: ["mob"] }));
      entities_monster.push(
        ...dimension.getEntities({ families: ["monster"] })
      );
    }
    let entities = entities_player.concat(entities_mob).concat(entities_monster);
    const enderstorm = world58.getDynamicProperty("enderstorm") ?? false;
    const netherstorm = world58.getDynamicProperty("netherstorm") ?? false;
    for (let entity of entities) {
      const dimensionID = entity.dimension.id;
      const windDirection = calculatingWindForce(entity);
      if (dimensionID === "minecraft:overworld" && (Math.round(windDirection.x * 100) / 100 != 0 || Math.round(windDirection.z * 100) / 100 != 0) && (world58.getDynamicProperty(
        "shapescape_bewe:wind_system.push_entities"
      ) ?? false)) {
        if (entity instanceof Player32) {
          const allowedGamemode = entity.getGameMode() !== GameMode13.Creative && entity.getGameMode() !== GameMode13.Spectator;
          if (!allowedGamemode)
            continue;
        }
        if (entity instanceof Player32 && entity.isGliding)
          continue;
        applyWindImpulse(entity, windDirection);
        if (entity.typeId === "minecraft:player")
          windLoudSounds(entity);
      } else if (dimensionID === "minecraft:the_end" && enderstorm) {
        applyWindImpulse(entity, windDirection);
        if (entity.typeId === "minecraft:player")
          windLoudSounds(entity);
      } else if (dimensionID === "minecraft:nether" && netherstorm) {
        applyWindImpulse(entity, windDirection);
        if (entity.typeId === "minecraft:player")
          windLoudSounds(entity);
      }
    }
  }
}, 1);
system55.runInterval(() => {
  if (world58.getDynamicProperty(
    "shapescape_bewe:settings.weather.wind_system"
  ) ?? true) {
    let players = world58.getPlayers();
    for (let player of players) {
      try {
        if (applyParticles)
          windParticles(player);
        const weather2 = world58.getDynamicProperty(
          "shapescape_bewe:environment_detection.weather"
        ) ?? "clear";
        if (weather2 !== "clear") {
          system55.runTimeout(() => {
            if (applyParticles)
              windParticles(player);
          }, 40);
        }
      } catch {
        continue;
      }
    }
  }
}, 100 + Math.random() * 50);
system55.runInterval(() => {
  let players = world58.getPlayers();
  for (let player of players) {
    try {
      if (player.location.y > 50 && player.location.y < 200) {
        windQuietSounds(player);
      }
    } catch {
      continue;
    }
  }
}, 15 + Math.min(Math.random() * 50, 30));
function calculatingWindForce(entity) {
  let player;
  if (entity?.typeId === "minecraft:player")
    player = entity;
  const windDirection = world58.getDynamicProperty(
    "shapescape_bewe:wind_direction"
  ) ?? { x: 1, y: 0, z: 0 };
  if (player)
    windForceInfluenceSneaking();
  windForceInfluenceAir();
  windForceInfluenceArmor();
  windForceInfluenceWall();
  if (player)
    windForceInfluenceShelter();
  windForceInfluenceMovement();
  if (player)
    windForceInfluenceGamemode();
  function windForceInfluenceSneaking() {
    if (player.isSneaking) {
      windDirection.x *= 0.2 * 1 /* sneaking */;
      windDirection.z *= 0.2 * 1 /* sneaking */;
    }
  }
  function windForceInfluenceAir() {
    if (!entity.isOnGround) {
      windDirection.x *= 2 * 1 /* inAir */;
      windDirection.z *= 2 * 1 /* inAir */;
    }
  }
  function windForceInfluenceArmor() {
    let armorWeightMax = world58.getDynamicProperty("shapescape_bewe:max_armorWeight") ?? 100;
    armorWeightMax = armorWeightMax * 1 /* armorWeight */;
    let armorWeight = entity.getDynamicProperty("shapescape_bewe:armorWeight") ?? 0;
    armorWeight = armorWeight * 1 /* armorWeight */;
    let armorImpact = 1 - armorWeight / (armorWeightMax * 2 + 1);
    windDirection.x *= armorImpact;
    windDirection.z *= armorImpact;
  }
  function windForceInfluenceWall() {
    let wall = entity.getDynamicProperty("shapescape_bewe:detected_walls") ?? 0;
    if (wall > 0) {
      windDirection.x = 0;
      windDirection.z = 0;
    }
  }
  function windForceInfluenceShelter() {
    applyParticles = true;
    let shelterDetection = player.getDynamicProperty("shapescape_bewe:temperature.shelter") ?? 0;
    if (shelterDetection >= 4) {
      windDirection.x = 0;
      windDirection.z = 0;
      applyParticles = false;
    }
  }
  function windForceInfluenceMovement() {
    const windSource = world58.getDynamicProperty("shapescape_bewe:wind_source") ?? 2;
    const velocity = entity.getVelocity();
    switch (windSource) {
      case 0:
        if (velocity.z > 0)
          windDirection.z *= 5 * 1 /* movingDirection */;
        break;
      case 1:
        if (velocity.z < 0)
          windDirection.z *= 5 * 1 /* movingDirection */;
        break;
      case 2:
        if (velocity.x > 0)
          windDirection.x *= 5 * 1 /* movingDirection */;
        break;
      case 3:
        if (velocity.x < 0)
          windDirection.x *= 5 * 1 /* movingDirection */;
        break;
      default:
        break;
    }
  }
  function windForceInfluenceGamemode() {
    if (player.getGameMode() === "creative" || player.getGameMode() === "spectator") {
      windDirection.x = 0;
      windDirection.z = 0;
    }
  }
  return windDirection;
}
function applyWindImpulse(entity, vector) {
  const { x, y, z } = vector;
  const previousVelocity = entity.getVelocity();
  const horizontalNorm = Math.sqrt(x * x + z * z);
  let directionX = 0;
  let directionZ = 0;
  if (horizontalNorm !== 0) {
    directionX = x / horizontalNorm;
    directionZ = z / horizontalNorm;
  }
  const isMovingWithWind = (velocity, direction, threshold) => {
    return direction !== 0 && (direction > 0 && velocity > threshold || direction < 0 && velocity < threshold);
  };
  if (isMovingWithWind(previousVelocity.x, directionX, directionX / 40)) {
    return;
  }
  if (isMovingWithWind(previousVelocity.z, directionZ, directionZ / 40)) {
    return;
  }
  const verticalStrength = y + previousVelocity.y * 0.75;
  entity.applyKnockback(
    { x: directionX / 50, z: directionZ / 50 },
    verticalStrength
  );
}
function windParticles(player) {
  try {
    let location = player.location;
  } catch {
    return;
  }
  const windDirection = world58.getDynamicProperty(
    "shapescape_bewe:wind_direction"
  ) ?? { x: 1, y: 0, z: 0 };
  const windParticleForce = new MolangVariableMap21();
  const playerLocation = player.getHeadLocation();
  const windDirectionX = windDirection.x * 100 + (Math.random() - 0.5) * 2;
  const windDirectionY = (Math.random() - 0.5) * 2;
  const windDirectionZ = windDirection.z * 100 + (Math.random() - 0.5) * 2;
  const windSpeedX = Math.abs(windDirection.x);
  const windSpeedZ = Math.abs(windDirection.z);
  const windSpeed = Math.max(windSpeedX, windSpeedZ) * 7;
  windParticleForce.setSpeedAndDirection("variable.wind_direction", windSpeed, {
    x: windDirectionX,
    y: windDirectionY,
    z: windDirectionZ
  });
  try {
    player.dimension.spawnParticle(
      "shapescape_bewe:wind",
      playerLocation,
      windParticleForce
    );
  } catch {
  }
}
function windQuietSounds(player) {
  if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.wind") ?? true) === false)
    return;
  if (!player.hasTag(COOLDOWN_WIND_QUIET)) {
    player.addTag(COOLDOWN_WIND_QUIET);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int2(2, 4),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int2(2, 4)
    };
    let volume = 4;
    let pitch = 1.05 - random_int2(1, 10) * 0.01;
    player.playSound("shapescape_bewe.wind_quiet", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int2(1, 2) + Math.random();
    system55.runTimeout(() => {
      if (!player.isValid)
        return;
      player.removeTag(COOLDOWN_WIND_QUIET);
    }, COOLDOWN3 * 20);
  }
}
function windLoudSounds(player) {
  if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.wind") ?? true) === false)
    return;
  if (!player.hasTag(COOLDOWN_WIND_LOUD)) {
    player.addTag(COOLDOWN_WIND_LOUD);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int2(2, 4),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int2(2, 4)
    };
    let volume = 4;
    let pitch = 1.05 - random_int2(0, 5) * 0.01;
    player.playSound("shapescape_bewe.wind_loud", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int2(6, 9);
    system55.runTimeout(() => {
      if (!player.isValid)
        return;
      player.removeTag(COOLDOWN_WIND_LOUD);
    }, COOLDOWN3 * 20);
  }
}
