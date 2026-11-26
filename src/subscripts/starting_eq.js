import { world as world38 } from "@minecraft/server";
var DEBUG14 = false;
var NAMESPACE2 = "shapescape_bewe:";
var TAG4 = "eq";
var PATH_NAMESPACE2 = "shapescape/bewe/";
world38.afterEvents.playerSpawn.subscribe((event) => {
  givePlayerEq(event.player);
});
function givePlayerEq(player) {
  player.runCommand(
    `execute as @s[tag=!${NAMESPACE2.substring(
      0,
      NAMESPACE2.length - 1
    )}_${TAG4}] at @s run loot spawn ~ ~ ~ loot "${PATH_NAMESPACE2}starting_eq"`
  );
  player.runCommand(
    `tag @s[tag=!${NAMESPACE2.substring(0, NAMESPACE2.length - 1)}_${TAG4}] add ${NAMESPACE2.substring(
      0,
      NAMESPACE2.length - 1
    )}_${TAG4}`
  );
  if (DEBUG14) {
    world38.sendMessage(`Given Player Eq`);
  }
}
