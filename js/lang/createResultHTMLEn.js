function createResultHTML(resultSlot, res){
  var resultHPPercentLower = (damageResults[resultSlot].stats[2]-res[15])*100.0/damageResults[resultSlot].stats[2];
  var resultHPPercentUpper = (damageResults[resultSlot].stats[2]-res[0])*100.0/damageResults[resultSlot].stats[2];
  var barColor = (52.01 > resultHPPercentLower ?  21.00 > resultHPPercentLower ? 'bar-danger' : 'bar-warning' : 'bar-success');
  var resultHPWidth = Math.ceil(3.1*(resultHPPercentLower > 0 ? resultHPPercentLower : 0));
  var resultHPWidthFluc = Math.ceil(3.1*(resultHPPercentUpper > 0 ? resultHPPercentUpper - resultHPPercentLower : 0));
  var lowerBound = (100 - resultHPPercentUpper);
  var upperBound = (100 - resultHPPercentLower);
  lowerBound = (lowerBound + '').substring(0,lowerBound >= 100 ? 5 : 4);
  upperBound = (upperBound + '').substring(0,upperBound >= 100 ? 5 : 4);
  document.getElementById('resultView' + resultSlot).innerHTML = ''
  + '<tr>'
  + '<td width="30px" class="outputButton" align="center">'
  + '<img src="./image/poke/images' + ('00' + damageResults[resultSlot].pokeId[0]).slice(-3) + 'MS.png" alt="' + pokemonNames[damageResults[resultSlot].pokeId[0]] + '">→<img src="./image/poke/images' + ('00' + damageResults[resultSlot].pokeId[1]).slice(-3) + 'MS.png" alt="' + pokemonNames[damageResults[resultSlot].pokeId[1]] + '"><br>'
  + '</td>'
  + '<td>'
  + '<table border="0">'
  + '<tr>'
  + '<br>'
  + '<b>' + moveNames[damageResults[resultSlot].moveId] + '</b>&nbsp;<img src="./image/' + (damageResults[resultSlot].aCategory == 1 ? 'physical' : 'special') + '.png"  alt="' + (damageResults[resultSlot].aCategory == 1 ? 'Physical' : 'Special') + '">'
  + '&nbsp;<span class="label" style="background:' + typeSchemes[damageResults[resultSlot].moveType] + '">BPW' + damageResults[resultSlot].basePower + '/' + typeNames[damageResults[resultSlot].moveType] + '</span><br>'
//  + '<br>'
  + (damageResults[resultSlot].aCategory == 1 ? 'Atk' : 'SAtk') + damageResults[resultSlot].stats[0] + ' → ' + (damageResults[resultSlot].dCategory == 1 ? 'Def' : 'SDef') + damageResults[resultSlot].stats[1] + ' HP' + damageResults[resultSlot].stats[2]
//  + '　天候:' + weatherNames[weather] + '<br>'
  + '<br>'
//  + '倍率:1*1.5<br>'
//  + ' <span class="label label-warning">確定2</span> (82.8%〜97.7%)<br>'
  + '<b>' + res[0] + '-' + res[15] + '</b> (' + lowerBound + '%〜' + upperBound + '%)'
  + '&nbsp;<span class="label label-inverse" style="cursor:pointer" onClick="alert(\'Damage Sequence:\\n' + res + '\');">Details</span><br>'
  + '</td>'
  + '</tr>'
  + '<tr>'
  + '<td>'
  + '<div class="hpBarBorder">'
  + '<div class="progress customProgress" align="center">'
  + '<div class="bar bar-success" style="width: 100%;margin:0px;" id="resultHP' + resultSlot + '"></div>'
  + '<div class="bar bar-success" style="width: 0%; opacity:0.5;margin:0px;" id="resultHPFluc' + resultSlot + '"></div>'
  + '</div>'
  + '</div>'
  + '<div align="right">' + Math.max(0, damageResults[resultSlot].stats[2] - res[15]) + '/' + damageResults[resultSlot].stats[2]
  + '</div>'
  + '</td>'
  + '</tr>';
  + '</table>'
  + '</td>'
  + '</tr>';
  document.getElementById('resultHP' + resultSlot).style.width = resultHPWidth + 'px';
  document.getElementById('resultHP' + resultSlot).className = 'bar ' + barColor;
  document.getElementById('resultHPFluc' + resultSlot).style.width = resultHPWidthFluc + 'px';
  document.getElementById('resultHPFluc' + resultSlot).className = 'bar ' + barColor;
}
