import { world as world15 } from "@minecraft/server";
world15.afterEvents.worldLoad.subscribe(() => {
  defaultInit();
});
function defaultInit() {
  let scoreboard = world15.scoreboard.getObjective("shapescape_bewe_tmp");
  if (scoreboard == void 0) {
    world15.getDimension("overworld").runCommand("function shapescape/bewe/init");
  }
}
