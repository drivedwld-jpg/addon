import { Vec3 } from "../vendor/bedrock-boost.js";
import {
  EntityComponentTypes as EntityComponentTypes2,
  EquipmentSlot as EquipmentSlot3,
  Player as Player4,
  system as system11,
  world as world10
} from "@minecraft/server";
var CARRY_TAG = "shapescape_bewe_BACKPACK_CARRYING";
var DETACH_TAG = "shapescape_bewe_BACKPACK_DETACHING";
var DETACH_SOUND_TAG = "shapescape_bewe_BACKPACK_DETACHING_SOUND";
var MAX_HITS_TO_DESPAWN = 3;
var TICK_INTERVAL = 5;
var DETACH_TIME = 2;
var colors = [
  "white",
  "light_gray",
  "gray",
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "cyan",
  "light_blue",
  "blue",
  "purple",
  "magenta",
  "pink"
];
world10.afterEvents.playerSpawn.subscribe((event) => {
  detach(event.player);
});
world10.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const player = event.player;
  const item = event.itemStack?.typeId;
  const block = event.block;
  if (!item)
    return;
  if (item.startsWith("shapescape_bewe:backpack_") && !item.endsWith("default")) {
    player.runCommand(
      `execute positioned ${block.location.x} ${block.location.y} ${block.location.z} if block ~~~ minecraft:cauldron run function shapescape/bewe/backpack/undye`
    );
  }
});
system11.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.sourceEntity == void 0)
    return;
  if (event.id == "shapescape_bewe:backpack_get_name") {
    let name = event.sourceEntity.typeId;
    var letters = name.replace("shapescape_bewe:", "").split("");
    var result = letters.map(function(letter) {
      return "\xA7" + letter;
    });
    var formatted_name = result.join("").toUpperCase();
    event.sourceEntity.nameTag = `\xA7S\xA7H\xA7A\xA7P\xA7E\xA7S\xA7C\xA7A\xA7P\xA7E\xA7.\xA7I\xA7N\xA7V\xA7E\xA7N\xA7T\xA7O\xA7R\xA7Y\xA7.${formatted_name}\xA7.\xA7N\xA7A\xA7M\xA7E`;
  }
  if (event.id == "shapescape_bewe:backpack_undye") {
    const player = event.sourceEntity;
    const item = player.getComponent("equippable")?.getEquipment(EquipmentSlot3.Mainhand)?.typeId;
    if (item && item.startsWith("shapescape_bewe:backpack_") && !item.endsWith("default")) {
      let new_item = item;
      colors.forEach((color) => {
        if (new_item.includes(color)) {
          new_item = new_item.replace(color, "default");
        }
      });
      try {
        player.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${new_item}`);
      } catch {
      }
    }
  }
});
function detaching(player) {
  player.addTag(DETACH_TAG);
  let cooldown = Date.now() + DETACH_TIME * 1e3;
  let detach_sound = 1.5;
  let detaching2 = system11.runInterval(() => {
    if (player.isValid && player.isSneaking) {
      if (cooldown < Date.now()) {
        detach(player);
        player.removeTag(DETACH_TAG);
        system11.clearRun(detaching2);
      }
      if (player.hasTag(CARRY_TAG) && !player.hasTag(DETACH_SOUND_TAG) && detach_sound > 0.5) {
        player.addTag(DETACH_SOUND_TAG);
        let detach_sound_loop = system11.runInterval(() => {
          player.runCommand(`/playsound armor.equip_leather @s ~ ~ ~ 1 ${detach_sound}`);
          detach_sound -= 0.2;
          player.removeTag(DETACH_SOUND_TAG);
          system11.clearRun(detach_sound_loop);
        }, DETACH_TIME / 5 * 20);
      }
    } else {
      player.removeTag(DETACH_TAG);
      player.removeTag(DETACH_SOUND_TAG);
      system11.clearRun(detaching2);
    }
  });
}
function detach(player) {
  const riders = player.getComponent("rideable")?.getRiders() ?? [];
  player.removeTag(CARRY_TAG);
  player.removeTag(DETACH_TAG);
  player.removeTag(DETACH_SOUND_TAG);
  for (const rider of riders) {
    if (rider.typeId.includes("shapescape_bewe:backpack")) {
      rider.runCommand(`ride @s stop_riding`);
      const playerLoc = { x: player.location.x, y: player.location.y, z: player.location.z };
      const viewDir = Vec3.from(player.getViewDirection()).multiply(1.5).setY(0);
      const tpLocation = Vec3.from(playerLoc).add(viewDir);
      try {
        const block = player.dimension.getBlock(tpLocation);
        if (block && (block.isAir || block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water" || block.typeId.includes("minecraft:light_block"))) {
          rider.teleport(tpLocation);
        }
      } catch {
        continue;
      }
      system11.runTimeout(() => {
        try {
          rider.dimension.spawnParticle(`shapescape_bewe:backpack_impact`, rider.location);
        } catch {
        }
      }, 2);
    }
  }
}
function main() {
  for (let player of world10.getAllPlayers()) {
    if (player.hasTag(CARRY_TAG)) {
      if (!player.hasTag(DETACH_TAG) && player.isSneaking) {
        detaching(player);
      }
      const standing_space = player.getHeadLocation().y - player.location.y;
      if (player.isGliding) {
        player.runCommand(
          "execute positioned ~ ~1.5 ~ run event entity @e[family=shapescape_bewe:backpack,c=1] horizontal_glide"
        );
      } else if (standing_space < 1 || player.isSwimming || player.isSleeping) {
        player.runCommand("execute positioned ~ ~1.5 ~ run event entity @e[family=shapescape_bewe:backpack,c=1] horizontal");
      } else {
        player.runCommand("execute positioned ~ ~1.5 ~ run event entity @e[family=shapescape_bewe:backpack,c=1] vertical");
      }
    }
  }
}
world10.afterEvents.entityHitEntity.subscribe((event) => {
  const { damagingEntity, hitEntity: backpack } = event;
  if (!(damagingEntity instanceof Player4) || !backpack.typeId.includes(`shapescape_bewe:backpack`) || !backpack)
    return;
  const ignitedComp = backpack.getComponent(EntityComponentTypes2.IsIgnited);
  if (ignitedComp) {
    backpack.playAnimation(`animation.shapescape_bewe.backpack.hit`);
    let hitCount = backpack.getDynamicProperty("hits_to_despawn") ?? MAX_HITS_TO_DESPAWN;
    hitCount--;
    if (hitCount === MAX_HITS_TO_DESPAWN - 1) {
      system11.runTimeout(() => {
        if (!backpack.isValid)
          return;
        backpack.setDynamicProperty("hits_to_despawn", MAX_HITS_TO_DESPAWN);
      }, 60);
    }
    if (hitCount <= 0) {
      backpack.dimension.playSound(`armor.equip_leather`, backpack.location);
      backpack.triggerEvent(`shapescape_bewe:despawning`);
      return;
    } else {
      backpack.dimension.playSound(`armor.equip_leather`, backpack.location, {
        pitch: 1 + hitCount * 0.2
      });
      backpack.setDynamicProperty("hits_to_despawn", hitCount);
    }
  }
});
world10.afterEvents.entityLoad.subscribe((event) => {
  const entity = event.entity;
  if (!entity.typeId.includes(`shapescape_bewe:backpack`))
    return;
  entity.setDynamicProperty("hits_to_despawn", MAX_HITS_TO_DESPAWN);
});
system11.runInterval(main, TICK_INTERVAL);
