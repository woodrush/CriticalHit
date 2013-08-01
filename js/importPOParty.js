// Source imported from Pokemon Online
// http://play.pokemonshowdown.com/teambuilder

// Added code for compatibility
BattleStatIDs = {"HP":"hp","Atk":"atk","Def":"def","SAtk":"spa","SDef":"spd","Spd":"spe"};

function parseText(text, teams) {
	var text = text.split("\n");
	var team = [];
	var curSet = null;
	if (teams === true) {
		app.user.teams = [];
		teams = app.user.teams;
	}
	for (var i=0; i<text.length; i++) {
		var line = $.trim(text[i]);
		if (line === '' || line === '---') {
			curSet = null;
		} else if (line.substr(0, 3) === '===' && teams) {
			team = [];
			line = $.trim(line.substr(3, line.length-6));
			var format = '';
			var bracketIndex = line.indexOf(']');
			if (bracketIndex >= 0) {
				format = line.substr(1, bracketIndex-1);
				line = $.trim(line.substr(bracketIndex+1));
			}
			teams.push({
				name: line,
				format: format,
				team: team
			});
		} else if (!curSet) {
			curSet = {name: '', species: '', gender: ''};
			team.push(curSet);
			var atIndex = line.lastIndexOf(' @ ');
			if (atIndex !== -1) {
				curSet.item = line.substr(atIndex+3);
				line = line.substr(0, atIndex);
			}
			if (line.substr(line.length-4) === ' (M)') {
				curSet.gender = 'M';
				line = line.substr(0, line.length-4);
			}
			if (line.substr(line.length-4) === ' (F)') {
				curSet.gender = 'F';
				line = line.substr(0, line.length-4);
			}
			//TODO What is this?
			var parenIndex = line.lastIndexOf(' (');
			if (line.substr(line.length-1) === ')' && parenIndex !== -1) {
				line = line.substr(0, line.length-1);
				curSet.species = line.substr(parenIndex+2);
				line = line.substr(0, parenIndex);
				curSet.name = line;
			} else {
				curSet.name = line;
				curSet.species = line;
			}
		} else if (line.substr(0, 7) === 'Trait: ') {
			line = line.substr(7);
			curSet.ability = line;
		} else if (line === 'Shiny: Yes') {
			curSet.shiny = true;
		} else if (line.substr(0, 7) === 'Level: ') {
			line = line.substr(7);
			curSet.level = +line;
		} else if (line.substr(0, 11) === 'Happiness: ') {
			line = line.substr(11);
			curSet.happiness = +line;
		} else if (line.substr(0, 9) === 'Ability: ') {
			line = line.substr(9);
			curSet.ability = line;
		} else if (line.substr(0, 5) === 'EVs: ') {
			line = line.substr(5);
			var evLines = line.split('/');
			curSet.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
			for (var j=0; j<evLines.length; j++) {
				var evLine = $.trim(evLines[j]);
				var spaceIndex = evLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[evLine.substr(spaceIndex+1)];
				var statval = parseInt(evLine.substr(0, spaceIndex));
				if (!statid) continue;
				curSet.evs[statid] = statval;
			}
		} else if (line.substr(0, 5) === 'IVs: ') {
			line = line.substr(5);
			var ivLines = line.split(' / ');
			curSet.ivs = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};
			for (var j=0; j<ivLines.length; j++) {
				var ivLine = ivLines[j];
				var spaceIndex = ivLine.indexOf(' ');
				if (spaceIndex === -1) continue;
				var statid = BattleStatIDs[ivLine.substr(spaceIndex+1)];
				var statval = parseInt(ivLine.substr(0, spaceIndex));
				if (!statid) continue;
				curSet.ivs[statid] = statval;
			}
		} else if (line.match(/^[A-Za-z]+ (N|n)ature/)) {
			var natureIndex = line.indexOf(' Nature');
			if (natureIndex === -1) natureIndex = line.indexOf(' nature');
			if (natureIndex === -1) continue;
			line = line.substr(0, natureIndex);
			curSet.nature = line;
		} else if (line.substr(0,1) === '-' || line.substr(0,1) === '~') {
			line = line.substr(1);
			if (line.substr(0,1) === ' ') line = line.substr(1);
			if (!curSet.moves) curSet.moves = [];
			if (line.substr(0,14) === 'Hidden Power [') {
				var hptype = line.substr(14, line.length-15);
				line = 'Hidden Power ' + hptype;
				if (!curSet.ivs) {
					curSet.ivs = {};
					// Process when IVs were undefined 
					// for (var stat in exports.BattleTypeChart[hptype].HPivs) {
					// 	curSet.ivs[stat] = exports.BattleTypeChart[hptype].HPivs[stat];
					// }
				}
			}
			curSet.moves.push(line);
		}
	}
	return team;
}

