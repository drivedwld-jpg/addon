import { system as system47, world as world50 } from "@minecraft/server";
var DEBUG20 = false;
world50.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity.typeId === "shapescape_bewe:thermometer_block") {
    if (!entity.isValid)
      return;
    entity.runCommand("setblock ~ ~ ~ trapped_chest");
  }
});
system47.runInterval(() => {
  const entities = world50.getDimension("overworld").getEntities({ families: ["shapescape_bewe_thermometer_block"] });
  for (let entity of entities) {
    let block = entity.dimension.getBlock(entity.location);
    const nearbyPlayers = entity.dimension.getPlayers({
      location: entity.location,
      maxDistance: 32
    });
    if (nearbyPlayers.length === 0)
      continue;
    if (!block || block.typeId !== "minecraft:trapped_chest") {
      if (!entity.isValid)
        continue;
      entity.runCommand(
        '/loot spawn ~~~ loot "shapescape/bewe/thermometer_block.loot"'
      );
      entity.remove();
      continue;
    }
    let block_below = block?.below(1);
    if (!block_below || block_below.typeId !== "minecraft:iron_block") {
      iron_block_warn(entity);
      continue;
    }
  }
}, 10);
function iron_block_warn(thermometer_block) {
  const nearest_players = thermometer_block.dimension.getPlayers({
    location: thermometer_block.location,
    closest: 1
  });
  if (!nearest_players)
    return;
  const nearest_player = nearest_players[0];
  if (!nearest_player)
    return;
  nearest_player.sendMessage({
    rawtext: [{ translate: `shapescape_bewe.temperature_block.missing_iron_block` }]
  });
  thermometer_block.runCommand(
    '/loot spawn ~~~ loot "shapescape/bewe/thermometer_block.loot"'
  );
  thermometer_block.runCommand(
    "/fill ~~~ ~~~ air [] replace minecraft:trapped_chest"
  );
  thermometer_block.remove();
}
system47.runInterval(() => {
  const entities = world50.getDimension("overworld").getEntities({ families: ["shapescape_bewe_thermometer_block"] });
  for (let entity of entities) {
    let temperature = calculate_temperature(entity);
    let temperature_int = temperature_to_int(temperature);
    if (!entity)
      continue;
    entity.runCommand(`event entity @s temperature_${temperature_int}`);
    let old_temperature_int = entity.getDynamicProperty("shapescape_bewe:thermometer_block.temperature") ?? 0;
    if (temperature_int != old_temperature_int) {
      entity.setDynamicProperty(
        "shapescape_bewe:thermometer_block.temperature",
        temperature_int
      );
      update_redstone(entity, temperature_int);
    }
    if (DEBUG20)
      console.warn(entity.id, temperature, temperature_int);
  }
}, 100);
function temperature_to_int(temperature) {
  let celsius = calculateCelsius(temperature);
  if (celsius > 60)
    return 6;
  if (celsius > 40)
    return 5;
  if (celsius > 27)
    return 4;
  if (celsius >= 15)
    return 3;
  if (celsius < -18)
    return 0;
  if (celsius < -5)
    return 1;
  if (celsius < 15)
    return 2;
}
function calculate_temperature(thermometer_block) {
  const nearest_players = thermometer_block.dimension.getPlayers({
    location: thermometer_block.location,
    closest: 1
  });
  if (!nearest_players)
    return;
  const nearest_player = nearest_players[0];
  if (!nearest_player)
    return;
  let dimensionTemperature = 0;
  if (nearest_player.dimension.id === "minecraft:nether") {
    dimensionTemperature = 0.4;
  } else if (nearest_player.dimension.id === "minecraft:the_end") {
    dimensionTemperature = -1.1;
  }
  let biomeTemperature = nearest_player.getDynamicProperty(
    "shapescape_bewe:environment_detection.biome_temperature"
  ) ?? 0;
  biomeTemperature = biomeTemperature * 2 - 1;
  biomeTemperature = biomeTemperature * 0.85;
  if (biomeTemperature > 0.8) {
    biomeTemperature = 0.7;
  }
  let blocksTemperatureHeat = thermometer_block.getDynamicProperty(
    "shapescape_bewe:temperature.blocks.heat"
  ) ?? 0;
  let blocksTemperatureCold = thermometer_block.getDynamicProperty(
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
  blocksTemperature = clamp2(blocksTemperature, -0.3, 0.3);
  const heaterBlock = thermometer_block.getDynamicProperty(
    "shapescape_bewe:temperature.heaterBlock"
  ) ?? 0;
  if (heaterBlock > 1) {
    blocksTemperature += 0.5;
  }
  const coolerBlock = thermometer_block.getDynamicProperty(
    "shapescape_bewe:temperature.coolerBlock"
  ) ?? 0;
  if (coolerBlock > 1) {
    blocksTemperature -= 0.5;
  }
  let shelterTemperature = thermometer_block.getDynamicProperty(
    "shapescape_bewe:temperature.shelter"
  ) ?? 0;
  if (shelterTemperature >= 3) {
    shelterTemperature = shelterTemperature * 0.03;
    if (biomeTemperature > 0.3) {
      shelterTemperature = -shelterTemperature;
    }
  } else
    shelterTemperature = 0;
  let timeOfDayTemperature = world50.getDynamicProperty(
    "shapescape_bewe:temperature.time_of_day"
  ) ?? 0;
  if (thermometer_block.dimension.id === "minecraft:overworld") {
    timeOfDayTemperature = timeOfDayTemperature * 0.01;
    timeOfDayTemperature = timeOfDayTemperature * 0.5;
    if (shelterTemperature > 0) {
      timeOfDayTemperature = timeOfDayTemperature * 0.3;
    }
  } else
    timeOfDayTemperature = 0;
  let isInWaterTemperature = 0;
  if (thermometer_block.isInWater) {
    if (biomeTemperature > 0) {
      isInWaterTemperature = -0.1;
    } else {
      isInWaterTemperature = -0.2;
    }
  }
  let altitudeTemperature = 0;
  let altitude = thermometer_block.location.y;
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
  const WEATHER = world50.getDynamicProperty(
    "shapescape_bewe:environment_detection.weather"
  ) ?? "clear";
  let weatherTemperature = 0;
  if (thermometer_block.dimension.id === "minecraft:overworld") {
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
  let temperature = biomeTemperature + blocksTemperature + shelterTemperature + timeOfDayTemperature + weatherTemperature + altitudeTemperature + isInWaterTemperature + dimensionTemperature;
  return temperature;
}
function clamp2(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function update_redstone(entity, temperature) {
  if (!entity.isValid)
    return;
  const filled_slots = temperature * 2;
  for (let i = 0; i <= filled_slots; i++) {
    entity.runCommand(
      `replaceitem block ~ ~ ~ slot.container ${i} shapescape_bewe:wood_scrap`
    );
  }
  for (let i = filled_slots; i <= 29; i++) {
    entity.runCommand(`replaceitem block ~ ~ ~ slot.container ${i} air`);
  }
}
function calculateCelsius(tempPoints) {
  const keyPoints = [
    { tempPoint: -2, temperature: -100 },
    { tempPoint: -1.1, temperature: -20 },
    { tempPoint: -1, temperature: -14 },
    { tempPoint: -0.95, temperature: -12 },
    { tempPoint: -0.9, temperature: -8 },
    { tempPoint: -0.85, temperature: -4 },
    { tempPoint: -0.8, temperature: 4 },
    { tempPoint: -0.75, temperature: 10 },
    { tempPoint: -0.74, temperature: 10.2 },
    { tempPoint: -0.6, temperature: 12 },
    { tempPoint: -0.15, temperature: 14 },
    { tempPoint: 0.15, temperature: 16 },
    { tempPoint: 0.4, temperature: 20 },
    { tempPoint: 0.5, temperature: 23 },
    { tempPoint: 0.6, temperature: 25 },
    { tempPoint: 0.7, temperature: 30 },
    { tempPoint: 0.74, temperature: 39 },
    { tempPoint: 0.75, temperature: 40 },
    { tempPoint: 0.8, temperature: 43 },
    { tempPoint: 0.85, temperature: 46 },
    { tempPoint: 0.9, temperature: 50 },
    { tempPoint: 2, temperature: 100 }
  ];
  if (tempPoints <= keyPoints[0].tempPoint)
    return keyPoints[0].temperature;
  if (tempPoints >= keyPoints[keyPoints.length - 1].tempPoint)
    return keyPoints[keyPoints.length - 1].temperature;
  for (let i = 0; i < keyPoints.length - 1; i++) {
    const { tempPoint: t1, temperature: temp1 } = keyPoints[i];
    const { tempPoint: t2, temperature: temp2 } = keyPoints[i + 1];
    if (tempPoints >= t1 && tempPoints <= t2) {
      const ratio = (tempPoints - t1) / (t2 - t1);
      return temp1 + ratio * (temp2 - temp1);
    }
  }
  return keyPoints[0].temperature;
}
