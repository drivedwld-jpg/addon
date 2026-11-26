import { system as system54, world as world57 } from "@minecraft/server";
var DEBUG22 = false;
world57.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (entity.typeId === "shapescape_bewe:wind_sock") {
    setWindSource(entity, world57.getDynamicProperty("shapescape_bewe:wind_source") ?? 2);
    const windDirection = world57.getDynamicProperty("shapescape_bewe:wind_direction") ?? { x: 1, y: 0, z: 0 };
    const windSpeedX = Math.abs(windDirection.x);
    const windSpeedZ = Math.abs(windDirection.z);
    const windSpeed = Math.round(Math.max(windSpeedX, windSpeedZ) * 100) / 100;
    setWindForce(entity, windSpeed);
  }
});
system54.runInterval(() => {
  const windDirection = world57.getDynamicProperty("shapescape_bewe:wind_direction") ?? { x: 1, y: 0, z: 0 };
  const windSpeedX = Math.abs(windDirection.x);
  const windSpeedZ = Math.abs(windDirection.z);
  const windSpeed = Math.round(Math.max(windSpeedX, windSpeedZ) * 100) / 100;
  const windSource = world57.getDynamicProperty("shapescape_bewe:wind_source") ?? 2;
  const entities = world57.getDimension("overworld").getEntities({ families: ["shapescape_bewe_wind_sock"] });
  for (let entity of entities) {
    const windSpeedPrevious = entity.getDynamicProperty("shapescape_bewe:wind_sock.wind_speed_previous");
    const windSourcePrevious = entity.getDynamicProperty("shapescape_bewe:wind_sock.wind_source_previous");
    if (windSpeed !== windSpeedPrevious) {
      setWindForce(entity, windSpeed);
    }
    if (windSource !== windSourcePrevious) {
      setWindSource(entity, windSource);
    }
  }
}, 100);
function setWindForce(entity, windSpeed) {
  entity.setDynamicProperty("shapescape_bewe:wind_sock.wind_speed_previous", windSpeed);
  if (windSpeed < 0.21) {
    entity.runCommand("event entity @s wind_force_0");
  } else if (windSpeed < 0.42) {
    entity.runCommand("event entity @s wind_force_1");
  } else if (windSpeed < 0.63) {
    entity.runCommand("event entity @s wind_force_2");
  } else if (windSpeed < 0.84) {
    entity.runCommand("event entity @s wind_force_3");
  } else if (windSpeed >= 0.84) {
    entity.runCommand("event entity @s wind_force_4");
  }
}
function setWindSource(entity, windSource) {
  if (DEBUG22)
    console.warn("wind source: " + windSource);
  entity.setDynamicProperty("shapescape_bewe:wind_sock.wind_source_previous", windSource);
  if (windSource == 0) {
    entity.runCommand("event entity @s wind_direction_0");
  } else if (windSource == 1) {
    entity.runCommand("event entity @s wind_direction_1");
  } else if (windSource == 2) {
    entity.runCommand("event entity @s wind_direction_2");
  } else if (windSource == 3) {
    entity.runCommand("event entity @s wind_direction_3");
  }
}
