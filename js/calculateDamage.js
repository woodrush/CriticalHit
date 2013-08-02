/*-----------------------------------------------------------------------------------------*
 *   Critical Hit Damage Calculation Engine                                                *
 *                                                                                         *
 *   Coded by SanaVoir @SanaVoir on 7/24/2013.                                             *
 *   Special Thanks to Smogon University for the concise, accurate algorithm.              *
 *   Reference: http://www.smogon.com/bw/articles/bw_complete_damage_formula#variable-bp   *
 *                                                                                         *
 *   This engine was originally used at:                                                   *
 *   http://sanavoir.com/criticalhit                                                       *
 *                                                                                         *
 *   Pokémon is a copyright of Pokemon Inc.                                                *
 *   No copyright infringement intended.                                                   *
 *-----------------------------------------------------------------------------------------*/

// Global variables and flags
isCritical = false;
isHelpingHand = false;

level = 50;
isDoubleBattle = false;
weather = 0;

// 
var Pokemon = function(){
	this.dexid   = 0;
	this.iv      = [31,31,31,31,31,31];
	this.ev      = [0,0,0,0,0,0];
	this.nature  = -1;
	this.ability = -1;
	this.moves   = [0,0,0,0];
	this.item    = -1;

	this.health  = 0;
	this.aBoost = 0;
	this.dBoost = 0;
	isLightScreen = false;
	isReflect = false;

	this.focusingMove = 0;  
};
Pokemon.prototype = {
  getFocusingMoveId: function() {
    return this.moves[this.focusingMove];
  },
  getName: function() {
    return pokemonNames[this.dexid];
  },
  getStatus: function (target){
    if(target < 0 || 5 < target){
      return -1;
    }
    var b = div((baseData[6*this.dexid+target]*2 + this.iv[target] + div(this.ev[target],4))*level,100);
    if (this.dexid <= 0){
    	return 0;
    } else if (target == 0){
		return (this.dexid == 292 ? 1 : b+10+level);
    } else {
    	var natureBias = 1.0;
    	if(0 <= this.nature && this.nature <= 24){
	    	natureBias = 1.0 + 0.1 * ( ((target - 1) == div(this.nature, 5)) - ((target - 1) == this.nature % 5) );
    	} else if(25 <= this.nature && this.nature <= 29 && this.nature - 25 + 1 == target){
			natureBias = 1.1;
    	} else if(this.nature == 30){
    		natureBias = 1.1;
    	} else if(this.nature == 31){
    		natureBias = 0.9;
    	}
    	return Math.floor((b+5) * natureBias);
    }
  },
  isHealthy: function(){
  	return (this.health == 1 || this.health == 3 || this.health == 4 || this.health == 5);
  },
  isEvolved: function(){
  	return false;
  }
}
var DamageResult = function(){};
DamageResult.prototype = {
	pokeId      : [0,0],
	moveId      : 0,
	moveType    : 0,
	basePower   : 0,
	stats       : [0,0,0],
	factors     : new Array(),
	damage      : 0,
	hitnumId    : 0,
	aCategory   : 1,
	dCategory   : 1
}
function div(x,y){
	return Math.floor((x * 1.0)/(y * 1.0));
}
function cmod(m,mdash){
	return Math.floor((m*mdash+2048)*1.0/4096);
}
function modif(x, modifier){
	if( (x * modifier + 0.0) / 4096 - Math.floor((x * modifier + 0.0) / 4096) <= 0.5){
		return Math.floor((1.0 * x * modifier) / 4096);
	} else {
		return Math.ceil((1.0 * x * modifier) / 4096);
	}
}



