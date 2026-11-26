import {
  BlockVolume as BlockVolume4,
  Direction as Direction3,
  MolangVariableMap as MolangVariableMap12,
  Player as Player11,
  system as system28,
  TicksPerSecond as TicksPerSecond6,
  WeatherType as WeatherType3,
  world as world28
} from "@minecraft/server";
var DEBUG10 = false;
var DATA3 = { "getting_muddy": { "on_mud": 5, "in_quicksand": 5 }, "getting_clean": { "in_rain": 5, "in_snowfall": 10, "in_water": 2, "in_lava": 2 }, "effects_threshold": 0.5 };
var THRESHOLD = DATA3.effects_threshold;
var MAX_STATE = 1;
var INTERVAL3 = 0.5 * TicksPerSecond6;
var TAG2 = "shapescape_bewe_MUDDY_STATE";
system28.runInterval(() => {
  const players = world28.getAllPlayers();
  for (const player of players) {
    if (system28.currentTick % INTERVAL3 === 0)
      checkMuddyState(player);
    if (system28.currentTick % 5 === 0) {
      const isMoving = player.getVelocity().x !== 0 || player.getVelocity().y !== 0 || player.getVelocity().z !== 0;
      const currentMuddyState = player.getDynamicProperty("muddy_state") ?? 0;
      if (player.isOnGround && isMoving && currentMuddyState > THRESHOLD * MAX_STATE) {
        if (!player.hasTag(TAG2)) {
          player.sendMessage({ translate: `shapescape_bewe.muddy_state.tip` });
          player.playSound(`note.bass`, { location: player.location });
          player.addTag(TAG2);
        }
        particlesStep(player);
      }
    }
  }
}, 1);
world28.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    updateMuddyState(event.player, 0, true);
  }
});
function checkMuddyState(player) {
  const setting = player.getDynamicProperty(`shapescape_bewe:settings.states.muddy_state`) ?? true;
  if (!setting) {
    updateMuddyState(player, 0, true);
    return;
  }
  const biomeTemperature = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_temperature") ?? 0.5 /* TEMPERATE */;
  const currentWeather = world28.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  let block = void 0;
  let blockBelow = void 0;
  try {
    block = player.dimension.getBlock(player.location);
    blockBelow = player.dimension.getBlock({ x: player.location.x, y: player.location.y - 1, z: player.location.z });
  } catch {
  }
  const isMoving = player.getVelocity().x !== 0 || player.getVelocity().y !== 0 || player.getVelocity().z !== 0;
  if (!block || !blockBelow)
    return;
  const currentMuddyState = player.getDynamicProperty("muddy_state") ?? 0;
  if (currentMuddyState >= THRESHOLD * MAX_STATE) {
    player.addEffect(`minecraft:mining_fatigue`, INTERVAL3 + 10, {
      amplifier: 0,
      showParticles: false
    });
  }
  if ((block.typeId.includes("minecraft:") && block.typeId.includes("mud") || blockBelow.typeId.includes("minecraft:") && blockBelow.typeId.includes("mud")) && isMoving) {
    updateMuddyState(player, DATA3.getting_muddy.on_mud, false);
    return;
  }
  if (block && block.typeId === "shapescape_bewe:quicksand") {
    updateMuddyState(player, DATA3.getting_muddy.in_quicksand, false);
    return;
  }
  if (block && block.typeId.includes("minecraft:") && block.typeId.includes("lava") && isMoving) {
    updateMuddyState(player, DATA3.getting_clean.in_lava, true);
    return;
  }
  if (player.isInWater && isMoving) {
    updateMuddyState(player, DATA3.getting_clean.in_water, true);
    return;
  }
  if (currentWeather.toUpperCase() === WeatherType3.Rain.toUpperCase() && biomeTemperature > 0.15 /* COLD */ && !hasRoof2(player.location, player.dimension)) {
    updateMuddyState(player, DATA3.getting_clean.in_rain, true);
  }
  if (currentWeather.toUpperCase() === WeatherType3.Rain.toUpperCase() && biomeTemperature <= 0.15 /* COLD */ && !hasRoof2(player.location, player.dimension)) {
    updateMuddyState(player, DATA3.getting_clean.in_snowfall, true);
  }
}
function updateMuddyState(player, time, cleaning = false) {
  const currentMuddyState = player.getDynamicProperty("muddy_state") ?? 0;
  const step = MAX_STATE / (time === 0 ? 1 * (INTERVAL3 / TicksPerSecond6) : time) * (INTERVAL3 / TicksPerSecond6) * (cleaning ? -1 : 1);
  let newMuddyState = Number((currentMuddyState + step).toPrecision(5));
  if (newMuddyState >= MAX_STATE) {
    newMuddyState = MAX_STATE;
  } else if (newMuddyState <= 0) {
    newMuddyState = 0;
  }
  if (DEBUG10) {
    world28.sendMessage(`muddy state: ` + JSON.stringify(newMuddyState));
  }
  player.setDynamicProperty("muddy_state", newMuddyState);
}
function particlesStep(player) {
  const locator = player.location;
  const velocity = player.getVelocity();
  const particleLocation = {
    x: locator.x + velocity.x * 5,
    y: locator.y,
    z: locator.z + velocity.z * 5
  };
  let speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  const molang = new MolangVariableMap12();
  molang.setFloat("variable.size_from_velocity", 1 + speed * 4);
  try {
    player.dimension.spawnParticle("shapescape_bewe:muddy_footstep", particleLocation, molang);
    if (Math.random() < 0.75) {
      player.playSound(`block.mud.step`, {
        location: particleLocation,
        volume: 0.25,
        pitch: 0.9 + Math.random() * 0.2
      });
    }
  } catch {
  }
}
function particlesHit(player, block, blockFace, entity) {
  const currentMuddyState = player.getDynamicProperty("muddy_state") ?? 0;
  if (currentMuddyState < THRESHOLD * MAX_STATE)
    return;
  if (block && blockFace) {
    const OFFSETS2 = /* @__PURE__ */ new Map([
      [Direction3.Up, { x: 0, y: 0.5, z: 0 }],
      [Direction3.Down, { x: 0, y: -0.5, z: 0 }],
      [Direction3.North, { x: 0, y: 0, z: -0.5 }],
      [Direction3.South, { x: 0, y: 0, z: 0.5 }],
      [Direction3.West, { x: -0.5, y: 0, z: 0 }],
      [Direction3.East, { x: 0.5, y: 0, z: 0 }]
    ]);
    const location = {
      x: block.center().x + OFFSETS2.get(blockFace).x,
      y: block.center().y + OFFSETS2.get(blockFace).y,
      z: block.center().z + OFFSETS2.get(blockFace).z
    };
    player.playSound(`block.mud.place`, {
      location
    });
    player.dimension.spawnParticle("shapescape_bewe:muddy_hit", location);
  }
  try {
    if (entity) {
      const location = {
        x: entity.location.x,
        y: entity.location.y + (entity.getHeadLocation().y - entity.location.y) / 2,
        z: entity.location.z
      };
      player.playSound(`block.mud.place`, {
        location
      });
      player.dimension.spawnParticle("shapescape_bewe:muddy_hit", location);
    }
  } catch {
  }
}
function hasRoof2(location, dimension) {
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
  const volume = new BlockVolume4(P1, P2);
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
world28.afterEvents.entityHitBlock.subscribe((event) => {
  const { hitBlock, damagingEntity, blockFace } = event;
  if (!(damagingEntity instanceof Player11))
    return;
  const player = damagingEntity;
  particlesHit(player, hitBlock, blockFace);
});
world28.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, player, blockFace } = event;
  particlesHit(player, block, blockFace);
});
world28.afterEvents.entityHitEntity.subscribe((event) => {
  const { damagingEntity, hitEntity } = event;
  if (!(damagingEntity instanceof Player11))
    return;
  const player = damagingEntity;
  particlesHit(player, void 0, void 0, hitEntity);
});
world28.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target } = event;
  if (!(player instanceof Player11))
    return;
  particlesHit(player, void 0, void 0, target);
});
