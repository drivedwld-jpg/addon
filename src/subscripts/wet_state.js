import {
  BlockVolume as BlockVolume11,
  EntityComponentTypes as EntityComponentTypes16,
  MolangVariableMap as MolangVariableMap20,
  system as system53,
  TicksPerSecond as TicksPerSecond11,
  WeatherType as WeatherType6,
  world as world56
} from "@minecraft/server";
var DEBUG21 = false;
var DATA4 = { "getting_wet": { "in_rain": 20, "in_snowfall": 40, "in_water": 0 }, "getting_dry": { "temperate_biome": 60, "warm_biome": 5, "next_to_campfire": 15, "next_to_fire": 15, "next_to_lava": 5, "in_lava": 0, "on_fire": 0 }, "radius": 5, "effects_threshold": 0.5 };
var THRESHOLD3 = DATA4.effects_threshold;
var MAX_STATE3 = 1;
var INTERVAL5 = 1 * TicksPerSecond11;
var TAG5 = "shapescape_bewe_WET_STATE";
system53.runInterval(() => {
  const players = world56.getAllPlayers();
  for (const player of players) {
    checkWetState(player);
  }
}, INTERVAL5);
world56.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    updateWetState(event.player, 0, true);
  }
});
function checkWetState(player) {
  const setting = player.getDynamicProperty(`shapescape_bewe:settings.states.wet_state`) ?? true;
  if (!setting) {
    updateWetState(player, 0, true);
    return;
  }
  const biomeTemperature = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5 /* TEMPERATE */;
  const currentWeather = world56.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  const currentWetState = player.getDynamicProperty("wet_state") ?? 0;
  if (currentWetState > THRESHOLD3 * MAX_STATE3) {
    if (!player.hasTag(TAG5)) {
      player.sendMessage({ translate: `shapescape_bewe.wet_state.tip` });
      player.playSound(`note.bass`, { location: player.location });
      player.addTag(TAG5);
    }
    particlesWet(player);
  }
  if (player.isInWater) {
    updateWetState(player, DATA4.getting_wet.in_water);
    return;
  }
  if (currentWeather.toUpperCase() === WeatherType6.Rain.toUpperCase() && biomeTemperature > 0.15 /* COLD */ && !hasRoof3(player.location, player.dimension)) {
    updateWetState(player, DATA4.getting_wet.in_rain);
  }
  if (currentWeather.toUpperCase() === WeatherType6.Rain.toUpperCase() && biomeTemperature <= 0.15 /* COLD */ && !hasRoof3(player.location, player.dimension)) {
    updateWetState(player, DATA4.getting_wet.in_snowfall);
  }
  let block = void 0;
  try {
    block = player.dimension.getBlock(player.location);
  } catch {
  }
  if (block && block.typeId.includes("minecraft:") && block.typeId.includes("lava")) {
    updateWetState(player, DATA4.getting_dry.in_lava, true);
    return;
  }
  if (player.getComponent(EntityComponentTypes16.OnFire) !== void 0) {
    updateWetState(player, DATA4.getting_dry.on_fire, true);
    return;
  }
  if (biomeTemperature > 0.15 /* COLD */ && biomeTemperature < 1 /* WARM */) {
    updateWetState(player, DATA4.getting_dry.temperate_biome, true);
  }
  if (biomeTemperature >= 1 /* WARM */) {
    updateWetState(player, DATA4.getting_dry.warm_biome, true);
  }
  const P1 = {
    x: player.location.x - DATA4.radius / 2,
    y: player.location.y - DATA4.radius / 2,
    z: player.location.z - DATA4.radius / 2
  };
  const P2 = {
    x: player.location.x + DATA4.radius / 2,
    y: player.location.y + DATA4.radius / 2,
    z: player.location.z + DATA4.radius / 2
  };
  const volume = new BlockVolume11(P1, P2);
  const locations = volume.getBlockLocationIterator();
  for (const location of locations) {
    let block2 = void 0;
    try {
      block2 = player.dimension.getBlock(location);
    } catch {
    }
    if (block2?.typeId === "minecraft:soul_fire") {
      updateWetState(player, DATA4.getting_dry.next_to_fire, true);
      return;
    } else if (block2?.typeId === "minecraft:campfire") {
      updateWetState(player, DATA4.getting_dry.next_to_campfire, true);
      return;
    } else if (block2?.typeId === "minecraft:fire") {
      updateWetState(player, DATA4.getting_dry.next_to_fire, true);
      return;
    } else if (block2?.typeId === "minecraft:soul_campfire") {
      updateWetState(player, DATA4.getting_dry.next_to_campfire, true);
      return;
    } else if (block2?.typeId === "minecraft:lava") {
      updateWetState(player, DATA4.getting_dry.next_to_lava, true);
      return;
    }
  }
}
function updateWetState(player, time, drying = false) {
  const currentWetState = player.getDynamicProperty("wet_state") ?? 0;
  const step = MAX_STATE3 / (time === 0 ? 1 * (INTERVAL5 / TicksPerSecond11) : time) * (INTERVAL5 / TicksPerSecond11) * (drying ? -1 : 1);
  let newWetState = Number((currentWetState + step).toPrecision(5));
  if (newWetState >= MAX_STATE3) {
    newWetState = MAX_STATE3;
  } else if (newWetState <= 0) {
    newWetState = 0;
  }
  if (DEBUG21) {
    world56.sendMessage(`wet state: ` + JSON.stringify(newWetState));
  }
  player.setDynamicProperty("wet_state", newWetState);
}
function particlesWet(player) {
  const locator = player.location;
  const direction = player.getViewDirection();
  const velocity = player.getVelocity();
  const particleLocation = {
    x: locator.x + direction.x * 0.1 + velocity.x * 5,
    y: locator.y + 0.1 + direction.y * 0.1 + velocity.y * 5,
    z: locator.z + direction.z * 0.1 + velocity.z * 5
  };
  let speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  const molang = new MolangVariableMap20();
  molang.setFloat("variable.size_from_velocity", 1 + speed * 4);
  try {
    player.dimension.spawnParticle("shapescape_bewe:wet", particleLocation, molang);
  } catch {
  }
}
world56.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, player, itemStack } = event;
  const blockAbove = block.above(1);
  if (blockAbove === void 0)
    return;
  const currentWeather = world56.getDynamicProperty("shapescape_bewe:environment_detection.weather");
  if (itemStack?.typeId === "minecraft:flint_and_steel" || itemStack?.typeId === "minecraft:fire_charge") {
    const currentWetState = player.getDynamicProperty("wet_state") ?? 0;
    if (currentWetState >= THRESHOLD3 * MAX_STATE3 || currentWeather.toUpperCase() === WeatherType6.Rain.toUpperCase() && !hasRoof3(blockAbove.location, block.dimension)) {
      system53.run(() => {
        player.playSound(`random.fizz`, {
          location: player.location,
          volume: 1,
          pitch: 2.15
        });
      });
      event.cancel = true;
    }
  }
});
function hasRoof3(location, dimension) {
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
  const volume = new BlockVolume11(P1, P2);
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
