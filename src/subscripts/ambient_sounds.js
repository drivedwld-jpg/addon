import { system as system9, world as world8 } from "@minecraft/server";
var REFRESH_RATE = 1 * 20;
var COOLDOWN_BIRDS = "shapescape_bewe_ambient_birds_cooldown";
var COOLDOWN_OWL = "shapescape_bewe_ambient_owl_cooldown";
var COOLDOWN_CRICKETS = "shapescape_bewe_ambient_crickets_cooldown";
var COOLDOWN_SWAMP = "shapescape_bewe_ambient_swamp_cooldown";
var COOLDOWN_JUNGLE = "shapescape_bewe_ambient_jungle_cooldown";
var COOLDOWN_JUNGLE_NIGHT = "shapescape_bewe_ambient_jungle_night_cooldown";
var COOLDOWN_RIVER = "shapescape_bewe_ambient_river_cooldown";
var COOLDOWN_BEACH = "shapescape_bewe_ambient_beach_cooldown";
var COOLDOWN_OCEAN = "shapescape_bewe_ambient_ocean_cooldown";
var cooldown_tags = [
  COOLDOWN_BIRDS,
  COOLDOWN_OWL,
  COOLDOWN_CRICKETS,
  COOLDOWN_SWAMP,
  COOLDOWN_JUNGLE,
  COOLDOWN_JUNGLE_NIGHT,
  COOLDOWN_RIVER,
  COOLDOWN_BEACH,
  COOLDOWN_OCEAN
];
world8.afterEvents.playerSpawn.subscribe((event) => {
  clear_cooldowns(event.player);
});
function clear_cooldowns(player) {
  for (let tag of cooldown_tags) {
    player.removeTag(tag);
  }
}
function random_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
system9.runInterval(() => {
  const WEATHER = world8.getDynamicProperty("shapescape_bewe:environment_detection.weather") ?? "clear";
  const TIME_OF_DAY = world8.getTimeOfDay();
  let players = world8.getPlayers();
  for (let player of players) {
    const biome = player.getDynamicProperty("shapescape_bewe:environment_detection.biome") ?? "";
    const biomeTagsProperty = player.getDynamicProperty("shapescape_bewe:environment_detection.biome_tags") ?? "[]";
    const biomeTags = JSON.parse(biomeTagsProperty);
    if (biomeTags.length === 0 || biome === "")
      continue;
    let time = "day";
    if (TIME_OF_DAY > 23500 && TIME_OF_DAY < 24e3 || TIME_OF_DAY >= 0 && TIME_OF_DAY < 12500) {
      time = "day";
    } else {
      time = "night";
    }
    if (biomeTags.includes("forest") || biome === "forest") {
      if (biomeTags.includes("cold"))
        continue;
      if (WEATHER !== "clear")
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        if (time === "day") {
          if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.forest_day") ?? true) === false)
            continue;
          birds_sounds(player);
        } else {
          if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.forest_night") ?? true) === false)
            continue;
          owl_sounds(player);
          crickets_sounds(player);
        }
      }
    }
    if (biomeTags.includes("plains") || biome === "plain") {
      if (WEATHER !== "clear")
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        if (time === "night") {
          if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.plains_night") ?? true) === false)
            continue;
          crickets_sounds(player);
        }
      }
    }
    if (biomeTags.includes("swamp") || biomeTags.includes("mangrove_swamp") || biome === "swamp") {
      if (WEATHER !== "clear")
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        swamp_sounds(player, time);
      }
    }
    if (biomeTags.includes("jungle") || biome === "jungle") {
      if (WEATHER !== "clear")
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        if (time === "day") {
          if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.jungle_day") ?? true) === false)
            continue;
          birds_sounds(player);
          jungle_sounds(player);
        } else {
          if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.jungle_night") ?? true) === false)
            continue;
          jungle_night_sounds(player);
          crickets_sounds(player);
        }
      }
    }
    if (biomeTags.includes("river") || biome === "river") {
      if (biomeTags.includes("frozen"))
        continue;
      if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.river") ?? true) === false)
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        river_sounds(player);
      }
    }
    if (biomeTags.includes("beach") || biome === "beach" || biome === "stone_beach") {
      if (biomeTags.includes("cold"))
        continue;
      if (WEATHER !== "clear")
        continue;
      if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.beach") ?? true) === false)
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        beach_sounds(player);
      }
    }
    if (biomeTags.includes("ocean") || biome === "ocean") {
      if (biomeTags.includes("frozen"))
        continue;
      if ((player.getDynamicProperty("shapescape_bewe:settings.sounds.ocean") ?? true) === false)
        continue;
      if (player.location.y > 50 && player.location.y < 100) {
        ocean_sounds(player);
      }
    }
  }
}, REFRESH_RATE);
function ocean_sounds(player) {
  if (!player.hasTag(COOLDOWN_OCEAN)) {
    player.addTag(COOLDOWN_OCEAN);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 4;
    let pitch = 1.05 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.ocean", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(3, 4);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_OCEAN);
    }, COOLDOWN3 * 20);
  }
}
function beach_sounds(player) {
  if (!player.hasTag(COOLDOWN_BEACH)) {
    player.addTag(COOLDOWN_BEACH);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 4;
    let pitch = 1.05 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.beach", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(3, 5);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_BEACH);
    }, COOLDOWN3 * 20);
  }
}
function river_sounds(player) {
  if (!player.hasTag(COOLDOWN_RIVER)) {
    player.addTag(COOLDOWN_RIVER);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22)
    };
    let volume = 4;
    let pitch = 1.05 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.river", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(3, 5);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_RIVER);
    }, COOLDOWN3 * 20);
  }
}
function jungle_sounds(player) {
  if (!player.hasTag(COOLDOWN_JUNGLE)) {
    player.addTag(COOLDOWN_JUNGLE);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22)
    };
    let volume = 4;
    let pitch = 1.05 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.jungle", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(3, 5);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_JUNGLE);
    }, COOLDOWN3 * 20);
  }
}
function jungle_night_sounds(player) {
  if (!player.hasTag(COOLDOWN_JUNGLE_NIGHT)) {
    player.addTag(COOLDOWN_JUNGLE_NIGHT);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 4;
    let pitch = 1.05 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.jungle_night", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(3, 5);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_JUNGLE_NIGHT);
    }, COOLDOWN3 * 20);
  }
}
function swamp_sounds(player, time) {
  if (!player.hasTag(COOLDOWN_SWAMP)) {
    player.addTag(COOLDOWN_SWAMP);
    let location = player.location;
    if (time === "day") {
      location = {
        x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22),
        y: player.location.y,
        z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(16, 22)
      };
    } else {
      location = {
        x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
        y: player.location.y,
        z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
      };
    }
    let volume = 8;
    let pitch = 1.15 - random_int(0, 30) * 0.01;
    if (time === "day") {
      if (player.getDynamicProperty("shapescape_bewe:settings.sounds.swamp_day") ?? true) {
        player.playSound("shapescape_bewe.swamp", {
          location,
          volume,
          pitch
        });
      }
    }
    if (time !== "day") {
      if (player.getDynamicProperty("shapescape_bewe:settings.sounds.swamp_night") ?? true) {
        player.playSound("shapescape_bewe.swamp", {
          location,
          volume,
          pitch
        });
      }
    }
    let COOLDOWN3 = random_int(5, 8);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_SWAMP);
    }, COOLDOWN3 * 20);
  }
}
function birds_sounds(player) {
  if (!player.hasTag(COOLDOWN_BIRDS)) {
    player.addTag(COOLDOWN_BIRDS);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 2 - random_int(0, 10) * 0.01;
    let pitch = 1.15 - random_int(0, 30) * 0.01;
    player.playSound("shapescape_bewe.bird", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(5, 8);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_BIRDS);
    }, COOLDOWN3 * 20);
  }
}
function owl_sounds(player) {
  if (!player.hasTag(COOLDOWN_OWL)) {
    player.addTag(COOLDOWN_OWL);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 2;
    let pitch = 1 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.owl", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(10, 20);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_OWL);
    }, COOLDOWN3 * 20);
  }
}
function crickets_sounds(player) {
  if (!player.hasTag(COOLDOWN_CRICKETS)) {
    player.addTag(COOLDOWN_CRICKETS);
    let location = {
      x: player.location.x + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16),
      y: player.location.y,
      z: player.location.z + (Math.random() < 0.5 ? -1 : 1) * random_int(8, 16)
    };
    let volume = 2;
    let pitch = 1 - random_int(0, 5) * 0.01;
    player.playSound("shapescape_bewe.crickets", {
      location,
      volume,
      pitch
    });
    let COOLDOWN3 = random_int(4, 6);
    system9.runTimeout(() => {
      player.removeTag(COOLDOWN_CRICKETS);
    }, COOLDOWN3 * 20);
  }
}
