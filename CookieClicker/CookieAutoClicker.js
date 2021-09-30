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
			Game.ShowMenu('log');
			document.querySelector("#menu").lastChild.lastChild.click();
			Game.ShowMenu('log');
		}
		
		if(Game.HasAchiev('Here you go') == 0) {
			Game.AchievementsById[204].click();
		}
		
		if(Game.HasAchiev('Tabloid addiction') == 0) {
			for(let i = 0; i < 75; i++){
				document.querySelector("#commentsText").click();
				CookieAutoClicker.sleep(4);
			}
		}
		
		// Interval for calculating CPS
		CookieAutoClicker.CalculateClicksPerSecond();
		
		// Interval for clicking on the Golden cookies
		CookieAutoClicker.ClickCookie();
		CookieAutoClicker.ClickGoldenCookie();
	
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
	
	CookieAutoClicker.ClickCookieTimeout = 0;
	CookieAutoClicker.ClickCookiePeriod = 4;
	CookieAutoClicker.ClickCookie = function() {
		Game.ClickCookie();
		CookieAutoClicker.ClickCookieTimeout = setTimeout(CookieAutoClicker.ClickCookie, CookieAutoClicker.ClickCookiePeriod);
	}
	CookieAutoClicker.StopClickCookie = function() {
		clearTimeout(CookieAutoClicker.ClickCookieTimeout);
	}
	
	CookieAutoClicker.ClickGoldenCookieTimeout = 0;
	CookieAutoClicker.ClickGoldenCookiePeriod = 100;
	CookieAutoClicker.ClickGoldenCookie = function() {
		CookieAutoClicker.clickGoldenCookie();
		CookieAutoClicker.ClickGoldenCookieTimeout = setTimeout(CookieAutoClicker.ClickGoldenCookie, CookieAutoClicker.ClickGoldenCookiePeriod);
	}
	CookieAutoClicker.StopClickGoldenCookie = function() {
		clearTimeout(CookieAutoClicker.ClickGoldenCookieTimeout);
	}
	
	CookieAutoClicker.CalculateClicksPerSecondTimeout = 0;
	CookieAutoClicker.CalculateClicksPerSecondPeriod = 1000;
	{
		let cookieClicksLastCheck = Game.cookieClicks;
		let cookieClicksList = [0, 0, 0, 0, 0];
		let cookieClicksListIndex = 0;
		CookieAutoClicker.CalculateClicksPerSecond = function() {
			cookieClicksList[cookieClicksListIndex] = (Game.cookieClicks - cookieClicksLastCheck) / (CookieAutoClicker.CalculateClicksPerSecondPeriod / 1000);
			cookieClicksListIndex = (cookieClicksListIndex + 1) % 5;
			cookieClicksLastCheck = Game.cookieClicks;
			
			let sum = 0;
			for (let i = 0; i < 5; i++) {
				sum += cookieClicksList[i];
			}
			
			CookieAutoClicker.clicksPerSecond = sum / 5;
			CookieAutoClicker.ClickGoldenCookieTimeout = setTimeout(CookieAutoClicker.CalculateClicksPerSecond, CookieAutoClicker.CalculateClicksPerSecondPeriod);
		}
	}
	CookieAutoClicker.StopCalculateClicksPerSecond = function() {
		clearTimeout(CookieAutoClicker.CalculateClicksPerSecondTimeout);
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
			
			
			if(Game.UpgradesInStore[i].name == 'Festive Biscut' || 
			   Game.UpgradesInStore[i].name == 'Ghostly Biscut' ||
			   Game.UpgradesInStore[i].name == 'Lovesick Biscut' ||
			   Game.UpgradesInStore[i].name == 'Fool\'s Biscut' ||
			   Game.UpgradesInStore[i].name == 'Bunny Biscut' 
			) {
				deltaCps = 1;
			}
			
			if(Game.UpgradesInStore[i].name == 'Bingo center/Research facility') {
				if((Game.Upgrades['Bingo center/Research facility'].getPrice() / (Game.cookiesPs+Game.computedMouseCps * CookieAutoClicker.clicksPerSecond)) / 60 < 1) {
					deltaCps = Game.UpgradesInStore[i].getPrice();
				}
				else {
					deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
				}
			}
			else if(Game.UpgradesInStore[i].name == 'Specialized chocolate chips') {
				deltaCps = (Game.cookiesPs+Game.computedMouseCps * CookieAutoClicker.clicksPerSecond) * 0.01;
			}
			else if(Game.UpgradesInStore[i].name == 'Designer cocoa beans') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 20000;
			}
			else if(Game.UpgradesInStore[i].name == 'Ritual rolling pins') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 20000;
			}
			else if(Game.UpgradesInStore[i].name == 'Underworld ovens') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
			}
			else if(Game.UpgradesInStore[i].name == 'Exotic nuts') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
			}
			else if(Game.UpgradesInStore[i].name == 'Arcane sugar') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
			}
			else if(Game.UpgradesInStore[i].name == 'One mind') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Communal brainsweep') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Elder Pact') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Lucky day') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
			}
			else if(Game.UpgradesInStore[i].name == 'Serendipity') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
			}
			else if(Game.UpgradesInStore[i].name == 'Get lucky') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 5000;
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
			
		Game.UpgradesInStore[upgradeId].earn();
		Game.CalculateGains();
	
		let newCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		Game.UpgradesInStore[upgradeId].unearn();
		Game.CalculateGains();
	
		return newCps - curCps;
	}
	
	CookieAutoClicker.calcHeavenlyChips = function() {
		return Game.HeavenlyChips + Game.ascendMeterLevel;
	}
	
	CookieAutoClicker.Ascend = function() {
		Game.Ascend(1);
		
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Legacy'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Twin gates of transcendence'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heavenly cookies'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Belphegor'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Angels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['How to bake your dragon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Classic dairy selection'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Tin of butter cookies'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Tin of british tea biscuts'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of brand biscuts'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of macarons'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Mammon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Archangels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starter kit'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heavenly luck'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot I'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heralds'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Basic wallpaper assortment'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Abbadon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Virtues'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Persistent memory'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lasting fortune'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Golden switch'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Season switcher'].id);
		
		Game.Reincarnate(1);
	}
	
	CookieAutoClicker.castForceHand = function() {
		if(Game.ObjectsById[7].minigameLoaded) {
			Game.ObjectsById[7].minigame.castSpell(Game.ObjectsById[7].minigame.spellsById[1],{});
		}
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
