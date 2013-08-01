focusingPoke = [0, 0];
focusingMove = 0;
focusingSide = 0;
focusingStatSide = -1;
pokemonList = [];
damageResults = [];

function init(){
  for(var i=0; i<12; i++){
    pokemonList[i] = new Pokemon();
  }
  for(var i=0; i<4; i++){
    damageResults[i] = new DamageResult();
  }
  focusOnMove(0);
  focusOnSide(0);
  focusOnPoke(1,0);
  focusOnPoke(0,0);
  document.getElementById("side0nametext").focus();
}
function submitForm(){
  if(focusingStatSide != -1){
    setPokemonDataFromCurrent(focusingStatSide);
  }
  var aPokemon = pokemonList[focusingSide*6+focusingPoke[focusingSide]];
  var dPokemon = pokemonList[(1-focusingSide)*6+focusingPoke[(1-focusingSide)]];
  if(pokemonList[0*6+focusingPoke[0]].dexid > 0 && pokemonList[1*6+focusingPoke[1]].dexid > 0 && pokemonList[focusingSide*6+focusingPoke[focusingSide]].moves[focusingMove] > 0) {
    setFieldConditions();
    // Calculate Damage
    // res = [[-1,-1],[-1,-1],[-1,-1],[-1,-1]];
    // for(var i=0; i<4; i++){
    //   for(var j=0; j<2; j++){
    //     calculateDamage(aPokemon,dPokemon,i,15*j);
    //     res[i][j] = damageResults[i].damage;
    //   }
    // }
    res = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    for(var i=0; i<16; i++){
      calculateDamage(aPokemon,dPokemon,aPokemon.focusingMove,i);
      res[i] = damageResults[aPokemon.focusingMove].damage;
    }
    // Output Results
    if(res[0] > -1 && res[15] > -1){
      createResultHTML(aPokemon.focusingMove, res);
    }
  }
}
function setPokemonDataFromCurrent(side){
  var newPokemonFlag = false;
  var focusingPokemon = pokemonList[side*6+focusingPoke[side]];
  // Pokemon Species
  var dexid = arrayToId(document.getElementById('side' + side + 'nametext').value, pokemonNames);
  if(focusingPokemon.dexid != dexid){
    newPokemonFlag = true;
  }
  focusingPokemon.dexid = dexid > 0 ? dexid : 0;
  // Pokemon Image
  setPokemonImage(side,focusingPoke[side]);
  // Nature
  if(newPokemonFlag){
    if(baseData[dexid*6+1] > baseData[dexid*6+3]){
      document.getElementById("side" + side + "naturetext").value = natureNames[2];
    } else if(baseData[dexid*6+1] < baseData[dexid*6+3]){
      document.getElementById("side" + side + "naturetext").value = natureNames[10];
    }
  }
  focusingPokemon.nature = arrayToId(document.getElementById('side' + side + 'naturetext').value, natureNames);
  // Ability
  if(newPokemonFlag){
    if(dexid == 186 || dexid == 38){
      document.getElementById("side" + side + "abilitytext").value = abilityNames[abilityList[focusingPokemon.dexid*3+2]];
    } else {
      document.getElementById("side" + side + "abilitytext").value = abilityNames[abilityList[focusingPokemon.dexid*3+0]];
    }
  }
  focusingPokemon.ability = arrayToId(document.getElementById('side' + side + 'abilitytext').value, abilityNames);
  // Item
  focusingPokemon.item = arrayToId(document.getElementById('side' + side + 'itemtext').value, itemNames);
  // EV/IVs
  if(newPokemonFlag){
    if(baseData[dexid*6+1] > baseData[dexid*6+3]){
      document.getElementById('side' + side + 'ev' + 1).value = 252;
    } else if(baseData[dexid*6+1] < baseData[dexid*6+3]){
      document.getElementById('side' + side + 'ev' + 3).value = 252;
    }
  }
  for(var i=0;i<6;i++){
    var iv = document.getElementById('side' + side + 'iv' + i).value;
    focusingPokemon.iv[i] = !isNaN(parseInt(iv)) ? (0 <= parseInt(iv) && parseInt(iv) <= 31)  ? parseInt(iv) : 0 : 0;
    var ev = document.getElementById('side' + side + 'ev' + i).value;
    focusingPokemon.ev[i] = !isNaN(parseInt(ev)) ? (0 <= parseInt(ev) && parseInt(ev) <= 252) ? parseInt(ev) : 0 : 0;
  }

  // Moves
  for(var i=0;i<4;i++){
    var id = 'move' + i + 'text';
    focusingPokemon.moves[i] = arrayToId(document.getElementById(id).value, moveNames);
  }
  // Update textbox contents
  updatePokemonFieldContents(side);
  updateMoveFieldContents(focusingSide);

  // Set the weather
  if(newPokemonFlag){
    switch(focusingPokemon.ability){
      // Sunshine
      case 70:
      changeWeather(1);
      break;
      // Rain
      case 2:
      changeWeather(2);
      break;
      // Sandstorm
      case 45:
      changeWeather(3);
      break;
      // Hail
      case 117:
      changeWeather(4);
      break;
    }
  }
}
function updatePokemonFieldContents(side){
  var focusingPokemon = pokemonList[side*6+focusingPoke[side]];
  // Name textbox
  document.getElementById('side' + side + 'nametext').value = focusingPokemon.dexid > 0 ? pokemonNames[focusingPokemon.dexid] : '';
  // Nature
  document.getElementById('side' + side + 'naturetext').value = focusingPokemon.nature > -1 ? natureNames[focusingPokemon.nature] : '';
  // Ability
  document.getElementById('side' + side + 'abilitytext').value = focusingPokemon.ability > -1 ? abilityNames[focusingPokemon.ability] : '';
  for(var i=0;i<3;i++){
    document.getElementById("side" + side + "ability" + i).innerHTML = abilityNames[abilityList[focusingPokemon.dexid * 3 + i]];
  }
  // Item
  document.getElementById('side' + side + 'itemtext').value = focusingPokemon.item > -1 ? itemNames[focusingPokemon.item] : '';
  // EV/IV
  for(var i=0; i<6; i++){
    var id = 'side' + side + 'iv' + i;
    document.getElementById(id).value = focusingPokemon.iv[i];
    var id = 'side' + side + 'ev' + i;
    document.getElementById(id).value = focusingPokemon.ev[i] == 0 ? '' : focusingPokemon.ev[i];
  }
  // Stat condition changes
  toggleConds(side,focusingPokemon.aBoost+13);
  toggleConds(side,focusingPokemon.dBoost+26);
  document.getElementById('side' + side + 'cond' + 1).style.display = focusingPokemon.health == 4 ? '' : 'none';
  document.getElementById('side' + side + 'cond' + 5).style.display = focusingPokemon.isLightScreen ? '' : 'none';
  document.getElementById('side' + side + 'cond' + 6).style.display = focusingPokemon.isReflect ? '' : 'none';
  // Base Stat/Status boxes
  var dexid = focusingPokemon.dexid > -1 ? focusingPokemon.dexid : 0;
  for(var i=0; i<6; i++){
    document.getElementById('side' + side + 'basestat' + i).innerHTML = baseData[6*focusingPokemon.dexid+i];
    document.getElementById('side' + side + 'stat' + i).innerHTML = focusingPokemon.getStatus(i);
  }
  // Types
  var typeText = "";
  if(typeData[2*dexid+0] != 18){
    typeText = '<span class="label" style="background:' + typeSchemes[typeData[2*dexid+0]] + '">' + typeNames[typeData[2*dexid+0]] + '</span>';
  }
  if(typeData[2*dexid+1] != 18){
    typeText = typeText + ' <span class="label" style="background:' + typeSchemes[typeData[2*dexid+1]] + '">' + typeNames[typeData[2*dexid+1]] + '</span>';
  }
  document.getElementById('side' + side + 'type').innerHTML = typeText;
}
function updateMoveFieldContents(side){
  var focusingPokemon = pokemonList[side*6+focusingPoke[side]];
  // Move textboxes
  for(var i=0; i<4; i++){
    var id = 'move' + i + 'text';
    document.getElementById(id).value = focusingPokemon.moves[i] > 0 ? moveNames[focusingPokemon.moves[i]] : '';
  }
  focusOnMove(focusingPokemon.focusingMove);
}
function setPokemonImage(side,target){
  document.getElementById('side' + side + 'poke' + target + 'icon').src = pokemonList[side*6+target].dexid > 0 ? './image/poke/images' + ('00' + pokemonList[side*6+target].dexid).slice(-3) + 'MS.png' : './image/pokeball.png';
  flashPokemon(side*6+target);
}
function flashPokemon(target){
  var id = 'side' + (target < 6 ? 0 : 1) + 'poke' + (target%6);
  var duration = 60;
  setTimeout(function(){ document.getElementById(id).className = 'flashingPokemon'; }, 1+duration*0);
  setTimeout(function(){ document.getElementById(id).className = 'focusedPokemon'; }, 1+duration*1);
  setTimeout(function(){ document.getElementById(id).className = 'flashingPokemon'; }, 1+duration*2);
  setTimeout(function(){ document.getElementById(id).className = 'focusedPokemon'; }, 1+duration*3);
  setTimeout(function(){ document.getElementById(id).className = focusingPoke[(target < 6 ? 0 : 1)] == target%6 ? 'focusedPokemon' : 'notFocusedPokemon'; }, 1+duration*4);
}
function focusOnMove(target){
  for(var i=0; i<2; i++){
    for(var j=0; j<2; j++){
      var id = 'move' + (i*2+j) + 'div';
      if(target == i*2+j){
        focusingMove = i*2+j;
        pokemonList[focusingSide*6+focusingPoke[focusingSide]].focusingMove = i*2+j;
       document.getElementById(id).className = "focusedMove";
      } else {
       document.getElementById(id).className = "notFocusedMove";
      }
    }
  }
  // Lighten up the EV/IV textboses
  // var moveId = pokemonList[focusingSide*6+focusingPoke[focusingSide]].moves[target];
  // if(moveData[moveId*moveDataLength+2] == 1){
  //   for(var i=0; i<6; i++){
  //     document.getElementById('side' +     focusingSide + 'iv' + i).className = (i == 1 ? "focused" : "");
  //     document.getElementById('side' +     focusingSide + 'ev' + i).className = (i == 1 ? "focused" : "");
  //     document.getElementById('side' + (1-focusingSide) + 'iv' + i).className = (i == 0 || i == 2 ? "focused" : "");
  //     document.getElementById('side' + (1-focusingSide) + 'ev' + i).className = (i == 0 || i == 2 ? "focused" : "");
  //   }
  // } else if(moveData[moveId*moveDataLength+2] == 2){
  //   for(var i=0; i<6; i++){
  //     document.getElementById('side' +     focusingSide + 'iv' + i).className = (i == 3 ? "focused" : "");
  //     document.getElementById('side' +     focusingSide + 'ev' + i).className = (i == 3 ? "focused" : "");
  //     document.getElementById('side' + (1-focusingSide) + 'iv' + i).className = (i == 0 || i == 4 ? "focused" : "");
  //     document.getElementById('side' + (1-focusingSide) + 'ev' + i).className = (i == 0 || i == 4 ? "focused" : "");
  //   }
  // } else {
  //   for(var i=0; i<6; i++){
  //     document.getElementById('side' +     focusingSide + 'iv' + i).className = "";
  //     document.getElementById('side' +     focusingSide + 'ev' + i).className = "";
  //     document.getElementById('side' + (1-focusingSide) + 'iv' + i).className = "";
  //     document.getElementById('side' + (1-focusingSide) + 'ev' + i).className = "";
  //   }
  // }
}
function focusOnSide(target){
  var id = 'side' + target + 'container';
  var idInv = 'side' + (1-target) + 'container';
  focusingSide = target;
  document.getElementById(id).className = 'sideContainer focused';
  document.getElementById(idInv).className = 'sideContainer unFocused';
  if(target == 0) {
    document.getElementById("movechoice").className = "triangle-isosceles top"
  } else {
    document.getElementById("movechoice").className = "triangle-isosceles"
  }
  updateMoveFieldContents(target);
}
function focusOnPoke(side, target){
  // Party selection buttons
  for(var i=0; i<6; i++){
    var id = 'side' + side + 'poke' + i;
    if(target == i){
      document.getElementById(id).className = 'focusedPokemon';
      focusingPoke[side] = i;
    } else {
      document.getElementById(id).className = 'notFocusedPokemon';
    }
  }
  updatePokemonFieldContents(side);
  if(side == focusingSide){
    updateMoveFieldContents(side);
  }
}
function setFieldConditions(){
  isCritical = document.getElementById("isCritical").checked;
  isHelpingHand = document.getElementById("isHelpingHand").checked;
  isDoubleBattle = document.getElementById("isDoubleBattle").checked;
  var a = document.getElementsByName("level");
  for(var i=0; i<a.length; i++){
    if(a[i].checked){
      level = 50 + i * 50;
      break;
    }
  }
  a = document.getElementsByName("weather");
  for(var i=0; i<a.length; i++){
    if(a[i].checked){
      weather = i;
      break;
    }
  }
}
function chooseNature(side,target){
  document.getElementById("side" + side + "naturetext").value = natureNames[target];
  setPokemonDataFromCurrent(side);
}
function chooseAbility(side,target){
  var focusingPokemon = pokemonList[side*6+focusingPoke[side]];
  document.getElementById("side" + side + "abilitytext").value = abilityNames[abilityList[focusingPokemon.dexid*3+target]];
  setPokemonDataFromCurrent(side);
}
function chooseItem(side,target){
  document.getElementById("side" + side + "itemtext").value = itemNames[target];
  setPokemonDataFromCurrent(side);
}
function changeWeather(target){
  var weatherImages = ["normal.jpg", "sunshine.jpg", "rain.jpg", "sandstorm.jpg", "hail.jpg"];
  document.body.style.background = "url(./image/" + weatherImages[target] + ") top left no-repeat fixed";
  for(var i=0; i<5; i++){
    document.getElementById("weather" + i).checked = (target == i);
  }
}
function toggleStats(side){
  id = 'side' + side +'stats';
  if(document.getElementById(id).style.display == 'none'){
    document.getElementById(id).style.display = '';
  } else {
    document.getElementById(id).style.display = 'none';
  }
}
function toggleConds(side,cond){
  var focusingPokemon = pokemonList[side*6+focusingPoke[side]];
  if(cond == 1){
    focusingPokemon.health = focusingPokemon.health == 4 ? 0 : 4;
    var id = 'side' + side +'cond' + cond;
  } else if(cond == 5){
    for(var i=0; i<6; i++){
      pokemonList[side*6+i].isLightScreen = !pokemonList[side*6+i].isLightScreen;
    }
    var id = 'side' + side +'cond' + cond;
  } else if(cond == 6){
    for(var i=0; i<6; i++){
      pokemonList[side*6+i].isReflect = !pokemonList[side*6+i].isReflect;
    }
    var id = 'side' + side +'cond' + cond;
  } else if(7 <= cond && cond <= 19){
    var id = 'side' + side +'cond3';
    document.getElementById(id).style.display = cond - 13 == 0 ? 'none' : '';
    document.getElementById(id).innerHTML = statNames2[0] + (cond - 13 > 0 ? '+' : '') + (cond - 13);
    focusingPokemon.aBoost = cond - 13;
    id = "";
  } else if(20 <= cond && cond <= 32){
    var id = 'side' + side +'cond4';
    document.getElementById(id).style.display = cond - 26 == 0 ? 'none' : '';
    document.getElementById(id).innerHTML = statNames2[1] + (cond - 26 > 0 ? '+' : '') + (cond - 26);
    focusingPokemon.dBoost = cond - 26;
    id = "";
  } else {
    var id = 'side' + side +'cond' + cond;
  }
  if(id != ""){
    if(document.getElementById(id).style.display == 'none'){
      document.getElementById(id).style.display = '';
    } else {
      document.getElementById(id).style.display = 'none';
    }
  }
}


