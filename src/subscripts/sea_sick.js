import {
  EntityComponentTypes as EntityComponentTypes9,
  system as system34,
  TicksPerSecond as TicksPerSecond8,
  WeatherType as WeatherType4,
  world as world34
} from "@minecraft/server";
var DEBUG12 = false;
var DELAY = 20;
var REVERSE_MULTIPLIER = 2;
var MAX_STATE2 = 1;
var THRESHOLD2 = 0.5;
var INTERVAL4 = 1 * TicksPerSecond8;
var TAG3 = "shapescape_bewe_SEA_SICK";
system34.runInterval(() => {
  const players = world34.getAllPlayers();
  for (const player of players) {
    checkSeaSick(player);
  }
}, 1);
world34.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn === false) {
    updateSeaSick(event.player, 0, true);
    event.player.removeEffect("minecraft:nausea");
  }
});
function checkSeaSick(player) {
  const setting = player.getDynamicProperty(`shapescape_bewe:settings.states.sea_sick`) ?? true;
  if (!setting) {
    updateSeaSick(player, 0, true);
  }
  if (system34.currentTick % (9 * TicksPerSecond8) === 0) {
    const currentSeaSick = player.getDynamicProperty("sea_sick") ?? 0;
    if (currentSeaSick > THRESHOLD2 * MAX_STATE2) {
      player.addEffect("minecraft:nausea", 7 * TicksPerSecond8, {
        amplifier: 0,
        showParticles: false
      });
    }
  }
  if (system34.currentTick % INTERVAL4 === 0) {
    const currentSeaSick = player.getDynamicProperty("sea_sick") ?? 0;
    if (currentSeaSick > THRESHOLD2 * MAX_STATE2) {
      if (!player.hasTag(TAG3)) {
        player.sendMessage({ translate: `shapescape_bewe.sea_sick.tip` });
        player.playSound(`note.bass`, { location: player.location });
        player.addTag(TAG3);
      }
    }
    const currentWeather = world34.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
    if (currentWeather.toUpperCase() === WeatherType4.Clear.toUpperCase())
      return;
    const ridingComp = player.getComponent(EntityComponentTypes9.Riding);
    const onBoat = ridingComp?.entityRidingOn.typeId.includes("minecraft:") && ridingComp?.entityRidingOn.typeId.includes("boat");
    let blockIn = void 0;
    let blockBelow1 = void 0;
    let blockBelow2 = void 0;
    try {
      blockIn = player.dimension.getBlock(player.location);
      blockBelow1 = blockIn?.below(1);
      blockBelow2 = blockIn?.below(2);
    } catch {
    }
    const waterBelow = blockIn?.typeId.includes("minecraft:") && blockIn?.typeId.includes("water") || blockBelow1?.typeId.includes("minecraft:") && blockBelow1?.typeId.includes("water") || blockBelow2?.typeId.includes("minecraft:") && blockBelow2?.typeId.includes("water");
    if (onBoat && waterBelow) {
      updateSeaSick(player, DELAY);
    } else {
      updateSeaSick(player, DELAY / REVERSE_MULTIPLIER, true);
    }
  }
}
function updateSeaSick(player, time, offBoat = false) {
  const currentSeaSick = player.getDynamicProperty("sea_sick") ?? 0;
  const step = MAX_STATE2 / (time === 0 ? 1 * (INTERVAL4 / TicksPerSecond8) : time) * (INTERVAL4 / TicksPerSecond8) * (offBoat ? -1 : 1);
  let newSeaSick = Number((currentSeaSick + step).toPrecision(5));
  if (newSeaSick >= MAX_STATE2) {
    newSeaSick = MAX_STATE2;
  } else if (newSeaSick <= 0) {
    newSeaSick = 0;
  }
  if (DEBUG12) {
    world34.sendMessage(`sea sick: ` + JSON.stringify(newSeaSick));
  }
  player.setDynamicProperty("sea_sick", newSeaSick);
}
