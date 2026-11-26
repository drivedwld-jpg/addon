import { world as world35 } from "@minecraft/server";
var bookName = "guide_book";
var pageIdxGroupIdxAndGroupItemIdx = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0], [17, 0], [18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0]];
var groupIdxGroupName = ["first_page", "contents", "vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"];
var groupInfo = { "first_page": [{ "page_index": 0, "group_index": 0, "group_name": "first_page" }], "contents": [{ "page_index": 1, "group_index": 1, "group_name": "contents" }], "vitality_compass_start": [{ "page_index": 2, "group_index": 2, "group_name": "vitality_compass_start" }], "world_mechanic_start": [{ "page_index": 3, "group_index": 3, "group_name": "world_mechanic_start" }], "10": [{ "page_index": 4, "group_index": 4, "group_name": "10" }], "12": [{ "page_index": 5, "group_index": 5, "group_name": "12" }], "14": [{ "page_index": 6, "group_index": 6, "group_name": "14" }], "16": [{ "page_index": 7, "group_index": 7, "group_name": "16" }], "storms_start": [{ "page_index": 8, "group_index": 8, "group_name": "storms_start" }], "20": [{ "page_index": 9, "group_index": 9, "group_name": "20" }], "22": [{ "page_index": 10, "group_index": 10, "group_name": "22" }], "24": [{ "page_index": 11, "group_index": 11, "group_name": "24" }], "items_start": [{ "page_index": 12, "group_index": 12, "group_name": "items_start" }], "28": [{ "page_index": 13, "group_index": 13, "group_name": "28" }], "30": [{ "page_index": 14, "group_index": 14, "group_name": "30" }], "32": [{ "page_index": 15, "group_index": 15, "group_name": "32" }], "34": [{ "page_index": 16, "group_index": 16, "group_name": "34" }], "36": [{ "page_index": 17, "group_index": 17, "group_name": "36" }], "38": [{ "page_index": 18, "group_index": 18, "group_name": "38" }], "40": [{ "page_index": 19, "group_index": 19, "group_name": "40" }], "42": [{ "page_index": 20, "group_index": 20, "group_name": "42" }], "structures_start": [{ "page_index": 21, "group_index": 21, "group_name": "structures_start" }], "46": [{ "page_index": 22, "group_index": 22, "group_name": "46" }], "last_page": [{ "page_index": 23, "group_index": 23, "group_name": "last_page" }] };
var pageInteractions = [{ "min": [-0.85, 0.185], "max": [-0.66, 0.3], "responses": [{ "type": "set_page_group", "group_name": "first_page" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["contents", "vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [-0.85, 0.07], "max": [-0.66, 0.185], "responses": [{ "type": "set_page_group", "group_name": "contents" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [0.66, 0.09], "max": [0.85, 0.21], "responses": [{ "type": "set_page_group", "group_name": "contents" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page"] }, { "min": [-0.85, -0.04], "max": [-0.66, 0.07], "responses": [{ "type": "set_page_group", "group_name": "vitality_compass_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [0.66, -0.02], "max": [0.85, 0.09], "responses": [{ "type": "set_page_group", "group_name": "vitality_compass_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page", "contents"] }, { "min": [-0.85, -0.15], "max": [-0.66, -0.04], "responses": [{ "type": "set_page_group", "group_name": "world_mechanic_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [0.66, -0.13], "max": [0.85, -0.02], "responses": [{ "type": "set_page_group", "group_name": "world_mechanic_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page", "contents", "vitality_compass_start"] }, { "min": [-0.85, -0.26], "max": [-0.66, -0.15], "responses": [{ "type": "set_page_group", "group_name": "storms_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [0.66, -0.23], "max": [0.85, -0.13], "responses": [{ "type": "set_page_group", "group_name": "storms_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page", "contents", "vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16"] }, { "min": [-0.85, -0.37], "max": [-0.66, -0.26], "responses": [{ "type": "set_page_group", "group_name": "items_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["28", "30", "32", "34", "36", "38", "40", "42", "structures_start", "46", "last_page"] }, { "min": [0.66, -0.33], "max": [0.85, -0.23], "responses": [{ "type": "set_page_group", "group_name": "items_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page", "contents", "vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24"] }, { "min": [-0.85, -0.48], "max": [-0.66, -0.37], "responses": [{ "type": "set_page_group", "group_name": "structures_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["46", "last_page"] }, { "min": [0.66, -0.48], "max": [0.85, -0.33], "responses": [{ "type": "set_page_group", "group_name": "structures_start" }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }], "group_name": ["first_page", "contents", "vitality_compass_start", "world_mechanic_start", "10", "12", "14", "16", "storms_start", "20", "22", "24", "items_start", "28", "30", "32", "34", "36", "38", "40", "42"] }, { "min": [-0.85, -0.6], "max": [0.85, 0.45], "responses": [{ "type": "run_command", "as": "book", "command": "/particle shapescape_bewe:click" }] }, { "min": [-0.65, -0.6], "max": [0, 0.37], "responses": [{ "type": "previous_page_group", "wrap": false }, { "type": "run_command", "as": "book", "command": 'titleraw @a[r=10] actionbar {"rawtext":[{"translate":"shapescape_bewe.actionbar.guide_book.hint_previous", "with": ["\\n"]}]}' }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }] }, { "min": [0, -0.6], "max": [0.65, 0.37], "responses": [{ "type": "next_page_group", "wrap": false }, { "type": "run_command", "as": "book", "command": 'titleraw @a[r=10] actionbar {"rawtext":[{"translate":"shapescape_bewe.actionbar.guide_book.hint_next", "with": ["\\n"]}]}' }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }] }, { "min": [-0.65, -0.6], "max": [0, 0.37], "group_name": ["first_page"], "responses": [{ "type": "previous_page_group", "wrap": true }, { "type": "run_command", "as": "book", "command": 'titleraw @a[r=10] actionbar {"rawtext":[{"translate":"shapescape_bewe.actionbar.guide_book.hint_last", "with": ["\\n"]}]}' }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }] }, { "min": [0, -0.6], "max": [0.65, 0.37], "group_name": ["last_page"], "responses": [{ "type": "next_page_group", "wrap": true }, { "type": "run_command", "as": "book", "command": 'titleraw @a[r=10] actionbar {"rawtext":[{"translate":"shapescape_bewe.actionbar.guide_book.hint_first", "with": ["\\n"]}]}' }, { "type": "run_command", "as": "book", "command": "/playsound item.book.page_turn @a[r=10]" }] }];
function getGroupInfo(groupName) {
  const group = groupInfo[groupName];
  if (!Array.isArray(group)) {
    return void 0;
  }
  return group;
}
function getGroupName(entity) {
  const index = entity.getProperty("shapescape_bewe:active_texture")?.valueOf();
  if (typeof index != "number") {
    return void 0;
  }
  const [groupIdx, pageIdx] = pageIdxGroupIdxAndGroupItemIdx[index];
  return [groupIdxGroupName[groupIdx], pageIdx];
}
function setGroup(entity, groupName) {
  const group = getGroupInfo(groupName);
  if (group == void 0) {
    return;
  }
  if (group.length == 1) {
    entity.setProperty("shapescape_bewe:active_texture", group[0].page_index);
    return;
  }
  entity.runCommand(`function ${bookName}/get_${groupName}_state_value`);
  const stateIdx = world35.scoreboard.getObjective("shapescape_bewe_tmp_var")?.getScore("STATE")?.valueOf();
  if (typeof stateIdx != "number") {
    return;
  }
  entity.setProperty("shapescape_bewe:active_texture", group[stateIdx].page_index);
}
function setNextGroup(entity, wrap) {
  const groupNameAndPageIndex = getGroupName(entity);
  if (groupNameAndPageIndex == void 0) {
    return;
  }
  const groupName = groupNameAndPageIndex[0];
  const group = getGroupInfo(groupName);
  if (group == void 0) {
    return;
  }
  let nextGroupIdx = group[0].group_index + 1;
  if (nextGroupIdx >= groupIdxGroupName.length) {
    if (!wrap) {
      return;
    }
    nextGroupIdx = 0;
  }
  setGroup(entity, groupIdxGroupName[nextGroupIdx]);
}
function setPreviousGroup(entity, wrap) {
  const groupNameAndPageIndex = getGroupName(entity);
  if (groupNameAndPageIndex == void 0) {
    return;
  }
  const groupName = groupNameAndPageIndex[0];
  const group = getGroupInfo(groupName);
  if (group == void 0) {
    return;
  }
  let prevGroupIdx = group[0].group_index - 1;
  if (prevGroupIdx < 0) {
    if (!wrap) {
      return;
    }
    prevGroupIdx = groupIdxGroupName.length - 1;
  }
  setGroup(entity, groupIdxGroupName[prevGroupIdx]);
}
function runPageInteraction(entity, player, x, y, interactionPoint) {
  const group = getGroupName(entity);
  if (group == void 0) {
    return;
  }
  const [groupName, pageIndex] = group;
  for (const pageInteraction of pageInteractions) {
    const [minX, minY] = pageInteraction.min;
    const [maxX, maxY] = pageInteraction.max;
    if (pageInteraction.group_name != void 0 && pageInteraction.group_name.includes(groupName) == false) {
      continue;
    }
    if (pageInteraction.group_item_index != void 0 && pageInteraction.group_item_index.includes(pageIndex) == false) {
      continue;
    }
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      for (const event of pageInteraction.responses) {
        switch (event.type) {
          case "previous_page_group":
            setPreviousGroup(entity, event.wrap ?? false);
            break;
          case "next_page_group":
            setNextGroup(entity, event.wrap ?? false);
            break;
          case "run_command":
            let { x: ipx, y: ipy, z: ipz } = interactionPoint;
            ipx = Math.round(ipx * 100) / 100;
            ipy = Math.round(ipy * 100) / 100;
            ipz = Math.round(ipz * 100) / 100;
            if (event.as == "book") {
              const command = `execute positioned ${ipx} ${ipy} ${ipz} run ${event.command}`;
              entity.runCommand(command);
            } else {
              const command = `execute positioned ${ipx} ${ipy} ${ipz} run ${event.command}`;
              player.runCommand(command);
            }
            break;
          case "set_page_group":
            setGroup(entity, event.group_name);
            break;
        }
      }
      if (pageInteraction.break) {
        break;
      }
    }
  }
}

// Exports consumed by subscripts/guide_book_interaction.js
export { bookName, runPageInteraction };