function calculateDamage(aPokemon, dPokemon, resultSlot, randomLevel){
	switch (true){
		default:
			// var moveId = aPokemon.getFocusingMoveId();
			var moveId = aPokemon.moves[resultSlot];
			var moveType = moveData[moveId*moveDataLength + 0];
			var aCategory = moveData[moveId*moveDataLength + 2];
			var dCategory = moveData[moveId*moveDataLength + 2];
			var atk;
			var def;

			var abilityIsActive = true;
			var isLightScreen = dPokemon.isLightScreen;
			var isReflect = dPokemon.isReflect;

			var hasMoreThanOneOnSide = isDoubleBattle;

			var damageIsZero = false;
			var condFlag = false;

			var bModifier = 4096;
			var aModifier = 4096;
			var dModifier = 4096;
			var fModifier = 4096;

			damageResults[resultSlot].factors = [];

			if(moveId <= 0){
				damage = -1;
				break;
			}
			if(moveData[moveId*moveDataLength + 3] == 0){
				damage = -1;
				break;
			}

			//--------------------------------------------------------------
			// Base power value triggers
			var bpw = moveData[moveId*moveDataLength + 3];
			// Move ID
			switch(moveId){
				case 218:	bpw = 102;				break;									//Frustration
				case 371:	if(condFlag){bpw*=2;}	break;									//Payback
				case 216:	bpw = 102;				break;									//Return
				case 486:	var s = div(aPokemon.getStatus(5), dPokemon.getStatus(5));		//Electro Ball
							if(s >= 4)		{ bpw = 150;}
							else if(s >= 3)	{ bpw = 120;}
							else if(s >= 2)	{ bpw = 80; }
							else if(s >= 1)	{ bpw = 60; }
							else 			{ bpw = 40; }
							break;
				case 419:	if(condFlag){bpw*=2};	break;									//Avalanche
				case 360:	var s = 25 * div(dPokemon.getStatus(5), aPokemon.getStatus(5));	//Gyro Ball
							if(s > 150)	{bpw = 150;}
							else		{bpw = s;}
							break;
				case 284:	bpw = 150;				break;									//Eruption, Water Spout TODO
				case 386:	var s = 60 + 20 * 0;											//Punishment TODO
							if(s > 120)	{bpw = 120;}
							else		{bpw = s;}
				case 210:	break;															//Fury Cutter TODO
				case (moveId == 67 || moveId == 535 ? moveId : 0): 							// Low Kick/Grass Knot
					if     (weightData[dPokemon.dexid] >= 2001) { bpw = 120;}
					else if(weightData[dPokemon.dexid] >= 1001)	{ bpw = 100;}
					else if(weightData[dPokemon.dexid] >=  501)	{ bpw =  80;}
					else if(weightData[dPokemon.dexid] >=  251)	{ bpw =  60;}
					else if(weightData[dPokemon.dexid] >=  101)	{ bpw =  40;}
					else 										{ bpw =  20;}
					break;
				case 496:	break;															//Echoed Voice TODO
				case 506: 	break;															//Hex
				//Wring Out, Crushed Grip TODO
				// TODO Assurance
				case (moveId == 484 || moveId == 447 ? moveId : 0): 						// Heavy Slam/Heat Crash
					var s = div(weightData[aPokemon.dexid],weightData[dPokemon.dexid]);
					if     (s >= 5) { bpw = 120;}
					else if(s >= 4)	{ bpw = 100;}
					else if(s >= 3)	{ bpw = 80;}
					else if(s >= 2)	{ bpw = 60;}
					else   			{ bpw = 40;}
					break;				
				// TODO Stored Power
				case 512: 	if(aPokemon.item == 0) { bpw = 110; }	break;					// Acrobatics
				// TODO Flail, Reversal
				// TODO Trump Card
				// TODO Round
				// TODO Triple Kick
				// TODO Wake-Up Slap
				// TODO SmellingSalt
				// TODO Weather Ball
				// TODO Gust, Twister
				// TODO Beat Up
				case 237:				
					// Hidden Power
					moveType = 1 + div((1*(aPokemon.iv[0]%2) + 2*(aPokemon.iv[1]%2) + 4*(aPokemon.iv[2]%2) + 16*(aPokemon.iv[3]%2) + 32*(aPokemon.iv[4]%2) + 8*(aPokemon.iv[5]%2))*15,63);
					bpw = 0;
					for(var i=0; i<6; i++){
						if(aPokemon.iv[i]%4 == 2 || aPokemon.iv[i]%4 == 3){
							bpw += Math.round(Math.pow(2,i));
						}
					}
					bpw = div(bpw*40,63)+30;
					break;
				// TODO Spit Up
				// TODO Pursuit
				// TODO Present
				// TODO Natural Gift
				// TODO Magnitude
				// TODO Rollout
				// TODO Fling
				// TODO Grass/Fire/Water Pledge
			}

			// Base Power Modifiers
			// Attack side's ability
			switch(true){
				case (aPokemon.ability == 101 && bpw <= 60): 									// Technician
					bModifier = cmod(bModifier,6144);
					break;
				case (aPokemon.ability == 138 && aPokemon.health == 4 && aCategory == 2): 		// Flare Boost
					bModifier = cmod(bModifier,6144);
					break;
				case (aPokemon.ability == 148 && moveId != 248 && moveId != 353 && condFlag): 	// Analytic
					bModifier = cmod(bModifier,5325);
					break;
				case (aPokemon.ability == 120 && (moveData[moveId*moveDataLength + 18] > 128 || moveId == 26 || moveId == 136)): // Iron Fist
					bModifier = cmod(bModifier,5325);
					break;
				case (aPokemon.ability == 89 && (Math.floor(moveData[moveId*moveDataLength + 32] / 128) % 2 == 1)): // Reckless
					bModifier = cmod(bModifier,5325);
					break;
				case (aPokemon.ability == 137 && aPokemon.health == 5 && aCategory == 1): 		// Toxic Boost
					bModifier = cmod(bModifier,6144);
					break;
				// TODO Rivalry
				case (aPokemon.ability == 159 && (moveType == 4 || moveType == 5 || moveType == 8)): 				// Sand Force
					bModifier = cmod(bModifier,5325);
					break;
				case (aPokemon.ability == 125) && (				// Sheer Force
					!(moveId > 0) ||
					((moveData[moveId*moveDataLength+8] > 0 && moveData[moveId*moveDataLength+8] <= 6) || moveData[moveId*moveDataLength+8] === 255) ||
					  moveData[moveId*moveDataLength+15] > 0 ||
					((moveData[moveId*moveDataLength+1] == 5 || moveData[moveId*moveDataLength+1] == 6) && moveData[moveId*moveDataLength+24] < 0) ||
					 (moveData[moveId*moveDataLength+1] == 7 && moveData[moveId*moveDataLength+24] > 0)
					):
					bModifier = cmod(bModifier,5325);					
				 	break;
			}
			// Defense side's ability
			switch(true){
				case (dPokemon.ability == 85 && moveType == 9): // Heatproof
					bModifier = cmod(bModifier,2048);
					break;
				case (dPokemon.ability == 87 && moveType == 9): // Dry Skin
					bModifier = cmod(bModifier,5120);
					break;
			}
			// Items
			switch(true){
				case (aPokemon.item == 0) || (41 <= aPokemon.item && aPokemon.item <= 57 && moveType == aPokemon.item - 40):	// Boosting Plates
					bModifier = cmod(bModifier,4915);
					break;
				case (aPokemon.item == 5 && aCategory == 1): 	// Muscle Band
					bModifier = cmod(bModifier,4505);
					break;
				case (aPokemon.item == 8 && aPokemon.dexid == 484 && (moveType == 10 || moveType == 15)): 	// Palkia
					bModifier = cmod(bModifier,4915);
					break;
				case (aPokemon.item == 6 && aCategory == 2):	// Wise Glasses
					bModifier = cmod(bModifier,4505);
					break;
				case (aPokemon.item == 8 && aPokemon.dexid == 487 && (moveType == 7 || moveType == 15)): 	// Giratina
					bModifier = cmod(bModifier,4915);
					break;
				// TODO Odd Incense
				case (aPokemon.item == 8 && aPokemon.dexid == 483 && (moveType == 8 || moveType == 15)): 	// Dialga
					bModifier = cmod(bModifier,4915);
					break;
				case (aPokemon.item == 1) || (23 <= aPokemon.item && aPokemon.item <= 40 && moveType == aPokemon.item - 23):	// Boosting Jems
					bModifier = cmod(bModifier,6144);
					break;
			}
			// Moves
			switch(true){
				case (moveId == 263 && (aPokemon.health == 1 || aPokemon.health == 4 || aPokemon.health == 5)): 	// Brine
					bModifier = cmod(bModifier,8192);
					break;
				// TODO Brine
				case (moveId == 474 && dPokemon.health == 5): 												// Venoshock
					bModifier = cmod(bModifier,8192);
					break;
				// TODO Retaliate
				// TODO Fusion Bolt/Fusion Flare
				// TODO Me First
				case (moveId == 76 && weather != 0 && weather != 1): // SolarBeam in non-sunny, non-default weather
					bModifier = cmod(bModifier,2048);
					break;
			}
			// Field Conditions
			switch(true){
				// TODO Charge
				case (isHelpingHand):
					bModifier = cmod(bModifier,6144);
					break;
				// TODO Water Sport
				// TODO Mud Sport
			}

			//--------------------------------------------------------------
			// Attack value triggers
			// Foul Play
			if(moveId == 492){
				atk = dPokemon.getStatus(1);
			} else {
				atk = aPokemon.getStatus(aCategory == 1 ? 1 : 3)
			}

			// Attack boost
			if(dPokemon.ability != 109){
				atk = div(atk * (aPokemon.aBoost > 0 ? 2 + aPokemon.aBoost : 2), (aPokemon.aBoost < 0 ? 2 - aPokemon.aBoost : 2));
			}

			// Attack modifiers
			// Defense side's ability
			switch (true){
				case (dPokemon.ability == 47 && (moveType == 9 || moveType == 14)): 		// Thick Fat
					aModifier = cmod(aModifier,2048);
					break;
				//TODO Plus/Minus
				//TODO Defeatist
			}
			// Attack side's ability
			switch(true){
				case (aPokemon.ability == 65 && moveType == 11): 		// Overgrow
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.ability == 66 && moveType == 9): 		// Blaze
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.ability == 67 && moveType == 10): 		// Torrent
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.ability == 68 && moveType == 6): 		// Swarm
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.ability == 62 && !aPokemon.isHealthy() && aCategory == 1): 	// Guts
					aModifier = cmod(aModifier,6144);				
					break;
				case (aPokemon.ability == 74 || aPokemon.ability == 37): 			// Pure Power/Huge Power
					aModifier = cmod(aModifier,8192);
					break;
				case (aPokemon.ability == 94 && weather == 1 && aCategory == 2): 	// Solar Power
					aModifier = cmod(aModifier,6144);
					break;
			}
			// Hustle (** Is special - the modifier gets applied directly and instantly)
			switch(true){
				case (aPokemon.ability == 55 && aCategory == 1): 					// Hustle
					atk = modif(atk,6144);
					break;
			}
			// Attack side's ability
			switch(true){
				case (aPokemon.ability == 18 && moveType == 9): 					// Flash Fire
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.ability == 112 && aCategory == 1): 					// Slow Start
					aModifier = cmod(aModifier,2048);
					break;
			}
			// Attack side's item
			switch(true){
				// TODO Flower Gift
				case (aPokemon.item == 8 && (aPokemon.dexid == 104 || aPokemon.dexid == 105) && aCategory == 1): 	// Cubone/Marowak, Thick Club
					aModifier = cmod(aModifier,8192);
					break;
				case (aPokemon.item == 8 && aPokemon.dexid == 366 && aCategory == 2): 								// Clamperl, DeepSeaTooth
					aModifier = cmod(aModifier,8192);
					break;
				case (aPokemon.item == 8 && aPokemon.dexid == 25): 													// Pikachu, Light Ball
					aModifier = cmod(aModifier,8192);
					break;
				case (aPokemon.item == 8 && (aPokemon.dexid == 380 || aPokemon.dexid == 381)): 						// Latios/Latias, Soul Dew
					aModifier = cmod(aModifier,8192);
					break;
				case (aPokemon.item == 3 && aCategory == 1): 														// Choice Band
					aModifier = cmod(aModifier,6144);
					break;
				case (aPokemon.item == 4 && aCategory == 2): 														// Choice Specs
					aModifier = cmod(aModifier,6144);
					break;
			}

			//--------------------------------------------------------------
			// Defense value triggers
			// Psyshock/Psystrike
			if(moveId == 473 || moveId == 540){
				dCategory = 3 - dCategory;
			}	
			def = dPokemon.getStatus(dCategory == 1 ? 2 : 4);


			// Defense boost
			if(!(aPokemon.ability == 109) && moveId != 498){
				def = div(def * (dPokemon.dBoost > 0 ? 2 + dPokemon.dBoost : 2), (dPokemon.dBoost < 0 ? 2 - dPokemon.dBoost : 2));
			}

			// Defense boost by the Sandstorm Modifier
			if(weather == 3 && (typeData[dPokemon.dexid*2 + 0] == 5 || typeData[dPokemon.dexid*2 + 0] == 5) && dCategory == 2){
				def = modif(def, 6144);
			}

			// Defense modifiers
			// Defense side's ability
			switch (true){
				case (dPokemon.ability == 63 && aCategory == 1 && !dPokemon.isHealthy()): 		// Marvel Scale
					dModifier = cmod(dModifier,6144);
					break;
				//TODO: Flower Gift
				case (dPokemon.dexid == 366 && dPokemon.item == 8 && aCategory == 2): 			//Clamperl, DeepSeaScale
					dModifier = cmod(dModifier,6144);
					break;
				case (dPokemon.dexid == 132 && dPokemon.item == 8 && aCategory == 1): 			//Ditto, Metal Powder
					dModifier = cmod(dModifier,6144);
					break;
				case (dPokemon.item == 16 && !dPokemon.isEvolved()): 							// Eviolite
					dModifier = cmod(dModifier,6144);
					break;
				case (dPokemon.item == 8 && (dPokemon.dexid == 380 || dPokemon.dexid == 381)): 	// Latios/Latias, Soul Dew
					dModifier = cmod(dModifier,6144);
					break;
			}


			//--------------------------------------------------------------
			// Base damage
			// Apply modifiers first
			bpw = modif(bpw,bModifier);
			atk = modif(atk,aModifier);
			def = modif(def,dModifier);
			var damage = div( div( (div( 2 * level , 5) + 2) * bpw * atk , def) , 50) + 2;

			//--------------------------------------------------------------
			// Multi-Target
			if(isDoubleBattle && moveData[moveId*moveDataLength + 20] == 5 || moveData[moveId*moveDataLength + 20] == 4){
				damage = modif(damage,3072);
			}

			// Weather
			if(!(aPokemon.ability == 13 || aPokemon.ability == 76 || dPokemon.ability == 13 || dPokemon.ability == 76)){
				if((weather == 1 && moveType == 9) || (weather == 2 && moveType == 10)){
					damage = modif(damage, 6144);
				} else if ((weather == 1 && moveType == 10) || (weather == 2 && moveType == 9)){
					damage = modif(damage, 2048);
				}
			}

			// Critical Hit
			if(isCritical){
				damage *= 2;
			}

			// Random Factor
			damage = div(damage * (85 + randomLevel), 100);

			// STAB
			if((typeData[aPokemon.dexid*2 + 0] == moveType) || (typeData[aPokemon.dexid*2 + 1] == moveType)){
				fModifier = 6144;
			}

			// Type effectiveness
			// Use simple bitshift.
			var effectiveness = typeEffectiveness[moveType*19 + typeData[dPokemon.dexid*2 + 0]]
							  + typeEffectiveness[moveType*19 + typeData[dPokemon.dexid*2 + 1]];
			if(effectiveness < -2){
				damageIsZero = true;
				break;
			} else {
				damage = Math.floor(damage * Math.pow(2,effectiveness));
			}

			// Effect of a burn
			if(aCategory == 1){
				if(aPokemon.health == 4){
					if(aPokemon.ability != 62){
						damage = div(damage,2);
					}
				}
			}

			// Make sure damage is at least 1
			if(damage < 1){
				damage = 1;
			}

			// Final modifier
			// * Be sure to chain as in the order listed
			// Wonder Guard
			if(dPokemon.ability == 25 && effectiveness <= 0){
				damageIsZero = true;
			}
			// Reflect
			if((isReflect && (aCategory == 1) && (aPokemon.ability != 151) && !isCritical)){
				fModifier = cmod(fModifier,hasMoreThanOneOnSide ? 2703 : 2048);
			}
			// Light Screen
			if((isLightScreen && (aCategory == 2) && (aPokemon.ability != 151) && !isCritical)){
				fModifier = cmod(fModifier,hasMoreThanOneOnSide ? 2703 : 2048);
			}
			// Multiscale
			if(dPokemon.ability == 136 && abilityIsActive){
				fModifier = cmod(fModifier,2048);
			}
			// Tinted Lens
			if(aPokemon.ability == 110 && effectiveness < 0){
				fModifier = cmod(fModifier,8192);
			}
			// Friend Guard
			// Sniper
			if(aPokemon.ability == 97 && isCritical){
				fModifier = cmod(fModifier,6144);
			}
			// Solid Rock/Filter
			if((dPokemon.ability == 116 || dPokemon.ability == 111) && effectiveness > 0){
				fModifier = cmod(fModifier,3072);
			}
			// Attacker's held item
			switch(true){
				// Metronome
				case (77 <= aPokemon.item && aPokemon.item <= 81):
					fModifier = cmod(fModifier,4096 + (dPokemon.item == 81 ? 8192 : 819*(dPokemon.item-76)));
					break;
				// Expert Belt
				case (aPokemon.item == 7 && effectiveness > 0):
					fModifier = cmod(fModifier,4915);
					break;
				// Life Orb
				case (aPokemon.item == 2):
					fModifier = cmod(fModifier,5324);
					break;
				// Normal lowering berry
				case (58 == dPokemon.item && 0 == moveType):
					fModifier = cmod(fModifier,2048);
					break;
				// Damage lowering berry
				case (dPokemon.item == 15) || (59 <= dPokemon.item && dPokemon.item <= 76 && (dPokemon.item - 58) == moveType && effectiveness > 0):
					fModifier = cmod(fModifier,2048);
			}
			switch(true){
				// TODO: Stomp
				// TODO: Earthquake
				// TODO: Surf
				// TODO: Steamroller
				default:
				break;
			}
			// Apply final modifier
			damage = modif(damage, fModifier);

			// Special Cases
			switch(moveId){
				// Psywave and Super Fang are damages with different ranges.
				// It could be considered to implement these by making this function return the range of HP back
				// To comply with these 2 moves also.
				//TODO Psywave
				case 101: damage = level; break; // Night Shade
				case  49: damage = 20; break; // Sonic Boom
				//TODO Super Fang
				case  82: damage = 40; break; // Dragon Rage
				//POSTPONED Endeavor
				//POSTPONED Final Gambit
				//POSTPONED Brick Break
				//POSTPONED Counter
				//POSTPONED Mirror Coat
				//POSTPONED Metal Burst
				//POSTPONED Bide
			}
	}
	// Deal zero damage for uneffective moves
	if(damageIsZero == true){
		damage = 0;
	}

	// Store Results to global object
	damageResults[resultSlot].pokeId      = [aPokemon.dexid, dPokemon.dexid];
	damageResults[resultSlot].moveId      = moveId;
	damageResults[resultSlot].moveType    = moveType;
	damageResults[resultSlot].basePower   = bpw;
	damageResults[resultSlot].stats       = [atk, def, dPokemon.getStatus(0)];
	damageResults[resultSlot].factors     = damageResults[resultSlot].factors;
	damageResults[resultSlot].damage      = damage;
	damageResults[resultSlot].hitnumId    = 0;
	damageResults[resultSlot].aCategory   = aCategory;
	damageResults[resultSlot].dCategory   = dCategory;
}