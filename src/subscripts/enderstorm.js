import {
  system as system16,
  world as world16,
  MolangVariableMap as MolangVariableMap5,
  BlockVolume as BlockVolume2,
  EntityComponentTypes as EntityComponentTypes5,
  EntityDamageCause as EntityDamageCause5,
  TicksPerSecond as TicksPerSecond4,
  GameMode as GameMode3
} from "@minecraft/server";
var DEBUG3 = false;
var REFRESH_RATE4 = 2 * TicksPerSecond4;
var THUNDER_CHANCE = 0.35;
var DURATION_LIMIT = 50 * TicksPerSecond4;
var COOLDOWN = (Math.random() + Math.random() + 5) * 60 * TicksPerSecond4;
var SOUND_COOLDOWN2 = 14 * TicksPerSecond4;
var LOUD_SOUND_TAG = `shapescape_bewe_ENDERSTORM_SOUND_LOUD`;
var QUIET_SOUND_TAG = `shapescape_bewe_ENDERSTORM_SOUND_QUIET`;
world16.afterEvents.playerSpawn.subscribe((event) => {
  clearTags(event.player);
});
function clearTags(player) {
  player.removeTag(LOUD_SOUND_TAG);
  player.removeTag(QUIET_SOUND_TAG);
}
system16.runInterval(() => {
  if ((world16.getDynamicProperty("shapescape_bewe:settings.weather.enderstorm") ?? true) === false) {
    world16.setDynamicProperty("enderstorm_duration", DURATION_LIMIT);
    world16.setDynamicProperty("enderstorm_cooldown", 0);
  }
  let duration = world16.getDynamicProperty("enderstorm_duration") ?? 0;
  let cooldown = world16.getDynamicProperty("enderstorm_cooldown") ?? 0;
  duration++;
  cooldown++;
  if (DEBUG3 && system16.currentTick % 20 === 0) {
    world16.sendMessage(JSON.stringify(duration));
    world16.sendMessage(JSON.stringify(cooldown));
  }
  if (duration > DURATION_LIMIT && cooldown > COOLDOWN) {
    world16.setDynamicProperty("enderstorm", true);
    duration = 0;
    cooldown = 0;
  }
  if (duration >= DURATION_LIMIT) {
    world16.getDimension("minecraft:overworld").runCommand("/stopsound @a shapescape_bewe.enderstorm.enderstorm");
    world16.setDynamicProperty("enderstorm", false);
    const tornadoes = world16.getDimension("minecraft:the_end").getEntities({
      type: "shapescape_bewe:ender_tornado"
    });
    for (const tornado of tornadoes) {
      if (tornado.isValid) {
        tornado.triggerEvent("shapescape_bewe:start_despawn");
      }
    }
    const players2 = world16.getAllPlayers();
    for (const player of players2) {
      player.runCommand(`/fog @s remove weather`);
      for (const tag of player.getTags()) {
        if (tag.includes("shapescape_bewe_ender_tornado_")) {
          const ender_tornadoID = tag.replace("shapescape_bewe_ender_tornado_", "");
          const ender_tornado = world16.getEntity(ender_tornadoID);
          player.removeTag(tag);
          ender_tornado?.remove();
        }
      }
    }
  }
  world16.setDynamicProperty("enderstorm_duration", duration);
  world16.setDynamicProperty("enderstorm_cooldown", cooldown);
  if (duration > DURATION_LIMIT && cooldown < COOLDOWN)
    return;
  if (DEBUG3) {
    world16.sendMessage("ENDERSTORM");
  }
  sounds();
  if (system16.currentTick % REFRESH_RATE4 !== 0)
    return;
  let players = world16.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  for (let player of players) {
    const allowedGamemode = player.getGameMode() !== GameMode3.Creative && player.getGameMode() !== GameMode3.Spectator;
    if (!allowedGamemode)
      continue;
    if (player.dimension.id !== "minecraft:the_end")
      continue;
    const dimension = player.dimension;
    const location = player.location;
    let spawnEnderTornado = true;
    for (const tag of player.getTags()) {
      if (!tag.includes(`shapescape_bewe_ender_tornado_`))
        continue;
      spawnEnderTornado = false;
    }
    if (spawnEnderTornado) {
      const ender_tornado = dimension.spawnEntity("shapescape_bewe:ender_tornado", player.location);
      player.setPropertyOverrideForEntity(ender_tornado, "shapescape_bewe:visible", true);
      player.addTag(`shapescape_bewe_ender_tornado_${ender_tornado.id}`);
    }
    player.runCommand(`/fog @s push shapescape_bewe:the_end_stormy weather`);
    try {
      player.spawnParticle(`shapescape_bewe:enderstorm_cloud`, player.location);
      player.spawnParticle(`shapescape_bewe:enderstorm_dots`, player.location);
    } catch {
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
    if (Math.random() > THUNDER_CHANCE) {
      if (Math.random() < 0.4) {
        distantThunder(player);
      } else {
        nearbyThunder(player);
      }
    }
  }
}, 1);
function distantThunder(player, index) {
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
        distantThunder(player, index);
        return;
      }
    }
  } catch {
  }
  const molangVarMap = new MolangVariableMap5();
  molangVarMap.setVector3("position", offset);
  dimension.spawnParticle("shapescape_bewe:ender_lightning_bolt", { x: location.x, y: 40, z: location.z }, molangVarMap);
  const pitch = Math.random() * 0.2 + 0.9;
  dimension.playSound(`shapescape_bewe.thunderstorm.thunder_distant`, location, {
    volume: 5,
    pitch
  });
}
function nearbyThunder(player, index) {
  if (index && index > 10)
    return;
  index = index === void 0 ? 0 : ++index;
  const dimension = player.dimension;
  const location = player.location;
  const P1 = { x: location.x - 6, y: 200, z: location.z - 6 };
  const P2 = { x: location.x + 6, y: 200, z: location.z + 6 };
  const volume = new BlockVolume2(P1, P2);
  const locations = Array.from(volume.getBlockLocationIterator());
  const randomStrikeIndex = Math.floor(Math.random() * locations.length);
  const randomTeleportIndex = Math.floor(Math.random() * locations.length);
  const randomStrikePosData = locations[randomStrikeIndex];
  const randomTeleportPosData = locations[randomTeleportIndex];
  let strikeHeightMap = getHeightMap(dimension, randomStrikePosData);
  let teleportHeightMap = getHeightMap(dimension, randomTeleportPosData);
  const strikeLocation = {
    x: randomStrikePosData.x,
    y: strikeHeightMap,
    z: randomStrikePosData.z
  };
  const teleportLocation = {
    x: randomTeleportPosData.x,
    y: teleportHeightMap,
    z: randomTeleportPosData.z
  };
  const entities = dimension.getEntities({
    location: strikeLocation,
    maxDistance: 3
  });
  for (const entity of entities) {
    if (entity === player && teleportLocation !== void 0) {
      player.teleport(teleportLocation);
      player.applyDamage(4, { cause: EntityDamageCause5.lightning });
      dimension.playSound(`mob.shulker.teleport`, strikeLocation, {
        volume: 1,
        pitch: 1
      });
    }
    const familyTypes = entity.getComponent(EntityComponentTypes5.TypeFamily)?.getTypeFamilies();
    if (!familyTypes || !entity.typeId.includes("minecraft:"))
      continue;
    else if (familyTypes.includes("pig") && familyTypes.includes("mob")) {
      entity.triggerEvent(`become_zombie`);
    } else if (familyTypes.includes("mushroomcow") && familyTypes.includes("mob")) {
      const variant = entity.getComponent(EntityComponentTypes5.Variant)?.value;
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
        cause: EntityDamageCause5.lightning
      });
    }
  }
  const molangVarMap = new MolangVariableMap5();
  molangVarMap.setVector3("position", { x: 0, y: 0, z: 0 });
  dimension.spawnParticle("shapescape_bewe:ender_lightning_bolt", strikeLocation, molangVarMap);
  const pitch = Math.random() * 0.2 + 0.9;
  dimension.playSound(`shapescape_bewe.thunderstorm.thunder_nearby`, strikeLocation, {
    volume: 3,
    pitch
  });
}
function getHeightMap(dimension, position, maxScanDepth = 200) {
  const scanPosition = { x: position.x, y: 200, z: position.z };
  for (let index = 0; index < maxScanDepth; index++) {
    try {
      const blockToCheck = dimension.getBlock(scanPosition)?.below(index);
      if (blockToCheck && !blockToCheck.isAir && !blockToCheck.typeId.includes("minecraft:light_block")) {
        return blockToCheck.location.y + 1;
      }
    } catch {
      continue;
    }
  }
  return 0;
}
function sounds() {
  const players = world16.getPlayers();
  for (const player of players) {
    if (player.dimension.id !== "minecraft:the_end")
      continue;
    let in_shelter = false;
    let ray_location = { x: 0, y: 0, z: 0 };
    let block = void 0;
    try {
      ray_location = {
        x: player.location.x,
        y: player.location.y + 1.5,
        z: player.location.z
      };
      block = player.dimension.getBlockFromRay(
        ray_location,
        { x: 0, y: 1, z: 0 },
        { maxDistance: 16, includePassableBlocks: false }
      );
      if (player.dimension.getBlock(ray_location)?.isLiquid)
        in_shelter = true;
    } catch {
      continue;
    }
    if (block !== void 0)
      in_shelter = true;
    if (player.hasTag(LOUD_SOUND_TAG)) {
      if (in_shelter === true) {
        player.removeTag(LOUD_SOUND_TAG);
        player.runCommand("/stopsound @s shapescape_bewe.enderstorm.enderstorm");
      }
    }
    if (player.hasTag(QUIET_SOUND_TAG)) {
      if (in_shelter === false) {
        player.removeTag(QUIET_SOUND_TAG);
        player.runCommand("/stopsound @s shapescape_bewe.enderstorm.enderstorm");
      }
    }
    if (player.hasTag(LOUD_SOUND_TAG) || player.hasTag(QUIET_SOUND_TAG))
      continue;
    if (!in_shelter) {
      player.addTag(LOUD_SOUND_TAG);
      player.playSound("shapescape_bewe.enderstorm.enderstorm", { volume: 0.6 });
    } else {
      player.addTag(QUIET_SOUND_TAG);
      player.playSound("shapescape_bewe.enderstorm.enderstorm", { volume: 0.2 });
    }
    system16.runTimeout(() => {
      if (!player)
        return;
      player.removeTag(LOUD_SOUND_TAG);
      player.removeTag(QUIET_SOUND_TAG);
    }, SOUND_COOLDOWN2);
  }
}
system16.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:ender_tornado" && message === "teleport") {
    const player = entity.dimension.getEntities({
      tags: [`shapescape_bewe_ender_tornado_${entity.id}`]
    })[0];
    if (player && player.isValid) {
      entity.teleport(player.location);
      let duration = world16.getDynamicProperty("enderstorm_duration") ?? 0;
      if (duration > DURATION_LIMIT)
        entity.triggerEvent(`shapescape_bewe:start_despawn`);
    } else {
      const isChested = entity.getComponent(EntityComponentTypes5.IsChested);
      if (!isChested)
        entity.triggerEvent(`shapescape_bewe:start_despawn`);
    }
  }
  if (entity && messageID === "shapescape_bewe:ender_tornado" && message === "despawn") {
    const players = entity.dimension.getEntities({
      tags: [`shapescape_bewe_ender_tornado_${entity.id}`]
    });
    for (const player of players) {
      player.removeTag(`shapescape_bewe_ender_tornado_${entity.id}`);
    }
  }
});
world16.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  for (const tag of player.getTags()) {
    if (tag.includes("shapescape_bewe_ender_tornado_")) {
      const ender_tornadoID = tag.replace("shapescape_bewe_ender_tornado_", "");
      const ender_tornado = world16.getEntity(ender_tornadoID);
      player.removeTag(tag);
      ender_tornado?.remove();
    }
  }
});
system16.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:enderstorm" && message === "dev_start") {
    world16.setDynamicProperty("enderstorm_duration", DURATION_LIMIT);
    world16.setDynamicProperty("enderstorm_cooldown", COOLDOWN);
  }
});
