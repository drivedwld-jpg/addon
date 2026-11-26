import { system as system38, world as world41 } from "@minecraft/server";
var REFRESH_RATE13 = 5 * 20;
system38.runInterval(() => {
  const timeOfDay = world41.getTimeOfDay();
  let temperature = 0;
  if (timeOfDay >= 23e3 /* SUNRISE */ || timeOfDay < 1e3 /* DAY */) {
    temperature += 5;
  } else if (timeOfDay >= 1e3 /* DAY */ && timeOfDay < 6e3 /* NOON */) {
    temperature += 10;
  } else if (timeOfDay >= 6e3 /* NOON */ && timeOfDay < 12e3 /* SUNSET */) {
    temperature += 15;
  } else if (timeOfDay >= 12e3 /* SUNSET */ && timeOfDay < 12610 /* DUSK */) {
    temperature -= 5;
  } else if (timeOfDay >= 12610 /* DUSK */ && timeOfDay < 13e3 /* NIGHT */) {
    temperature -= 10;
  } else if (timeOfDay >= 13e3 /* NIGHT */ && timeOfDay < 18e3 /* MIDNIGHT */) {
    temperature -= 15;
  } else if (timeOfDay >= 18e3 /* MIDNIGHT */ && timeOfDay < 23e3 /* SUNRISE */) {
    temperature -= 20;
  }
  world41.setDynamicProperty("shapescape_bewe:temperature.time_of_day", temperature);
}, REFRESH_RATE13);
