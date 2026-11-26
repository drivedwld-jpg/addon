import { system as system10, world as world9 } from "@minecraft/server";
system10.runInterval(() => {
  if ((world9.getDynamicProperty("shapescape_bewe:settings.particles.aurora") ?? true) === false)
    return;
  const timeOfDay = world9.getTimeOfDay();
  if (timeOfDay >= 2e4 || timeOfDay < 14e3) {
    return;
  }
  const players = world9.getPlayers();
  for (const player of players) {
    try {
      player.dimension.spawnParticle("shapescape_bewe:aurora_beams", {
        x: player.location.x,
        y: 100,
        z: player.location.z
      });
    } catch {
    }
  }
}, 600);
