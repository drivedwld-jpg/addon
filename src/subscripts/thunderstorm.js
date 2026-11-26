import {
  system as system49,
  world as world52,
  MolangVariableMap as MolangVariableMap19,
  BlockVolume as BlockVolume10,
  EntityComponentTypes as EntityComponentTypes14,
  EntityDamageCause as EntityDamageCause13,
  GameMode as GameMode11,
  WeatherType as WeatherType5,
  TicksPerSecond as TicksPerSecond10
} from "@minecraft/server";
var REFRESH_RATE18 = 1 * 73;
var CHANCE_PER_REFRESH_RATE = 0.5;
var STORM_DURATION = 90 * TicksPerSecond10;
var globalTornadoSpawn = false;
var lastTimeOfDay2 = 0;
system49.runInterval(() => {
  if (system49.currentTick % REFRESH_RATE18 !== 0 || Math.random() > CHANCE_PER_REFRESH_RATE)
    return;
  let players = world52.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const WEATHER = world52.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  const previousWeather = world52.getDynamicProperty("thunderstorm.previous_weather") ?? "clear";
  if (WEATHER !== "thunderstorm") {
    world52.setDynamicProperty("thunderstorm.previous_weather", WEATHER);
    return;
  }
  if (previousWeather !== WEATHER) {
    globalTornadoSpawn = Math.random() < 0.5 ? true : false;
    world52.setDynamicProperty("thunderstorm.previous_weather", WEATHER);
  }
  for (let player of players) {
    const allowedGamemode = player.getGameMode() !== GameMode11.Creative && player.getGameMode() !== GameMode11.Spectator;
    if (!allowedGamemode)
      continue;
    const dimension = player.dimension;
    const location = player.location;
    if (location.y < 40 || dimension.id !== "minecraft:overworld")
      continue;
    const biome = player.getDynamicProperty("shapescape_bewe:environment_detection.biome") ?? "";
    const biomeTagsProperty = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") ?? "[]";
    const biomeTags = JSON.parse(biomeTagsProperty);
    if (biome === "")
      continue;
    if (biomeTags.includes("desert") || biome === "desert" || biomeTags.includes("mesa") || biome === "mesa")
      continue;
    const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
    if (BIOME_TEMPERATURE < 0.15)
      continue;
    if (globalTornadoSpawn) {
      let spawnTornado = true;
      for (const tag of player.getTags()) {
        if (!tag.includes(`shapescape_bewe_TORNADO_`))
          continue;
        spawnTornado = false;
      }
      if (spawnTornado) {
        const tornado = dimension.spawnEntity("shapescape_bewe:tornado", player.location);
        player.setPropertyOverrideForEntity(tornado, "shapescape_bewe:visible", true);
        player.addTag(`shapescape_bewe_TORNADO_${tornado.id}`);
      }
    }
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
    if (Math.random() < 0.3) {
      distantEffect(player);
    } else {
      nearbyEffect(player);
    }
  }
}, 1);
function distantEffect(player, index) {
  if (index && index > 10)
    return;
  index = index === void 0 ? 0 : ++index;
  const dimension = player.dimension;
  const location = player.location;
  let xModified = 1;
  let zModified = 1;
  if (Math.random() < 0.5) {
    xModified = Math.random();
  } else {
    zModified = Math.random();
  }
  const xNegPos = Math.random() > 0.5 ? -1 : 1;
  const zNegPos = Math.random() > 0.5 ? -1 : 1;
  const offset = {
    x: xModified * xNegPos * 50 + xNegPos * Math.random() * 50,
    y: 0,
    z: zModified * zNegPos * 50 + zNegPos * Math.random() * 50
  };
  const particleLocation = {
    x: location.x + offset.x,
    // between 100 and 200 blocks away (negative or positive)
    y: 40,
    // Sea level, lowest it can get, so it makes sure lightning always touches the ground
    z: location.z + offset.z
    // between 100 and 200 blocks away (negative or positive)
  };
  try {
    const block = dimension.getBlock(particleLocation);
    if (block) {
      const nearbyPlayers = dimension.getEntities({
        location,
        maxDistance: 32,
        type: "minecraft:player"
      });
      if (nearbyPlayers.length > 0) {
        distantEffect(player, index);
        return;
      }
    }
  } catch {
  }
  const molangVarMap = new MolangVariableMap19();
  molangVarMap.setVector3("position", offset);
  dimension.spawnParticle("shapescape_bewe:lightning_bolt", { x: location.x, y: 40, z: location.z }, molangVarMap);
  const pitch = Math.random() * 0.2 + 0.9;
  dimension.playSound(`shapescape_bewe.thunderstorm.thunder_distant`, location, {
    volume: 5,
    pitch
  });
}
function nearbyEffect(player, index) {
  if (index && index > 10)
    return;
  index = index === void 0 ? 0 : ++index;
  const dimension = player.dimension;
  const location = player.location;
  const P1 = { x: location.x - 6, y: 200, z: location.z - 6 };
  const P2 = { x: location.x + 6, y: 200, z: location.z + 6 };
  const volume = new BlockVolume10(P1, P2);
  const locations = Array.from(volume.getBlockLocationIterator());
  const randomIndex = Math.floor(Math.random() * locations.length);
  const randomLocation = locations[randomIndex];
  let heightMap = 0;
  for (let index2 = 0; index2 < 200; index2++) {
    try {
      const blockToCheck = dimension.getBlock(randomLocation)?.below(index2);
      if (blockToCheck && !blockToCheck.isAir && !blockToCheck.typeId.includes("minecraft:light_block")) {
        if (!checkClearSpaceAbove(dimension, blockToCheck.location))
          break;
        heightMap = blockToCheck.location.y + 1;
        break;
      }
    } catch {
      continue;
    }
  }
  const strikeLocation = {
    x: randomLocation.x,
    y: heightMap,
    z: randomLocation.z
  };
  const entities = dimension.getEntities({
    location: strikeLocation,
    maxDistance: 3
  });
  for (const entity of entities) {
    const familyTypes = entity.getComponent(EntityComponentTypes14.TypeFamily)?.getTypeFamilies();
    if (!familyTypes || !entity.typeId.includes("minecraft:"))
      continue;
    else if (familyTypes.includes("pig") && familyTypes.includes("mob")) {
      entity.triggerEvent(`become_zombie`);
    } else if (familyTypes.includes("mushroomcow") && familyTypes.includes("mob")) {
      const variant = entity.getComponent(EntityComponentTypes14.Variant)?.value;
      if (variant === void 0)
        continue;
      if (variant === 0) {
        entity.triggerEvent(`minecraft:become_brown`);
      } else if (variant === 1) {
        entity.triggerEvent(`minecraft:become_red`);
      }
    } else if (familyTypes.includes("creeper") && familyTypes.includes("monster") && familyTypes.includes("mob")) {
      entity.triggerEvent(`minecraft:become_charged`);
    } else if (familyTypes.includes("villager") && familyTypes.includes("mob")) {
      entity.triggerEvent(`become_witch`);
    } else {
      entity.applyDamage(10, {
        cause: EntityDamageCause13.lightning
      });
    }
  }
  const molangVarMap = new MolangVariableMap19();
  molangVarMap.setVector3("position", { x: 0, y: 0, z: 0 });
  dimension.spawnParticle("shapescape_bewe:lightning_bolt", strikeLocation, molangVarMap);
  const pitch = Math.random() * 0.2 + 0.9;
  dimension.playSound(`shapescape_bewe.thunderstorm.thunder_nearby`, strikeLocation, {
    volume: 3,
    pitch
  });
}
function checkClearSpaceAbove(dimension, location, height = 40) {
  for (let y = 1; y <= height; y++) {
    try {
      const blockAbove = dimension.getBlock({
        x: location.x,
        y: location.y + y,
        z: location.z
      });
      if (blockAbove && !blockAbove.isAir && !blockAbove.typeId.includes("minecraft:light_block")) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}
system49.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:tornado" && message === "teleport") {
    const player = entity.dimension.getEntities({
      tags: [`shapescape_bewe_TORNADO_${entity.id}`]
    })[0];
    if (player && player.isValid) {
      entity.teleport(player.location);
    } else {
      const isChested = entity.getComponent(EntityComponentTypes14.IsChested);
      if (!isChested)
        entity.triggerEvent(`shapescape_bewe:start_despawn`);
    }
  }
  if (entity && messageID === "shapescape_bewe:tornado" && message === "despawn") {
    const players = entity.dimension.getEntities({
      tags: [`shapescape_bewe_TORNADO_${entity.id}`]
    });
    for (const player of players) {
      player.removeTag(`shapescape_bewe_TORNADO_${entity.id}`);
    }
  }
});
world52.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  for (const tag of player.getTags()) {
    if (tag.includes("shapescape_bewe_TORNADO_")) {
      const tornadoID = tag.replace("shapescape_bewe_TORNADO_", "");
      const tornado = world52.getEntity(tornadoID);
      if (tornado && tornado.isValid) {
        tornado.teleport(player.location);
      } else {
        player.removeTag(tag);
      }
    }
  }
});
world52.afterEvents.worldLoad.subscribe(() => {
  if (world52.getDynamicProperty("thunderstorm.daily_storm_today") === void 0) {
    generateDailyStormVariables();
  }
});
system49.runInterval(() => {
  checkDailyStorm();
  const currentTime = world52.getTimeOfDay();
  if (lastTimeOfDay2 > currentTime) {
    generateDailyStormVariables();
  }
  lastTimeOfDay2 = currentTime;
}, 40 + Math.floor(Math.random() * 10));
function generateDailyStormVariables() {
  const stormsFrequency = world52.getDynamicProperty(`shapescape_bewe:settings.options.storms`) ?? 50;
  const dailyStormToday = Math.random() < stormsFrequency / 100;
  const dailyStormTimeTick = Math.floor(Math.random() * 12e3 + (Math.random() > 0.5 ? 0 : Math.random() * 12e3));
  world52.setDynamicProperty("thunderstorm.daily_storm_today", dailyStormToday);
  world52.setDynamicProperty("thunderstorm.daily_storm_time", dailyStormTimeTick);
}
function checkDailyStorm() {
  if (!world52.getDynamicProperty("thunderstorm.daily_storm_today") || !world52.getDimension("minecraft:overworld"))
    return;
  const currentTime = world52.getTimeOfDay();
  const timeDifference = Math.abs(currentTime - world52.getDynamicProperty("thunderstorm.daily_storm_time"));
  if (timeDifference < 100) {
    world52.setDynamicProperty("thunderstorm.daily_storm_today", false);
    triggerDailyStorm();
  }
}
function triggerDailyStorm() {
  world52.setDynamicProperty("thunderstorm.previous_weather", "thunderstorm");
  world52.getDimension("minecraft:overworld").runCommand(`weather thunder ${STORM_DURATION}`);
}
world52.beforeEvents.weatherChange.subscribe((event) => {
  if (event.newWeather === WeatherType5.Thunder) {
    const stormsFrequency = world52.getDynamicProperty(`shapescape_bewe:settings.options.storms`) ?? 50;
    if (stormsFrequency === 0)
      event.cancel = true;
  }
});
