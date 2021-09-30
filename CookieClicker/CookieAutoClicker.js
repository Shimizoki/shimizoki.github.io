if(CookieAutoClicker === undefined) var CookieAutoClicker = {};
//if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0? 'Beta/' : '') + 'CCSE.js');
CookieAutoClicker.name = 'CookieAutoClicker';
CookieAutoClicker.version = '0.1';
CookieAutoClicker.GameVersion = '2.042';


CookieAutoClicker.clicksPerSecond = 0;
CookieAutoClicker.nextPurchase = 'UnInitialized';
CookieAutoClicker.isLoaded = 0;

CookieAutoClicker.launch = function() {
	CookieAutoClicker.init = async function() {
		'use strict';
		
		CookieAutoClicker.isLoaded = 1;
		CookieAutoClicker.restoreDefaultConfig();
		
		CookieAutoClicker.addDisplay();
		CookieAutoClicker.updateDisplay(CookieAutoClicker.nextPurchase);
		
		if(Game.HasAchiev('Tiny cookie') == 0) {
			Game.ClickTinyCookie();
		}
		
		if(Game.HasAchiev('Olden days') == 0) {
			document.querySelector("#menu").lastChild.lastChild.click();
		}
		
		// Interval for calculating CPS
		let cookiesLastInterval = Game.cookies;
		setInterval(()=>{
			let cps = Game.cookies - cookiesLastInterval;
			cookiesLastInterval = Game.cookies;
	
			// Back out early if I bought something
			if(cps < 0) { return; }
	
			let autoCps = Game.cookiesPs;
			let clickCps = cps - autoCps;
			CookieAutoClicker.clicksPerSecond = Math.round(clickCps / Game.computedMouseCps);
	
			//console.log("CPS: " + cps + " | Click CPS" + clickCps + " | Clicks Per Second " + clicksPerSecond);
		}, 1000)
	
		// Interval for clicking on the cookies
		setInterval(()=>{
			Game.ClickCookie();
			CookieAutoClicker.clickGoldenCookie();
		}, 4)
	
		// Interval for buying Buildings and Upgrades
		setInterval(()=>{
			let bestBuilding = CookieAutoClicker.calcBestBuilding();
			let bestUpgrade = CookieAutoClicker.calcBestUpgrade();
	
			if(bestBuilding[1] <= bestUpgrade[1]){
				//console.log("Best Index: " + bestBuilding[0] + " with ROI: " + bestRoi);
				if(bestBuilding[0] != -1) {
					//console.log("Best Purchase: " + Game.ObjectsById[bestBuilding[0]].name);
					CookieAutoClicker.updateDisplay(Game.ObjectsById[bestBuilding[0]].name + " (" + bestBuilding[1] + ")");
					Game.ObjectsById[bestBuilding[0]].buy();
				}
			}
			else if(bestUpgrade[1] < bestBuilding[1]){
				//console.log("Best Index: " + bestUpgrade[0] + " with ROI: " + bestRoi);
				if(bestUpgrade[0] != -1) {
					//console.log("Best Purchase: " + Game.UpgradesInStore[bestUpgrade[0]].name);
					CookieAutoClicker.updateDisplay(Game.UpgradesInStore[bestUpgrade[0]].name + " (" + bestUpgrade[1] + ")");
					if(Game.UpgradesInStore[bestUpgrade[0]].canBuy() == 1) {
						Game.UpgradesInStore[bestUpgrade[0]].buy();
					}
				}
			}
	
		}, 100)
	}
	
	CookieAutoClicker.save = function() {
		return JSON.stringify(CookieAutoClicker.config);
	}

	CookieAutoClicker.load = function(str) {
		var config = JSON.parse(str);
	}
	
	CookieAutoClicker.defaultConfig = function(){
		return {}
	}
	CookieAutoClicker.restoreDefaultConfig = function(){
		CookieAutoClicker.config = CookieAutoClicker.defaultConfig();
	}

	
	CookieAutoClicker.calcBestBuilding = function() {
		let bestRoi = 10000000000000;
		let bestIdx = -1;
		for(let i=Game.ObjectsById.length-1; i >= 0; i--) {
			let deltaCps = CookieAutoClicker.calcBuildingCps(i);
			if(Game.ObjectsById[i].locked == 0 && deltaCps != 0) {
				let roi = Game.ObjectsById[i].price / deltaCps;
				if(roi < bestRoi) {
					bestRoi = roi;
					bestIdx = i;
				}
			}
		}
	
		return [bestIdx, Math.round(bestRoi)];
	}
	
	CookieAutoClicker.calcBestUpgrade = function() {
		let bestRoi = 10000000000000;
		let bestIdx = -1;
		for(let i=0; i < Game.UpgradesInStore.length; i++) {
			let deltaCps = 0;
			
			
			if(Game.UpgradesInStore[i].name == 'Bingo center/Research facility') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Specialized chocolate chips') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			
			if(deltaCps > 0) {
				let roi = Game.UpgradesInStore[i].getPrice() / deltaCps;
				if(roi < bestRoi) {
					bestRoi = roi;
					bestIdx = i;
				}
			}
		}
	
		return [bestIdx, Math.round(bestRoi)];
	}
	
	CookieAutoClicker.clickGoldenCookie = function() {
		for(let i = 0; i < Game.shimmers.length; i++) {
			if(Game.shimmers[i].type == 'golden') {
				Game.shimmers[i].pop();
				CookieAutoClicker.castForceHand();
			}
		}
	}
	
	CookieAutoClicker.calcBuildingCps = function(buildingId) {
	
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		Game.ObjectsById[buildingId].getFree(1);
		Game.CalculateGains();
	
		let newCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		Game.ObjectsById[buildingId].getFree(-1);
		Game.CalculateGains();
	
		return newCps - curCps;
	}
	
	CookieAutoClicker.calcUpgradeCps = function(upgradeId) {
	
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		if(Game.UpgradesInStore[upgradeId].name == 'Bingo center/Research facility') {
			return -1;
		}
		
		Game.UpgradesInStore[upgradeId].earn();
		Game.CalculateGains();
	
		let newCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		Game.UpgradesInStore[upgradeId].unearn();
		Game.CalculateGains();
	
		return newCps - curCps;
	}
	
	CookieAutoClicker.castForceHand = function() {
		Game.ObjectsById[7].minigame.castSpell(Game.ObjectsById[7].minigame.spellsById[1],{});
	}
	
	CookieAutoClicker.addDisplay = function(){
	  const parent = document.querySelector('#versionNumber');
	  let newElement = document.createElement('div');
	  newElement.id = "nextPurchase";
	  newElement.style.color = "white";
	  newElement.style.cursor = "pointer";
	  newElement.textContent = "";
	  parent.appendChild(newElement);
	}
	
	CookieAutoClicker.updateDisplay = function(value){
		if(value == nextPurchase) { return; }
	
		let element = document.querySelector('#nextPurchase');
		element.textContent = "Next: " + value;
		CookieAutoClicker.nextPurchase = value;
	}
	
	CookieAutoClicker.sleep = function(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	//if(CCSE.ConfirmGameVersion(CookieAutoClicker.name, CookieAutoClicker.version, CookieAutoClicker.GameVersion)) Game.registerMod(CookieAutoClicker.name, CookieAutoClicker); // CookieAutoClicker.init();
	Game.registerMod(CookieAutoClicker.name, CookieAutoClicker);
}

if(!CookieAutoClicker.isLoaded){
	CookieAutoClicker.launch();
	//console.log("CookieAutoClicker Not Loaded!");
	//if(CCSE && CCSE.isLoaded){
	//	console.log("CCSE is Loaded... Launcing CookieAutoClicker");
	//	CookieAutoClicker.launch();
	//}
	//else{
	//	console.log("CCSE is not Loaded... Adding CookieAutoClicker to post load hooks");
	//	if(!CCSE) var CCSE = {};
	//	if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
	//	CCSE.postLoadHooks.push(CookieAutoClicker.launch);
	//}
}
