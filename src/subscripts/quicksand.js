import {
  system as system32,
  world as world32,
  EntityDamageCause as EntityDamageCause9
} from "@minecraft/server";
system32.runInterval(() => {
  const players = world32.getPlayers();
  for (const player of players) {
    let block;
    let blockAbove;
    try {
      block = player.dimension.getBlock(player.location);
      blockAbove = player.dimension.getBlock(player.location);
    } catch {
    }
    if (blockAbove && block && block.typeId.includes("shapescape_bewe:") && block.typeId.includes("quicksand")) {
      player.addEffect(`minecraft:slow_falling`, 10, {
        amplifier: 0,
        showParticles: false
      });
      const velocityThreshold = 0.05;
      const velocity = player.getVelocity();
      if (Math.abs(velocity.x) > velocityThreshold || Math.abs(velocity.y) > velocityThreshold || Math.abs(velocity.z) > velocityThreshold) {
        const yVelocity = velocity.y > 0 ? Math.min(Math.max(velocity.y, 0), 1) : Math.min(Math.max(velocity.y, -1), 0);
        player.applyKnockback(
          { x: -velocity.x * 1, z: -velocity.z * 1 },
          -yVelocity * 1
        );
      }
      const fullInQuicksand = (blockAbove.typeId === "shapescape_bewe:quicksand" || blockAbove.typeId === "shapescape_bewe:red_quicksand") && (block.typeId === "shapescape_bewe:quicksand" || block.typeId === "shapescape_bewe:red_quicksand");
      if (fullInQuicksand && system32.currentTick % 40 === 0) {
        player.applyDamage(1, {
          cause: EntityDamageCause9.drowning
        });
      }
    }
  }
}, 1);
var modifiedQuicksandBlocks = /* @__PURE__ */ new Map();
var playerCameraBlocks = /* @__PURE__ */ new Map();
function getBlockKey(location) {
  return `${Math.floor(location.x)},${Math.floor(location.y)},${Math.floor(
    location.z
  )}`;
}
function getCameraLocation(player) {
  const headLocation = player.getHeadLocation();
  return {
    x: Math.floor(headLocation.x),
    y: Math.floor(headLocation.y),
    z: Math.floor(headLocation.z)
  };
}
function isQuicksandBlock(block) {
  return block?.typeId === "shapescape_bewe:quicksand" || block?.typeId === "shapescape_bewe:red_quicksand";
}
function setQuicksandInvisible(block, player) {
  try {
    const currentState = block.permutation.getState(
      "shapescape_bewe:player_inside"
    );
    if (!currentState) {
      const newPermutation = block.permutation.withState(
        "shapescape_bewe:player_inside",
        true
      );
      player.dimension.setBlockPermutation(block.location, newPermutation);
      const blockKey = getBlockKey(block.location);
      modifiedQuicksandBlocks.set(blockKey, {
        location: block.location,
        dimension: player.dimension.id
      });
    }
  } catch (error) {
    console.warn("Failed to set quicksand invisible:", error);
  }
}
function setQuicksandVisible(blockLocation, dimension) {
  try {
    const block = dimension.getBlock(blockLocation);
    if (block && isQuicksandBlock(block)) {
      const newPermutation = block.permutation.withState(
        "shapescape_bewe:player_inside",
        false
      );
      dimension.setBlockPermutation(blockLocation, newPermutation);
    }
  } catch (error) {
    console.warn("Failed to restore quicksand visibility:", error);
  }
}
system32.runInterval(() => {
  for (const player of world32.getAllPlayers()) {
    const cameraLocation = getCameraLocation(player);
    const currentBlock = player.dimension.getBlock(cameraLocation);
    const currentBlockKey = getBlockKey(cameraLocation);
    const lastCameraBlockKey = playerCameraBlocks.get(player.id);
    if (lastCameraBlockKey !== currentBlockKey) {
      if (lastCameraBlockKey && modifiedQuicksandBlocks.has(lastCameraBlockKey)) {
        const lastBlockData = modifiedQuicksandBlocks.get(lastCameraBlockKey);
        setQuicksandVisible(lastBlockData.location, player.dimension);
        modifiedQuicksandBlocks.delete(lastCameraBlockKey);
      }
      playerCameraBlocks.set(player.id, currentBlockKey);
    }
    if (currentBlock && isQuicksandBlock(currentBlock)) {
      setQuicksandInvisible(currentBlock, player);
    }
  }
}, 1);
system32.runInterval(() => {
  const activePlayers = new Set(world32.getAllPlayers().map((p) => p.id));
  const activePlayerCameraBlocks = new Set(
    Array.from(playerCameraBlocks.entries()).filter(([playerId]) => activePlayers.has(playerId)).map(([, blockKey]) => blockKey)
  );
  for (const [blockKey, blockData] of modifiedQuicksandBlocks.entries()) {
    if (!activePlayerCameraBlocks.has(blockKey)) {
      try {
        const dimension = world32.getDimension(blockData.dimension);
        setQuicksandVisible(blockData.location, dimension);
        modifiedQuicksandBlocks.delete(blockKey);
      } catch (error) {
        modifiedQuicksandBlocks.delete(blockKey);
      }
    }
  }
  for (const playerId of playerCameraBlocks.keys()) {
    if (!activePlayers.has(playerId)) {
      playerCameraBlocks.delete(playerId);
    }
  }
}, 60);
world32.afterEvents.worldLoad.subscribe(() => {
  for (const [blockKey, blockData] of modifiedQuicksandBlocks.entries()) {
    try {
      const dimension = world32.getDimension(blockData.dimension);
      setQuicksandVisible(blockData.location, dimension);
    } catch (error) {
      console.warn("Failed to restore block during initialization:", error);
    }
  }
  modifiedQuicksandBlocks.clear();
  playerCameraBlocks.clear();
});
