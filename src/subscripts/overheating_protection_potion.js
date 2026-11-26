import { Vec3 } from "../vendor/bedrock-boost.js";
import {
  system as system31,
  world as world31,
  Player as Player14,
  ItemStack as ItemStack3
} from "@minecraft/server";
var activeTimers2 = /* @__PURE__ */ new Map();
world31.afterEvents.itemCompleteUse.subscribe((event) => {
  const player = event.source;
  const itemStack = event.itemStack;
  if (!(player instanceof Player14) || !itemStack)
    return;
  if (itemStack.typeId !== "shapescape_bewe:overheating_protection_potion")
    return;
  applyPotionEffect2(player, "o_i");
  system31.run(() => {
    player.runCommand(`clear @s shapescape_bewe:overheating_protection_potion 0 1`);
    player.dimension.spawnItem(new ItemStack3("minecraft:glass_bottle", 1), player.location);
  });
});
world31.beforeEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const itemStack = event.itemStack;
  if (!(player instanceof Player14) || !itemStack)
    return;
  if (itemStack.typeId !== "shapescape_bewe:overheating_protection_splash_potion")
    return;
  system31.run(() => {
    player.runCommand(`clear @s shapescape_bewe:overheating_protection_splash_potion 0 1`);
    shoot2(player);
  });
});
function shoot2(player) {
  const viewDirection = Vec3.from(player.getViewDirection());
  const location = viewDirection.multiply(1.25).add(player.getHeadLocation());
  const projectile = player.dimension.spawnEntity("shapescape_bewe:overheating_protection_splash_potion", location);
  projectile.applyImpulse(viewDirection.add({ x: 0, y: 0.4, z: 0 }).multiply({ x: 0.6, y: 0.6, z: 0.6 }));
  player.dimension.playSound(`mob.witch.throw`, player.location);
}
world31.afterEvents.projectileHitEntity.subscribe((event) => {
  const projectile = event.projectile;
  if (projectile.typeId !== "shapescape_bewe:overheating_protection_splash_potion")
    return;
  projectileHit2(projectile);
});
world31.afterEvents.projectileHitBlock.subscribe((event) => {
  const projectile = event.projectile;
  if (projectile.typeId !== "shapescape_bewe:overheating_protection_splash_potion")
    return;
  projectileHit2(projectile);
});
function projectileHit2(projectile) {
  projectile.dimension.playSound(`random.glass`, projectile.location);
  const location = projectile.location;
  const dimension = projectile.dimension;
  projectile.remove();
  const affectedEntities = dimension.getEntities({
    location,
    maxDistance: 4
  });
  try {
    dimension.spawnParticle("shapescape_bewe:overheating_protection_splash_potion", location);
  } catch {
  }
  for (const entity of affectedEntities) {
    if (entity instanceof Player14) {
      applyPotionEffect2(entity, "o_i");
    }
  }
}
world31.afterEvents.playerJoin.subscribe((event) => {
  const timerKey = `${event.playerId}_o_i`;
  if (!activeTimers2.has(timerKey)) {
    const player = world31.getAllPlayers().find((p) => p.id === event.playerId);
    if (player) {
      player.setDynamicProperty("shapescape_bewe:overheating_immune", false);
    }
  }
});
function applyPotionEffect2(player, propertyName) {
  const timerKey = `${player.id}_${propertyName}`;
  const particleKey = `${timerKey}_particles`;
  const existingTimer = activeTimers2.get(timerKey);
  const existingParticleTimer = activeTimers2.get(particleKey);
  if (existingTimer !== void 0) {
    player.setDynamicProperty(propertyName, false);
    system31.clearRun(existingTimer);
  }
  if (existingParticleTimer !== void 0) {
    system31.clearRun(existingParticleTimer);
  }
  player.setDynamicProperty(propertyName, true);
  const particleTimer = system31.runInterval(() => {
    if (player.getDynamicProperty(propertyName)) {
      playParticle2(player, "shapescape_bewe:overheating_protection_effect");
    }
  }, 3);
  const newTimer = system31.runTimeout(() => {
    player.setDynamicProperty(propertyName, false);
    system31.clearRun(particleTimer);
    activeTimers2.delete(timerKey);
    activeTimers2.delete(particleKey);
  }, 3600);
  activeTimers2.set(timerKey, newTimer);
  activeTimers2.set(particleKey, particleTimer);
}
function playParticle2(player, particleEffect) {
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
