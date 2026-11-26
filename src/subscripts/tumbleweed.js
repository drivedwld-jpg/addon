import { system as system50, world as world53 } from "@minecraft/server";
world53.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity && entity.typeId === "shapescape_bewe:tumbleweed") {
    if ((world53.getDynamicProperty("shapescape_bewe:settings.particles.tumbleweed") ?? true) === true)
      return;
    entity.remove();
  }
});
system50.runInterval(() => {
  if (system50.currentTick % 5 === 0) {
    const tumbleweeds = world53.getDimension("overworld").getEntities({ type: "shapescape_bewe:tumbleweed" });
    const WIND_DIRECTION = world53.getDynamicProperty("shapescape_bewe:wind_direction") ?? { x: 1, y: 0, z: 0 };
    const WEATHER = world53.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
    const speedModifier = WEATHER === `thunderstorm` ? 2 : 1;
    for (let tumbleweed of tumbleweeds) {
      try {
        if (tumbleweed.isValid) {
          tumbleweed.applyImpulse({
            x: WIND_DIRECTION.x / 2.5 * speedModifier,
            y: WIND_DIRECTION.y,
            z: WIND_DIRECTION.z / 2.5 * speedModifier
          });
          if (Math.random() < 0.5) {
            const velocity = tumbleweed.getVelocity();
            const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
            if (speed < 0.01)
              tumbleweed.applyImpulse({ x: 0, y: 0.5, z: 0 });
          }
        }
      } catch {
        continue;
      }
    }
  }
}, 1);
