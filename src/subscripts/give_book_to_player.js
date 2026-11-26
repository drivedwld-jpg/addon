import { world as world37 } from "@minecraft/server";
var DEBUG13 = false;
var NAMESPACE = "shapescape_bewe:";
var PATH_NAMESPACE = "shapescape/bewe/";
world37.afterEvents.playerSpawn.subscribe((event) => {
  givePlayerBook(event.player);
});
function givePlayerBook(player) {
  player.runCommand(
    `execute as @s[tag=!${NAMESPACE.substring(
      0,
      NAMESPACE.length - 1
    )}] at @s run loot spawn ~ ~ ~ loot "${PATH_NAMESPACE}guide_book"`
  );
  player.runCommand(
    `tag @s[tag=!${NAMESPACE.substring(
      0,
      NAMESPACE.length - 1
    )}] add ${NAMESPACE.substring(0, NAMESPACE.length - 1)}`
  );
  if (DEBUG13) {
    world37.sendMessage(`Given Player Book`);
  }
}
