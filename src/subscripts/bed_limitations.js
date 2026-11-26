import {
  EntityComponentTypes as EntityComponentTypes15,
  system as system52,
  world as world55
} from "@minecraft/server";
world55.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.block.typeId === "minecraft:bed") {
    const player = event.player;
    if (world55.getTimeOfDay() < 13e3 || world55.getTimeOfDay() > 23e3) {
      event.cancel = true;
      player.sendMessage({
        rawtext: [{ translate: `shapescape_bewe.bed_limitations.night_sleep` }]
      });
      setPlayerSpawnPoint(player);
      return;
    }
    const WEATHER = world55.getDynamicProperty(
      "shapescape_bewe:environment_detection.weather"
    ) ?? "clear";
    if (WEATHER === "thunderstorm") {
      event.cancel = true;
      player.sendMessage({
        rawtext: [{ translate: `shapescape_bewe.bed_limitations.storm_sleep` }]
      });
      setPlayerSpawnPoint(player);
      return;
    }
    const temperature = player.getDynamicProperty("shapescape_bewe:temperature") ?? 0;
    if (temperature >= 0.715) {
      event.cancel = true;
      player.sendMessage({
        rawtext: [{ translate: `shapescape_bewe.bed_limitations.temperature_warm` }]
      });
      setPlayerSpawnPoint(player);
      return;
    } else if (temperature <= -0.75) {
      event.cancel = true;
      player.sendMessage({
        rawtext: [{ translate: `shapescape_bewe.bed_limitations.temperature_cold` }]
      });
      setPlayerSpawnPoint(player);
      return;
    }
    const health = player.getComponent(
      EntityComponentTypes15.Health
    );
    if (health.currentValue < 6) {
      event.cancel = true;
      player.sendMessage({
        rawtext: [{ translate: `shapescape_bewe.bed_limitations.health` }]
      });
      setPlayerSpawnPoint(player);
      return;
    }
  }
});
function setPlayerSpawnPoint(player) {
  const location = player.location;
  const dimension = player.dimension;
  player.sendMessage({
    rawtext: [{ translate: `shapescape_bewe.bed_limitations.spawnpoint` }]
  });
  const dimensionLocation = {
    dimension,
    x: location.x,
    y: location.y,
    z: location.z
  };
  system52.run(() => {
    player.setSpawnPoint(dimensionLocation);
    player.playSound(`note.bass`, {
      location: player.location
    });
  });
}
