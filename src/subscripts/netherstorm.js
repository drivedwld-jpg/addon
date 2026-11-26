import {
  system as system29,
  world as world29,
  MolangVariableMap as MolangVariableMap13,
  BlockVolume as BlockVolume5,
  EntityComponentTypes as EntityComponentTypes8,
  EntityDamageCause as EntityDamageCause8,
  TicksPerSecond as TicksPerSecond7,
  GameMode as GameMode6
} from "@minecraft/server";
var DEBUG11 = false;
var REFRESH_RATE10 = 2 * TicksPerSecond7;
var THUNDER_CHANCE2 = 0.35;
var DURATION_LIMIT2 = 50 * TicksPerSecond7;
var COOLDOWN2 = (Math.random() + Math.random() + 5) * 60 * TicksPerSecond7;
var SOUND_COOLDOWN3 = 14 * TicksPerSecond7;
var LOUD_SOUND_TAG2 = `shapescape_bewe_netherSTORM_SOUND_LOUD`;
var QUIET_SOUND_TAG2 = `shapescape_bewe_netherSTORM_SOUND_QUIET`;
world29.afterEvents.playerSpawn.subscribe((event) => {
  clearTags2(event.player);
});
function clearTags2(player) {
  player.removeTag(LOUD_SOUND_TAG2);
  player.removeTag(QUIET_SOUND_TAG2);
}
system29.runInterval(() => {
  if ((world29.getDynamicProperty("shapescape_bewe:settings.weather.netherstorm") ?? true) === false) {
    world29.setDynamicProperty("netherstorm_duration", DURATION_LIMIT2);
    world29.setDynamicProperty("netherstorm_cooldown", 0);
  }
  let duration = world29.getDynamicProperty("netherstorm_duration") ?? 0;
  let cooldown = world29.getDynamicProperty("netherstorm_cooldown") ?? 0;
  duration++;
  cooldown++;
  if (DEBUG11 && system29.currentTick % 20 === 0) {
    world29.sendMessage(JSON.stringify(duration));
    world29.sendMessage(JSON.stringify(cooldown));
  }
  if (duration > DURATION_LIMIT2 && cooldown > COOLDOWN2) {
    world29.setDynamicProperty("netherstorm", true);
    duration = 0;
    cooldown = 0;
    const players2 = world29.getAllPlayers();
    for (const player of players2) {
      const allowedGamemode = player.getGameMode() !== GameMode6.Creative && player.getGameMode() !== GameMode6.Spectator;
      if (!allowedGamemode)
        continue;
      if (player.dimension.id !== "minecraft:nether")
        continue;
      const dimension = player.dimension;
      const location = player.location;
      const skeletonsInTotal = 5;
      const nearbyWitherSkeletons = dimension.getEntities({
        location,
        maxDistance: 20,
        type: "minecraft:wither_skeleton"
      });
      const skeletonP1 = {
        x: location.x - 10,
        y: location.y,
        z: location.z - 10
      };
      const skeletonP2 = {
        x: location.x + 10,
        y: location.y + 3,
        z: location.z + 10
      };
      const skeletonVolume = new BlockVolume5(skeletonP1, skeletonP2).getBlockLocationIterator();
      const skeletonVolumeAir = [];
      for (const location2 of skeletonVolume) {
        try {
          const block = dimension.getBlock(location2);
          if (block?.isAir || block?.typeId.includes("minecraft:light_block")) {
            skeletonVolumeAir.push(location2);
          }
        } catch {
        }
      }
      for (let index = 0; index < skeletonsInTotal - nearbyWitherSkeletons.length; index++) {
        const randomLocation = skeletonVolumeAir[Math.floor(Math.random() * skeletonVolumeAir.length)];
        dimension.spawnEntity("minecraft:wither_skeleton", randomLocation);
      }
    }
  }
  if (duration >= DURATION_LIMIT2) {
    world29.getDimension("minecraft:overworld").runCommand("/stopsound @a shapescape_bewe.netherstorm.netherstorm");
    world29.setDynamicProperty("netherstorm", false);
    const tornadoes = world29.getDimension("minecraft:nether").getEntities({
      type: "shapescape_bewe:nether_tornado"
    });
    for (const tornado of tornadoes) {
      if (tornado.isValid) {
        tornado.triggerEvent("shapescape_bewe:start_despawn");
      }
    }
    const players2 = world29.getAllPlayers();
    for (const player of players2) {
      player.runCommand(`/fog @s remove weather`);
      for (const tag of player.getTags()) {
        if (tag.includes("shapescape_bewe_nether_tornado_")) {
          const nether_tornadoID = tag.replace("shapescape_bewe_nether_tornado_", "");
          const nether_tornado = world29.getEntity(nether_tornadoID);
          player.removeTag(tag);
          nether_tornado?.remove();
        }
      }
    }
  }
  world29.setDynamicProperty("netherstorm_duration", duration);
  world29.setDynamicProperty("netherstorm_cooldown", cooldown);
  if (duration > DURATION_LIMIT2 && cooldown < COOLDOWN2)
    return;
  if (DEBUG11) {
    world29.sendMessage("netherSTORM");
  }
  sounds2();
  if (system29.currentTick % REFRESH_RATE10 !== 0)
    return;
  let players = world29.getPlayers();
  let alreadyProcessed = /* @__PURE__ */ new Set();
  for (let player of players) {
    if (player.dimension.id !== "minecraft:nether")
      continue;
    const dimension = player.dimension;
    const location = player.location;
    let spawnNetherTornado = true;
    for (const tag of player.getTags()) {
      if (!tag.includes(`shapescape_bewe_nether_tornado_`))
        continue;
      spawnNetherTornado = false;
    }
    if (spawnNetherTornado) {
      const nether_tornado = dimension.spawnEntity("shapescape_bewe:nether_tornado", player.location);
      player.setPropertyOverrideForEntity(nether_tornado, "shapescape_bewe:visible", true);
      player.addTag(`shapescape_bewe_nether_tornado_${nether_tornado.id}`);
    }
    player.runCommand(`/fog @s push shapescape_bewe:nether_stormy weather`);
    try {
      player.spawnParticle(`shapescape_bewe:netherstorm_cloud`, player.location);
      player.spawnParticle(`shapescape_bewe:netherstorm_dots`, player.location);
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
    const nearbyWitherSkeletons = dimension.getEntities({
      location,
      maxDistance: 32,
      type: "minecraft:wither_skeleton"
    });
    for (const skeleton of nearbyWitherSkeletons) {
      if (skeleton.isValid) {
        skeleton.addEffect("minecraft:speed", REFRESH_RATE10, {
          amplifier: 0,
          showParticles: false
        });
      }
    }
    if (Math.random() > THUNDER_CHANCE2) {
      if (Math.random() < 0.5) {
        const pitch = Math.random() * 0.2 + 0.9;
        dimension.playSound(`shapescape_bewe.thunderstorm.thunder_distant`, location, {
          volume: 5,
          pitch
        });
      } else {
        const pitch = Math.random() * 0.2 + 0.9;
        dimension.playSound(`shapescape_bewe.thunderstorm.thunder_nearby`, player.location, {
          volume: 3,
          pitch
        });
      }
    }
  }
}, 1);
function sounds2() {
  const players = world29.getPlayers();
  for (const player of players) {
    if (player.dimension.id !== "minecraft:nether")
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
    if (player.hasTag(LOUD_SOUND_TAG2)) {
      if (in_shelter === true) {
        player.removeTag(LOUD_SOUND_TAG2);
        player.runCommand("/stopsound @s shapescape_bewe.netherstorm.netherstorm");
      }
    }
    if (player.hasTag(QUIET_SOUND_TAG2)) {
      if (in_shelter === false) {
        player.removeTag(QUIET_SOUND_TAG2);
        player.runCommand("/stopsound @s shapescape_bewe.netherstorm.netherstorm");
      }
    }
    if (player.hasTag(LOUD_SOUND_TAG2) || player.hasTag(QUIET_SOUND_TAG2))
      continue;
    if (!in_shelter) {
      player.addTag(LOUD_SOUND_TAG2);
      player.playSound("shapescape_bewe.netherstorm.netherstorm", { volume: 0.6 });
    } else {
      player.addTag(QUIET_SOUND_TAG2);
      player.playSound("shapescape_bewe.netherstorm.netherstorm", { volume: 0.2 });
    }
    system29.runTimeout(() => {
      if (!player)
        return;
      player.removeTag(LOUD_SOUND_TAG2);
      player.removeTag(QUIET_SOUND_TAG2);
    }, SOUND_COOLDOWN3);
  }
}
system29.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:nether_tornado" && message === "teleport") {
    const player = entity.dimension.getEntities({
      tags: [`shapescape_bewe_nether_tornado_${entity.id}`]
    })[0];
    if (player && player.isValid) {
      entity.teleport(player.location);
      let duration = world29.getDynamicProperty("netherstorm_duration") ?? 0;
      if (duration > DURATION_LIMIT2)
        entity.triggerEvent(`shapescape_bewe:start_despawn`);
    } else {
      const isChested = entity.getComponent(EntityComponentTypes8.IsChested);
      if (!isChested)
        entity.triggerEvent(`shapescape_bewe:start_despawn`);
    }
  }
  if (entity && messageID === "shapescape_bewe:nether_tornado" && message === "despawn") {
    const players = entity.dimension.getEntities({
      tags: [`shapescape_bewe_nether_tornado_${entity.id}`]
    });
    for (const player of players) {
      player.removeTag(`shapescape_bewe_nether_tornado_${entity.id}`);
    }
  }
});
world29.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;
  for (const tag of player.getTags()) {
    if (tag.includes("shapescape_bewe_nether_tornado_")) {
      const nether_tornadoID = tag.replace("shapescape_bewe_nether_tornado_", "");
      const nether_tornado = world29.getEntity(nether_tornadoID);
      player.removeTag(tag);
      nether_tornado?.remove();
    }
  }
});
system29.afterEvents.scriptEventReceive.subscribe((event) => {
  const message = event.message;
  const messageID = event.id;
  const entity = event.sourceEntity;
  if (!entity?.isValid)
    return;
  if (entity && messageID === "shapescape_bewe:netherstorm" && message === "dev_start") {
    world29.setDynamicProperty("netherstorm_duration", DURATION_LIMIT2);
    world29.setDynamicProperty("netherstorm_cooldown", COOLDOWN2);
  }
});