function printParty(side){
  var out = [];
  for(var i=0+side*6; i<6+side*6; i++){
    out.push(pokemonList[i]);
  }
  document.getElementById('partyText').value = JSON.stringify(out);
}
function setParty(side){
  try {
    var input = eval(document.getElementById('partyText').value);
    var flag = true;
    for(var i=0; i<6; i++){
      flag = flag && ("dexid" in input[i]);
      flag = flag && ("iv" in input[i]);
      flag = flag && ("ev" in input[i]);
      flag = flag && ("nature" in input[i]);
      flag = flag && ("ability" in input[i]);
      flag = flag && ("moves" in input[i]);
      flag = flag && ("health" in input[i]);
      flag = flag && ("item" in input[i]);
      if(!flag){ break; }
      flag = flag && (input[i].iv.length == 6);
      flag = flag && (input[i].ev.length == 6);
      flag = flag && (input[i].moves.length == 4);
      if(!flag){ break; }
      flag = flag && isFinite(input[i].dexid);
      flag = flag && isFinite(input[i].nature);
      flag = flag && isFinite(input[i].ability);
      flag = flag && isFinite(input[i].health);
      flag = flag && isFinite(input[i].item);
      for(var j=0; j<6; j++){
        flag = flag && isFinite(input[i].iv[j]);
        flag = flag && isFinite(input[i].ev[j]);
      }
      for(var j=0; j<4; j++){
        flag = flag && isFinite(input[i].moves[j]);
      }
      if(!flag){ break; }
    }
    if(flag){
      for(var i=0; i<6; i++){
        pokemonList[side*6+i].dexid = input[i].dexid;
        pokemonList[side*6+i].iv = input[i].iv;
        pokemonList[side*6+i].ev = input[i].ev;
        pokemonList[side*6+i].nature = input[i].nature;
        pokemonList[side*6+i].ability = input[i].ability;
        pokemonList[side*6+i].moves = input[i].moves;
        pokemonList[side*6+i].health = input[i].health;
        pokemonList[side*6+i].item = input[i].item;
      }
      updatePokemonFieldContents(side);
      updateMoveFieldContents(side);
      for(var i=0; i<6; i++){
        setPokemonImage(side,i);
      }
    } else {
      throw new UserException("BrokenParty");
    }
  } catch(e){
    setPartyPS(side);
  }
}
function setPartyPS(side){
  var flag = false;
  var input = parseText(document.getElementById('partyText').value,false);
  for(var i=0; i<6; i++){
    if(input[i].species){
      pokemonList[side*6+i].dexid = arrayToId(input[i].species, pokemonNames);
    }
    if(input[i].nature){
      pokemonList[side*6+i].nature = arrayToId(input[i].nature, natureNames);
    }
    if(input[i].ability){
      pokemonList[side*6+i].ability = arrayToId(input[i].ability, abilityNames);
    }
    if(input[i].item){
      pokemonList[side*6+i].item = arrayToId(input[i].item.replace(/_/, " "), itemNames);
    }
    if(input[i].moves){
      for(var j=0; j<6; j++){
        if(input[i].moves[j]){
          pokemonList[side*6+i].moves[j] = arrayToId(input[i].moves[j], moveNames);
        }
      }
    }
    if(input[i].moves){
      for(var j=0; j<6; j++){
        if(input[i].moves[j]){
          pokemonList[side*6+i].moves[j] = arrayToId(input[i].moves[j], moveNames);
        }
      }
    }
    var idToBattleStats = ["hp","atk","def","spa","spd","spe"];
    if(input[i].ivs){
      for(var j=0; j<6; j++){
        if(input[i].ivs[idToBattleStats[j]]){
          pokemonList[side*6+i].iv[j] = input[i].ivs[idToBattleStats[j]];
        }
      }      
    }
    if(input[i].evs){
      for(var j=0; j<6; j++){
        if(input[i].evs[idToBattleStats[j]]){
          pokemonList[side*6+i].ev[j] = input[i].evs[idToBattleStats[j]];
        }
      }      
    }
  }
  if(flag){
    alert(partyBrokenMessage);
  }
  updatePokemonFieldContents(side);
  updateMoveFieldContents(side);
  for(var i=0; i<6; i++){
    setPokemonImage(side,i);
  }
}
function arrayToId(name, array){
  for(var i=0; i<array.length; i++){
    if(name.toUpperCase() == array[i].toUpperCase()){
      return i;
    }
  }
  return -1;
}
function getFocusingPokemon(side){
  return pokemonList[side*6+focusingPoke[side]];
}
function captureArrowKey(side, keyCode){
  // Shift+Tab
  switch(keyCode) {
    //up
    case 38:
    break;
    //down
    case 40:
    break;
  }
}
function captureTab(side, keyCode, shiftKey){
  // Shift+Tab
  if(shiftKey && keyCode == 9) {
    setTimeout(function(){ document.getElementById("side" + side + "nametext").focus(); }, 1);
    if(0 < focusingPoke[side]){
      focusingPoke[side]--;
    }
    focusOnPoke(side,focusingPoke[side]);
  // Tab
  } else if(keyCode == 9) {
    setTimeout(function(){ document.getElementById("side" + side + "nametext").focus(); }, 1);
    if(focusingPoke[side] < 5){
      focusingPoke[side]++;
    }
    focusOnPoke(side,focusingPoke[side]);
  }
}