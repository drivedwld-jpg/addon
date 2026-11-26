import {
  EntityComponentTypes as EntityComponentTypes3,
  EntityDamageCause as EntityDamageCause3,
  Player as Player5,
  system as system14,
  TicksPerSecond as TicksPerSecond2,
  world as world13
} from "@minecraft/server";
var DEBUG2 = false;
var slownessTime = 80;
var FALL_DAMAGE = 5;
var TAG = "shapescape_bewe_BROKEN_LEG_TIP";
world13.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    const player = event.player;
    player.setDynamicProperty("break_leg", false);
    player.removeTag(TAG);
    const movementComp = player.getComponent(EntityComponentTypes3.Movement);
    if (!movementComp)
      return;
    movementComp.setCurrentValue(movementComp?.defaultValue);
  }
});
world13.afterEvents.entityHurt.subscribe((event) => {
  const { damage, damageSource, hurtEntity } = event;
  if (damageSource.cause !== EntityDamageCause3.fall || !(hurtEntity instanceof Player5) || damage < FALL_DAMAGE)
    return;
  const player = hurtEntity;
  const setting = player.getDynamicProperty(
    `shapescape_bewe:settings.states.broken_leg`
  ) ?? true;
  if (!setting)
    return;
  if (player.getDynamicProperty("break_leg"))
    return;
  if (!player.hasTag(TAG)) {
    player.sendMessage({ translate: `shapescape_bewe.broken_leg.tip` });
    player.addTag(TAG);
  }
  player.playSound("shapescape_bewe.broken_leg.break", {
    volume: 0.75,
    pitch: 1.75
  });
  player.setDynamicProperty("break_leg", true);
  for (let index = 1; index < slownessTime * 4 + 1; index++) {
    if (index === 1) {
      const movementComp = player.getComponent(EntityComponentTypes3.Movement);
      if (!movementComp)
        return;
      player.playAnimation("animation.shapescape_bewe.player.hobbling");
      const newValue = movementComp.defaultValue * (index / (slownessTime * 4)) < 0.045 ? 0.045 : movementComp.defaultValue * (index / (slownessTime * 4));
      movementComp.setCurrentValue(newValue);
    }
    system14.runTimeout(() => {
      if (!player || player.getDynamicProperty("break_leg") === false)
        return;
      const setting2 = player.getDynamicProperty(
        `shapescape_bewe:settings.states.broken_leg`
      ) ?? true;
      const movementComp = player.getComponent(EntityComponentTypes3.Movement);
      if (!movementComp)
        return;
      const newValue = movementComp.defaultValue * (index / (slownessTime * 4)) < 0.045 ? 0.045 : movementComp.defaultValue * (index / (slownessTime * 4));
      movementComp.setCurrentValue(newValue);
      if (DEBUG2) {
        world13.sendMessage(JSON.stringify(newValue));
        world13.sendMessage(JSON.stringify(movementComp.defaultValue));
      }
      if (!setting2) {
        player.setDynamicProperty("break_leg", false);
        movementComp.setCurrentValue(movementComp.defaultValue);
        return;
      }
      if (newValue >= movementComp.defaultValue) {
        player.setDynamicProperty("break_leg", false);
      }
    }, index / 4 * TicksPerSecond2);
  }
});