function toText(team) {
	var text = '';
	for (var i=0; i<team.length; i++) {
		var curSet = team[i];
		if (curSet.name !== curSet.species) {
			text += ''+curSet.name+' ('+curSet.species+')';
		} else {
			text += ''+curSet.species;
		}
		if (curSet.gender === 'M') text += ' (M)';
		if (curSet.gender === 'F') text += ' (F)';
		if (curSet.item) {
			text += ' @ '+curSet.item;
		}
		text += "\n";
		if (curSet.ability) {
			text += 'Trait: '+curSet.ability+"\n";
		}
		if (curSet.level && curSet.level != 100) {
			text += 'Level: '+curSet.level+"\n";
		}
		if (curSet.shiny) {
			text += 'Shiny: Yes\n';
		}
		if (curSet.happiness && curSet.happiness !== 255) {
			text += 'Happiness: '+curSet.happiness+"\n";
		}
		var first = true;
		for (var j in curSet.evs) {
			if (!curSet.evs[j]) continue;
			if (first) {
				text += 'EVs: ';
				first = false;
			} else {
				text += ' / ';
			}
			text += ''+curSet.evs[j]+' '+BattlePOStatNames[j];
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.nature) {
			text += ''+curSet.nature+' Nature'+"\n";
		}
		var first = true;
		if (curSet.ivs) {
			var defaultIvs = true;
			var hpType = false;
			for (var j=0; j<curSet.moves.length; j++) {
				var move = curSet.moves[j];
				if (move.substr(0,13) === 'Hidden Power ' && move.substr(0,14) !== 'Hidden Power [') {
					hpType = move.substr(13);
					for (var stat in BattleStatNames) {
						if (curSet.ivs[stat] !== exports.BattleTypeChart[hpType].HPivs[stat]) {
							if (!(typeof curSet.ivs[stat] === 'undefined' && exports.BattleTypeChart[hpType].HPivs[stat] == 31) &&
								!(curSet.ivs[stat] == 31 && typeof exports.BattleTypeChart[hpType].HPivs[stat] === 'undefined')) {
								defaultIvs = false;
								break;
							}
						}
					}
				}
			}
			if (defaultIvs && !hpType) {
				for (var stat in BattleStatNames) {
					if (curSet.ivs[stat] !== 31 && typeof curSet.ivs[stat] !== undefined) {
						defaultIvs = false;
						break;
					}
				}
			}
			if (!defaultIvs) {
				for (var stat in curSet.ivs) {
					if (typeof curSet.ivs[stat] === 'undefined' || curSet.ivs[stat] == 31) continue;
					if (first) {
						text += 'IVs: ';
						first = false;
					} else {
						text += ' / ';
					}
					text += ''+curSet.ivs[stat]+' '+BattlePOStatNames[stat];
				}					
			}
		}
		if (!first) {
			text += "\n";
		}
		if (curSet.moves) for (var j=0; j<curSet.moves.length; j++) {
			var move = curSet.moves[j];
			if (move.substr(0,13) === 'Hidden Power ') {
				move = move.substr(0,13) + '[' + move.substr(13) + ']';
			}
			text += '- '+move+"\n";
		}
		text += "\n";
	}
	return text;
}