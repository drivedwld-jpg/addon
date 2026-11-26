import { Vec3 } from "../vendor/bedrock-boost.js";
import {
  system as system30,
  world as world30,
  Player as Player13,
  ItemStack as ItemStack2
} from "@minecraft/server";
var activeTimers = /* @__PURE__ */ new Map();
world30.afterEvents.itemCompleteUse.subscribe((event) => {
  const player = event.source;
  const itemStack = event.itemStack;
  if (!(player instanceof Player13) || !itemStack)
    return;
  if (itemStack.typeId !== "shapescape_bewe:freezing_protection_potion")
    return;
  applyPotionEffect(player, "f_i");
  system30.run(() => {
    player.runCommand(`clear @s shapescape_bewe:freezing_protection_potion 0 1`);
    player.dimension.spawnItem(new ItemStack2("minecraft:glass_bottle", 1), player.location);
  });
});
world30.beforeEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const itemStack = event.itemStack;
  if (!(player instanceof Player13) || !itemStack)
    return;
  if (itemStack.typeId !== "shapescape_bewe:freezing_protection_splash_potion")
    return;
  system30.run(() => {
    player.runCommand(`clear @s shapescape_bewe:freezing_protection_splash_potion 0 1`);
    shoot(player);
  });
});
function shoot(player) {
  const viewDirection = Vec3.from(player.getViewDirection());
  const location = viewDirection.multiply(1.25).add(player.getHeadLocation());
  const projectile = player.dimension.spawnEntity("shapescape_bewe:freezing_protection_splash_potion", location);
  projectile.applyImpulse(viewDirection.add({ x: 0, y: 0.4, z: 0 }).multiply({ x: 0.6, y: 0.6, z: 0.6 }));
  player.dimension.playSound(`mob.witch.throw`, player.location);
}
world30.afterEvents.projectileHitEntity.subscribe((event) => {
  const projectile = event.projectile;
  if (projectile.typeId !== "shapescape_bewe:freezing_protection_splash_potion")
    return;
  projectileHit(projectile);
});
world30.afterEvents.projectileHitBlock.subscribe((event) => {
  const projectile = event.projectile;
  if (projectile.typeId !== "shapescape_bewe:freezing_protection_splash_potion")
    return;
  projectileHit(projectile);
});
function projectileHit(projectile) {
  projectile.dimension.playSound(`random.glass`, projectile.location);
  const location = projectile.location;
  const dimension = projectile.dimension;
  projectile.remove();
  const affectedEntities = dimension.getEntities({
    location,
    maxDistance: 4
  });
  try {
    dimension.spawnParticle("shapescape_bewe:freezing_protection_splash_potion", location);
  } catch {
  }
  for (const entity of affectedEntities) {
    if (entity instanceof Player13) {
      applyPotionEffect(entity, "f_i");
    }
  }
}
world30.afterEvents.playerJoin.subscribe((event) => {
  const timerKey = `${event.playerId}_f_i`;
  if (!activeTimers.has(timerKey)) {
    const player = world30.getAllPlayers().find((p) => p.id === event.playerId);
    if (player) {
      player.setDynamicProperty("f_i", false);
    }
  }
});
function applyPotionEffect(player, propertyName) {
  const timerKey = `${player.id}_${propertyName}`;
  const particleKey = `${timerKey}_particles`;
  const existingTimer = activeTimers.get(timerKey);
  const existingParticleTimer = activeTimers.get(particleKey);
  if (existingTimer !== void 0) {
    player.setDynamicProperty(propertyName, false);
    system30.clearRun(existingTimer);
  }
  if (existingParticleTimer !== void 0) {
    system30.clearRun(existingParticleTimer);
  }
  player.setDynamicProperty(propertyName, true);
  const particleTimer = system30.runInterval(() => {
    if (player.getDynamicProperty(propertyName)) {
      playParticle(player, "shapescape_bewe:freezing_protection_effect");
    }
  }, 3);
  const newTimer = system30.runTimeout(() => {
    player.setDynamicProperty(propertyName, false);
    system30.clearRun(particleTimer);
    activeTimers.delete(timerKey);
    activeTimers.delete(particleKey);
  }, 3600);
  activeTimers.set(timerKey, newTimer);
  activeTimers.set(particleKey, particleTimer);
}
function playParticle(player, particleEffect) {
  const locator = player.location;
  const direction = player.getViewDirection();
  const velocity = player.getVelocity();
  const particleLocation = {
    x: locator.x + direction.x * 0.1 + velocity.x * 8,
    y: locator.y + 0.1 + direction.y * 0.1 + velocity.y * 2,
    z: locator.z + direction.z * 0.1 + velocity.z * 8
  };
  try {
    player.dimension.spawnParticle(particleEffect, particleLocation);
  } catch {
  }
}
