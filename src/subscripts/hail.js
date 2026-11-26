import {
  system as system25,
  world as world25,
  BlockVolume as BlockVolume3,
  GameMode as GameMode4,
  WeatherType as WeatherType2,
  TicksPerSecond as TicksPerSecond5
} from "@minecraft/server";
var DEBUG9 = false;
var REFRESH_RATE9 = 3 * TicksPerSecond5;
var HAIL_DURATION = 90 * TicksPerSecond5;
var lastTimeOfDay = 0;
var DIFFICULTY_TABLE = /* @__PURE__ */ new Map([
  [1, 1],
  // Easy == 1 damage per cycle
  [2, 2],
  // Normal == 2 damage per cycle
  [3, 3]
  // Hard == 2 damage per cycle
]);
system25.runInterval(() => {
  if (system25.currentTick % REFRESH_RATE9 !== 0)
    return;
  let players = world25.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  const hailDuration = world25.getDynamicProperty("hail_duration") ?? 0;
  const WEATHER = world25.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  if (hailDuration <= 0 || WEATHER === "thunderstorm")
    return;
  world25.getDimension("minecraft:overworld").setWeather(WeatherType2.Clear, REFRESH_RATE9 * 2);
  if (hailDuration > 0) {
    world25.setDynamicProperty("hail_duration", hailDuration - REFRESH_RATE9);
    if (DEBUG9) {
      world25.sendMessage(`${hailDuration - REFRESH_RATE9}`);
    }
  } else {
    world25.setDynamicProperty("hail_duration", 0);
  }
  for (let player of players) {
    const dimension = player.dimension;
    const location = player.location;
    if (location.y < 40 || dimension.id !== "minecraft:overworld")
      continue;
    const biome = player.getDynamicProperty("shapescape_bewe:environment_detection.biome") ?? "";
    const biomeTagsProperty = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") ?? "[]";
    const biomeTags = JSON.parse(biomeTagsProperty);
    if (biome === "")
      continue;
    if (biomeTags.includes("desert") || biome === "desert" || biomeTags.includes("mesa") || biome === "mesa" || biomeTags.includes("ice") || biome === "ice" || biomeTags.includes("cold") || biome === "cold" || biomeTags.includes("frozen") || biome === "frozen")
      continue;
    const BIOME_TEMPERATURE = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5;
    if (BIOME_TEMPERATURE < 0.15 || BIOME_TEMPERATURE > 1)
      continue;
    const allowedGamemode = player.getGameMode() !== GameMode4.Creative && player.getGameMode() !== GameMode4.Spectator;
    if (allowedGamemode && !hasRoof(location, dimension)) {
      const difficulty2 = player.getDynamicProperty(`shapescape_bewe:settings.options.difficulty`) ?? 0;
      const damage = DIFFICULTY_TABLE.get(difficulty2) ?? 1;
      player.applyDamage(damage);
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
    try {
      player.dimension.spawnParticle("shapescape_bewe:water_circle_hail", player.location);
    } catch {
    }
  }
}, 1);
function hasRoof(location, dimension) {
  if (location.y < 40)
    return true;
  const P1 = {
    x: location.x,
    y: location.y + 1,
    z: location.z
  };
  const P2 = {
    x: location.x,
    y: location.y + 20,
    z: location.z
  };
  const volume = new BlockVolume3(P1, P2);
  const locations = volume.getBlockLocationIterator();
  for (const location2 of locations) {
    let block = void 0;
    try {
      block = dimension.getBlock(location2);
    } catch {
    }
    if (!block?.isAir && !block?.typeId.includes("light_block"))
      return true;
  }
  return false;
}
world25.afterEvents.worldLoad.subscribe(() => {
  if (world25.getDynamicProperty("hail.daily_hail_today") === void 0) {
    generateDailyHailVariables();
  }
});
system25.runInterval(() => {
  checkDailyHail();
  const currentTime = world25.getTimeOfDay();
  if (lastTimeOfDay > currentTime) {
    generateDailyHailVariables();
  }
  lastTimeOfDay = currentTime;
}, 40 + Math.floor(Math.random() * 10));
function generateDailyHailVariables() {
  const hailFrequency = world25.getDynamicProperty(`shapescape_bewe:settings.options.hail`) ?? 50;
  const dailyHailToday = Math.random() < hailFrequency / 100;
  const dailyHailTimeTick = Math.floor(Math.random() * 12e3 + (Math.random() > 0.5 ? 0 : Math.random() * 12e3));
  world25.setDynamicProperty("hail.daily_hail_today", dailyHailToday);
  world25.setDynamicProperty("hail.daily_hail_time", dailyHailTimeTick);
  if (DEBUG9) {
    world25.sendMessage(`${world25.getDynamicProperty("hail.daily_hail_today")}`);
    world25.sendMessage(`${world25.getDynamicProperty("hail.daily_hail_time")}`);
  }
}
function checkDailyHail() {
  if (!world25.getDynamicProperty("hail.daily_hail_today") || !world25.getDimension("minecraft:overworld"))
    return;
  const currentTime = world25.getTimeOfDay();
  const timeDifference = Math.abs(currentTime - world25.getDynamicProperty("hail.daily_hail_time"));
  if (timeDifference < 100) {
    world25.setDynamicProperty("hail.daily_hail_today", false);
    world25.setDynamicProperty("hail_duration", HAIL_DURATION);
  }
}
system25.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:hail" && message === "dev_start") {
    world25.setDynamicProperty("hail_duration", HAIL_DURATION);
    world25.getDimension("minecraft:overworld").setWeather(WeatherType2.Clear, REFRESH_RATE9 * 2);
  }
});
