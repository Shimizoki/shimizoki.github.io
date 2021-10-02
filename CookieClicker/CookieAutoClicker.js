if(CookieAutoClicker === undefined) var CookieAutoClicker = {};
//if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0? 'Beta/' : '') + 'CCSE.js');
CookieAutoClicker.name = 'CookieAutoClicker';
CookieAutoClicker.version = '0.1';
CookieAutoClicker.GameVersion = '2.042';


CookieAutoClicker.clicksPerSecond = 0;
CookieAutoClicker.nextPurchase = 'UnInitialized';
CookieAutoClicker.isLoaded = 0;

CookieAutoClicker.runStartTimer = 0;
CookieAutoClicker.millionCookiesTimer = 0;
CookieAutoClicker.firstHCTimer = 0;
CookieAutoClicker.firstAscendTimer = 0;

CookieAutoClicker.launch = function() {
	CookieAutoClicker.init = async function() {
		'use strict';
		
		CookieAutoClicker.isLoaded = 1;
		CookieAutoClicker.restoreDefaultConfig();
		
		CookieAutoClicker.addDisplay();
		CookieAutoClicker.updateDisplay(CookieAutoClicker.nextPurchase);
		
		CookieAutoClicker.runStartTimer = Date.now();
		
		
		let millionTimer = setInterval(() => {
			if(Game.cookiesEarned >= 1000000){
				CookieAutoClicker.millionCookiesTimer = Date.now()-CookieAutoClicker.runStartTimer;
				clearInterval(millionTimer);
			}
		}, 1);
		
		let hCTimer = setInterval(() => {
			if(Game.ascendMeterLevel >= 1){
				CookieAutoClicker.firstHCTimer = Date.now()-CookieAutoClicker.runStartTimer;
				clearInterval(hCTimer);
			}
		}, 1);
		
		let ascendTimer = setInterval(() => {
			if(Game.resets >= 1){
				CookieAutoClicker.firstAscendTimer = Date.now()-CookieAutoClicker.runStartTimer;
				clearInterval(ascendTimer);
			}
		}, 1);
		
		
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
	
		setInterval(() => {
			CookieAutoClicker.TryDoPrestige();
		}, 100)
		
		// Interval for buying Buildings and Upgrades
		setInterval(()=>{
			let bestBuilding = CookieAutoClicker.calcBestBuilding();
			let bestUpgrade = CookieAutoClicker.calcBestUpgrade();
	
			if(bestBuilding[1] < bestUpgrade[1]){
				//console.log("Best Index: " + bestBuilding[0] + " with ROI: " + bestRoi);
				if(bestBuilding[0] != null) {
					//console.log("Best Purchase: " + Game.ObjectsById[bestBuilding[0]].name);
					CookieAutoClicker.updateDisplay(bestBuilding[0] + " (" + Math.round(bestBuilding[1]) + ")");
					Game.Objects[bestBuilding[0]].buy();
				}
			}
			else {
				//console.log("Best Index: " + bestUpgrade[0] + " with ROI: " + bestRoi);
				if(bestUpgrade[0] != null) {
					//console.log("Best Purchase: " + Game.UpgradesInStore[bestUpgrade[0]].name);
					CookieAutoClicker.updateDisplay(bestUpgrade[0] + " (" + Math.round(bestUpgrade[1]) + ")");
					if(Game.Upgrades[bestUpgrade[0]].canBuy() == 1) {
						Game.Upgrades[bestUpgrade[0]].buy();
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

	CookieAutoClicker.calcCookiesPerSecond = function() {
		return Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	}
	
	CookieAutoClicker.calcPurchaseInSeconds = function(item, useBank=true) {
		let price = Game.Upgrades[item] ? Game.Upgrades[item].getPrice() : Game.Objects[item].price;
		let cps = CookieAutoClicker.calcCookiesPerSecond();
		
		return Math.max(0, (price-(useBank?Game.cookies:0)) / cps);
	}
	
	CookieAutoClicker.calcBestBuilding = function() {
		let bestRoi = Number.POSITIVE_INFINITY;
		let bestId = -1;
		for(let i=Game.ObjectsById.length-1; i >= 0; i--) {
			let timeToBuy = CookieAutoClicker.calcPurchaseInSeconds(Game.ObjectsById[i].name);
			let deltaCps = CookieAutoClicker.calcPurchaseCps(Game.ObjectsById[i].name);
			
			if(Game.ObjectsById[i].locked == 0 && deltaCps != 0) {
				let roi = timeToBuy + (Game.ObjectsById[i].price / deltaCps);
				if(roi < bestRoi) {
					bestRoi = roi;
					bestId = Game.ObjectsById[i].id;
				}
			}
		}
	
		return [Game.ObjectsById[bestId].name, bestRoi];
	}
	
	CookieAutoClicker.calcBestBuildingStacked = function() {
		let bestObj = {};
		
		let list = [];
		for(let i=Game.ObjectsById.length-1; i >= 0; i--) {
			obj = Game.ObjectsById[i];
			let timeToBuy = CookieAutoClicker.calcPurchaseInSeconds(obj.name);
			let deltaCps = CookieAutoClicker.calcPurchaseCps(obj.name);
			
			if(obj.locked == 0 && deltaCps != 0) {
				me.name = obj.name;
				me.roi = timeToBuy + (obj.price / deltaCps);
				me.cost = obj.price
				me.deltaCps = deltaCps;
				me.timeToBuy = timeToBuy;
				list.push(me);
				
				if(me.roi < bestObj.roi) {
					bestObj = me;
				}
			}
		}
		
		list.sort((a, b) => 
			  (a.cost > b.cost) ? 1 :
			  (a.roi > b.roi) ? 1 :
			  -1
		);
		let bestIdx = list.findIndex(bestObj);
		
		for(let i=0; i < bestIdx-1; i++) {
			
			let cookiesAfterFirst = Game.cookies-list[i].cost;
			let cpsAfterFirst = CookieAutoClicker.calcCookiesPerSecond()+list[i].deltaCps;
			let timeFromFirstToBest = Math.max(0, (bestObj.cost-cookiesAfterFirst) / cpsAfterFirst);
			let deltaCps = CookieAutoClicker.calcPurchaseCps([list[i].name, bestObj.name]);
			
			let roi = list[i].timeToBuy + timeFromFirstToBest + ((list[i].cost+bestIdx.cost) / deltaCps);
			
			if(roi <= bestObj.roi) {
				console.log("Double ROI! " + list[i].name + " => " + bestObject.name);
				bestObj = list[i];
				break;
			}
		}
	
		return [bestObj.name, bestObj.roi];
	}
	
	CookieAutoClicker.calcBestUpgrade = function() {
		let bestRoi = Number.POSITIVE_INFINITY;
		let bestId = -1;
		for(let i=0; i < Game.UpgradesInStore.length; i++) {
			let deltaCps = 0;
			let itemName = Game.UpgradesInStore[i].name;
			
			if(itemName == 'Festive biscuit' || 
			   itemName == 'Ghostly biscuit' ||
			   itemName == 'Lovesick biscuit' ||
			   itemName == 'Fool\'s biscuit' ||
			   itemName == 'Bunny biscuit'  ||
			   itemName == 'Chocolate egg' ||
			   itemName == 'Golden switch [off]' ||
			   itemName == 'Golden switch [on]' ||
			   itemName == 'Shimmering veil [off]' ||
			   itemName == 'Shimmering veil [on]' ||
			   itemName == 'Golden cookie sound selector' ||
			   itemName == 'Background selector' ||
			   itemName == 'Milk selector'
			) {
				continue;
			}
			
			let timeToBuy = CookieAutoClicker.calcPurchaseInSeconds(itemName);
			let secondsOfCps = CookieAutoClicker.calcPurchaseInSeconds(itemName, false);
			
			if(itemName == 'Bingo center/Research facility') {
				deltaCps = (secondsOfCps < 60) ? (Game.UpgradesInStore[i].getPrice()*Number.MAX_SAFE_INTEGER)+Number.EPSILON : CookieAutoClicker.calcPurchaseCps(itemName);
			}
			else if(itemName == 'One mind') {
				deltaCps = -1; //Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(itemName == 'Communal brainsweep') {
				deltaCps = -1;
			}
			else if(itemName == 'Elder Pact') {
				deltaCps = -1;
			}
			else if(itemName == 'Lucky day') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice()*Number.MAX_SAFE_INTEGER : -1;
			}
			else if(itemName == 'Serendipity') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice()*Number.MAX_SAFE_INTEGER : -1;
			}
			else if(itemName == 'Get lucky') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice()*Number.MAX_SAFE_INTEGER : -1;
			}
			else if(secondsOfCps < 10) {
				deltaCps = (Game.UpgradesInStore[i].getPrice()*Number.MAX_SAFE_INTEGER)+Number.EPSILON;
			}
			else {
				deltaCps = CookieAutoClicker.calcPurchaseCps(itemName);
			}
			
			if(deltaCps > 0) {
				let roi = timeToBuy + (Game.UpgradesInStore[i].getPrice() / deltaCps);
				if(roi < bestRoi) {
					bestRoi = roi;
					bestId = Game.UpgradesInStore[i].id;
				}
			}
		}
	
		return [(bestId != -1)?Game.UpgradesById[bestId].name:null, bestRoi];
	}
	
	CookieAutoClicker.clickGoldenCookie = function() {
		for(let i = 0; i < Game.shimmers.length; i++) {
			if(Game.shimmers[i].type == 'golden') {
				Game.shimmers[i].pop();
				CookieAutoClicker.castForceHand();
			}
		}
	}
	
	CookieAutoClicker.calcPurchaseCps = function(itemNames) {		
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		let gains = CookieAutoClicker.CalculateGains(itemNames);
		let newCps = gains[0] + (gains[1] * CookieAutoClicker.clicksPerSecond);
	
		return newCps - curCps;
	}
		
	CookieAutoClicker.calcHeavenlyChips = function() {
		return Game.prestige + Game.ascendMeterLevel;
	}
	
	CookieAutoClicker.Ascend = async function() {
		Game.Ascend(1);
		await CookieAutoClicker.sleep(8000);
		
		// 1st
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Legacy'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heavenly cookies'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['How to bake your dragon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Tin of butter cookies'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Tin of british tea biscuits'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of brand biscuits'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of macarons'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starter kit'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heavenly luck'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot I'].id);
		if(Game.Has('Permanent upgrade slot I')){
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(Game.Upgrades[CookieAutoClicker.calcBestKittenUpgrade()].id,0);
			await CookieAutoClicker.sleep(500);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(500);
		}
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Heralds'].id);
		
		// 2nd
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lasting fortune'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Golden switch'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Season switcher'].id);
		
		// 3rd
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Classic dairy selection'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Basic wallpaper assortment'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Persistent memory'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lucky digit'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Twin Gates of Transcendence'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Belphegor'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Angels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Mammon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Archangels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Abaddon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Virtues'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Dominions'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Kitten angels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot II'].id);
		if(Game.Has('Permanent upgrade slot II')){
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(0,1);
			await CookieAutoClicker.sleep(500);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(500);
		}
		
		// 4th
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Satan'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starter kitchen'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Decisive fate'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Golden cookie alert sound'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Unholy bait'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Halo gloves'].id);
 
		// 5th
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lucky number'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Residual luck'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Synergies Vol. I'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Elder spice'].id);
 
		// 6th
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Cherubim'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Asmodeus'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Divine sales'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Divine discount'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Seraphim'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Beelzebub'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Divine bakeries'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Synergies Vol. II'].id);

		// 7th
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sacrilegious corruption'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starspawn'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starsnow'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starterror'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Starlove'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Startrade'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Five-finger discount'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Inspired checklist'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot III'].id);
		if(Game.Has('Permanent upgrade slot III')){
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(1,2);
			await CookieAutoClicker.sleep(500);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(500);
		}
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Distilled essence of redoubled luck'].id);
		
		
		// 8th - 12,313,751 - Total HC: 29,644,743 - 26.052 decillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Label printer'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Fanciful dairy selection'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['God'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lucifer'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Genius accounting'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Wrinkly cookies'].id);

		// 9th - 77,777,777 - Total HC: 107,422,520 - 1.2396 undecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Lucky payout'].id);

		// 10th - 240,353,606 - Total HC: 347,776,126 - 42.063 undecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Chimera'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Eye of the wrinkler'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Stevia caelestis'].id);

		// 11th - 900M - Total HC: 1,247,776,126 - 1.9427 duodecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sugar baking'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Diabetica daemonicus'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot IV'].id);
		if(Game.Has('Permanent upgrade slot IV')){
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(2,3);
			await CookieAutoClicker.sleep(500);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(500);
		}

		// 12th - 3B - Total HC: 4,247,776,126 - 76.645 duodecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sugar craving'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sugar aging process'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sucralosia inutilis'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Sugar crystal cookies'].id);

		// 13th - 11,111,111,110 - Total HC: 15,358,887,236 - 3.6231 tredecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Shimmering veil'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Keepsakes'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Kitten wages'].id);

		// 14th - 30,555,555,525 - Total HC: 45,914,442,761 - 96.794 tredecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Aura gloves'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Cosmic beginner\'s luck'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Reinforced membrane'].id);

		// 15th - 86,777,777,777 - Total HC: 132,692,220,538 - 2.3363 quattuordecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Cat ladies'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Fortune cookies'].id);

		// 16th - 383B - Total HC: 515,692,220,538 - 137.14 quattuordecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot V'].id);
		if(Game.Has('Permanent upgrade slot IV')){
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(3,4);
			await CookieAutoClicker.sleep(500);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(500);
		}
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of pastries'].id);

		// 17th - 333B - Total HC: 848,692,220,538 - 611.29 quattuordecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of not cookies'].id);

		// 18th - 488,555,555,554 - Total HC: 1,337,247,776,092 - 2.3913 quindecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Luminous gloves'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Pet the dragon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Box of maybe cookies'].id);

		// 19th - 900B - Total HC: 2,237,247,776,092 - 11.198 quindecillion
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Milkhelp lactose intolerance relief tablets'].id);
		
		Game.Reincarnate(1);
		await CookieAutoClicker.sleep(2000);
	}
	
	{
		let kittenUpgrades = ['Kitten helpers','Kitten workers','Kitten engineers','Kitten overseers','Kitten managers','Kitten accountants','Kitten specialists',
				      'Kitten experts','Kitten consultants','Kitten assistants to the regional manager','Kitten marketeers','Kitten analysts',
				      'Kitten executives','Kitten angels','Fortune #103'];
		CookieAutoClicker.calcBestKittenUpgrade = function() {
			for(let i = kittenUpgrades.length-1; i >= 0; i--) {
				if(Game.Upgrades[kittenUpgrades[i]].bought == 1) {
					return kittenUpgrades[i];
				}
			}
		}
		
	}
	
	{
		let hcBreakpoints = [440, 3327, 36917, 162088, 10006777, 4097661, 17330992, 29644743, 107777777, 347776126, 1247776126, 4247776126,
				     15358887236, 45914442761, 132692220538, 515692220538, 848692220538, 1337247776092, 2237247776092];
		let nextBreakpointIdx = 0;
		for(let i = hcBreakpoints.length-1; i >= 0; i--) {
			if(Game.prestige > hcBreakpoints[i]){
				nextBreakpointIdx = i+1;
				break;
			}
		}
		CookieAutoClicker.TryDoPrestige = function() {
			if(nextBreakpointIdx >= hcBreakpoints.Count) {
				if(Game.ascendMeterLevel >= Game.prestige){
					CookieAutoClicker.Ascend();
				}
			}
			else if(CookieAutoClicker.calcHeavenlyChips() >= hcBreakpoints[nextBreakpointIdx]) {
				//console.log("Attempting to Prestige at :" + CookieAutoClicker.calcHeavenlyChips() +" / "+ hcBreakpoints[nextBreakpointIdx])
				CookieAutoClicker.Ascend();
				nextBreakpointIdx++;
			}
		}
	}
	
CookieAutoClicker.CalculateGains=function(considered)
	{
		cookiesPs=0;
		let mult=1;
		//add up effect bonuses from building minigames
		let effs={};
		for (let i in Game.Objects)
		{
			if (Game.Objects[i].minigameLoaded && Game.Objects[i].minigame.effs)
			{
				let myEffs=Game.Objects[i].minigame.effs;
				for (let ii in myEffs)
				{
					if (effs[ii]) effs[ii]*=myEffs[ii];
					else effs[ii]=myEffs[ii];
				}
			}
		}
		CookieAutoClicker.calculatedEffs = effs;

		if (Game.ascensionMode!=1) mult+=parseFloat(Game.prestige)*0.01*Game.heavenlyPower*Game.GetHeavenlyMultiplier();

		mult*=(typeof effs['cps']==='undefined') ? (typeof def==='undefined'?1:def) : effs['cps'];

		if (Game.Has('Heralds') && Game.ascensionMode!=1) mult*=1+0.01*Game.heralds;

		for (let i in Game.cookieUpgrades)
		{
			let me=Game.cookieUpgrades[i];
			if (Game.Has(me.name) || considered.includes(me.name))
			{
				mult*=(1+(typeof(me.power)==='function'?me.power(me):me.power)*0.01);
			}
		}

		if (Game.Has('Specialized chocolate chips') || considered.includes('Specialized chocolate chips')) mult*=1.01;
		if (Game.Has('Designer cocoa beans') || considered.includes('Designer cocoa beans')) mult*=1.02;
		if (Game.Has('Underworld ovens') || considered.includes('Underworld ovens')) mult*=1.03;
		if (Game.Has('Exotic nuts') || considered.includes('Exotic nuts')) mult*=1.04;
		if (Game.Has('Arcane sugar') || considered.includes('Arcane sugar')) mult*=1.05;

		if (Game.Has('Increased merriness') || considered.includes('Increased merriness')) mult*=1.15;
		if (Game.Has('Improved jolliness') || considered.includes('Improved jolliness')) mult*=1.15;
		if (Game.Has('A lump of coal') || considered.includes('A lump of coal')) mult*=1.01;
		if (Game.Has('An itchy sweater') || considered.includes('An itchy sweater')) mult*=1.01;
		if (Game.Has('Santa\'s dominion') || considered.includes('Santa\'s dominion')) mult*=1.2;

		if (Game.Has('Fortune #100') || considered.includes('Fortune #100')) mult*=1.01;
		if (Game.Has('Fortune #101') || considered.includes('Fortune #101')) mult*=1.07;

		if (Game.Has('Dragon scale') || considered.includes('Dragon scale')) mult*=1.03;

		let buildMult=1;
		if (Game.hasGod)
		{
			let godLvl=Game.hasGod('asceticism');
			if (godLvl==1) mult*=1.15;
			else if (godLvl==2) mult*=1.1;
			else if (godLvl==3) mult*=1.05;

			godLvl=Game.hasGod('ages');
			if (godLvl==1) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*3))*Math.PI*2);
			else if (godLvl==2) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*12))*Math.PI*2);
			else if (godLvl==3) mult*=1+0.15*Math.sin((Date.now()/1000/(60*60*24))*Math.PI*2);

			godLvl=Game.hasGod('decadence');
			if (godLvl==1) buildMult*=0.93;
			else if (godLvl==2) buildMult*=0.95;
			else if (godLvl==3) buildMult*=0.98;

			godLvl=Game.hasGod('industry');
			if (godLvl==1) buildMult*=1.1;
			else if (godLvl==2) buildMult*=1.06;
			else if (godLvl==3) buildMult*=1.03;

			godLvl=Game.hasGod('labor');
			if (godLvl==1) buildMult*=0.97;
			else if (godLvl==2) buildMult*=0.98;
			else if (godLvl==3) buildMult*=0.99;
		}

		if (Game.Has('Santa\'s legacy') || considered.includes('Santa\'s legacy')) mult*=1+(Game.santaLevel+1)*0.03;

		milkProgress=Game.AchievementsOwned/25;
		let milkMult=1;
		if (Game.Has('Santa\'s milk and cookies') || considered.includes('Santa\'s milk and cookies')) milkMult*=1.05;
		//if (Game.hasAura('Breath of Milk')) milkMult*=1.05;
		milkMult*=1+Game.auraMult('Breath of Milk')*0.05;
		if (Game.hasGod)
		{
			let godLvl=Game.hasGod('mother');
			if (godLvl==1) milkMult*=1.1;
			else if (godLvl==2) milkMult*=1.05;
			else if (godLvl==3) milkMult*=1.03;
		}
		milkMult*=(typeof effs['milk']==='undefined') ? (typeof def==='undefined'?1:def) : effs['milk'];

		let catMult=1;

		if (Game.Has('Kitten helpers') || considered.includes('Kitten helpers')) catMult*=(1+milkProgress*0.1*milkMult);
		if (Game.Has('Kitten workers') || considered.includes('Kitten workers')) catMult*=(1+milkProgress*0.125*milkMult);
		if (Game.Has('Kitten engineers') || considered.includes('Kitten engineers')) catMult*=(1+milkProgress*0.15*milkMult);
		if (Game.Has('Kitten overseers') || considered.includes('Kitten overseers')) catMult*=(1+milkProgress*0.175*milkMult);
		if (Game.Has('Kitten managers') || considered.includes('Kitten managers')) catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten accountants') || considered.includes('Kitten accountants')) catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten specialists') || considered.includes('Kitten specialists')) catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten experts') || considered.includes('Kitten experts')) catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten consultants') || considered.includes('Kitten consultants')) catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten assistants to the regional manager') || considered.includes('Kitten assistants to the regional manager')) catMult*=(1+milkProgress*0.175*milkMult);
		if (Game.Has('Kitten marketeers') || considered.includes('Kitten marketeers')) catMult*=(1+milkProgress*0.15*milkMult);
		if (Game.Has('Kitten analysts') || considered.includes('Kitten analysts')) catMult*=(1+milkProgress*0.125*milkMult);
		if (Game.Has('Kitten executives') || considered.includes('Kitten executives')) catMult*=(1+milkProgress*0.115*milkMult);
		if (Game.Has('Kitten angels') || considered.includes('Kitten angels')) catMult*=(1+milkProgress*0.1*milkMult);
		if (Game.Has('Fortune #103') || considered.includes('Fortune #103')) catMult*=(1+milkProgress*0.05*milkMult);

		let cookiesPsByType=[];
		for (let i in Game.Objects)
		{
			let me=Game.Objects[i];
			storedCps=me.cps(me);
			if (Game.ascensionMode!=1) me.storedCps*=(1+me.level*0.01)*buildMult;
			if (me.id==1 && Game.Has('Milkhelp&reg; lactose intolerance relief tablets') || considered.includes('Milkhelp&reg; lactose intolerance relief tablets')) storedCps*=1+0.05*milkProgress*milkMult;//this used to be "me.storedCps*=1+0.1*Math.pow(catMult-1,0.5)" which was. hmm
			storedTotalCps=(me.amount + (considered.includes(me.name)?1:0))*storedCps;
			cookiesPs+=storedTotalCps;
			cookiesPsByType[me.name]=storedTotalCps;
		}
		//cps from buildings only
		buildingCps=cookiesPs;

		if (Game.Has('"egg"') || considered.includes('"egg"')) {cookiesPs+=9;cookiesPsByType['"egg"']=9;}//"egg"

		mult*=catMult;

		let eggMult=1;
		if (Game.Has('Chicken egg') || considered.includes('Chicken egg')) eggMult*=1.01;
		if (Game.Has('Duck egg') || considered.includes('Duck egg')) eggMult*=1.01;
		if (Game.Has('Turkey egg') || considered.includes('Turkey egg')) eggMult*=1.01;
		if (Game.Has('Quail egg') || considered.includes('Quail egg')) eggMult*=1.01;
		if (Game.Has('Robin egg') || considered.includes('Robin egg')) eggMult*=1.01;
		if (Game.Has('Ostrich egg') || considered.includes('Ostrich egg')) eggMult*=1.01;
		if (Game.Has('Cassowary egg') || considered.includes('Cassowary egg')) eggMult*=1.01;
		if (Game.Has('Salmon roe') || considered.includes('Salmon roe')) eggMult*=1.01;
		if (Game.Has('Frogspawn') || considered.includes('Frogspawn')) eggMult*=1.01;
		if (Game.Has('Shark egg') || considered.includes('Shark egg')) eggMult*=1.01;
		if (Game.Has('Turtle egg') || considered.includes('Turtle egg')) eggMult*=1.01;
		if (Game.Has('Ant larva') || considered.includes('Ant larva')) eggMult*=1.01;
		if (Game.Has('Century egg') || considered.includes('Century egg'))
		{
			//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
			let day=Math.floor((Date.now()-Game.startDate)/1000/10)*10/60/60/24;
			day=Math.min(day,100);
			eggMult*=1+(1-Math.pow(1-day/100,3))*0.1;
		}

		mult*=eggMult;

		if (Game.Has('Sugar baking') || considered.includes('Sugar baking')) mult*=(1+Math.min(100,Game.lumps)*0.01);

		//if (Game.hasAura('Radiant Appetite')) mult*=2;
		mult*=1+Game.auraMult('Radiant Appetite');

		let rawCookiesPs=cookiesPs*mult;
		cookiesPsRaw=rawCookiesPs;
		cookiesPsRawHighest=Math.max(Game.cookiesPsRawHighest,rawCookiesPs);

		let n=Game.shimmerTypes['golden'].n;
		let auraMult=Game.auraMult('Dragon\'s Fortune');
		for (let i=0;i<n;i++){mult*=1+auraMult*1.23;}

		name=Game.bakeryName.toLowerCase();
		if (name=='orteil') mult*=0.99;
		else if (name=='ortiel') mult*=0.98;//or so help me

		let sucking=0;
		for (let i in Game.wrinklers)
		{
			if (Game.wrinklers[i].phase==2)
			{
				sucking++;
			}
		}
		let suckRate=1/20;//each wrinkler eats a twentieth of your CpS
		suckRate*=(typeof effs['wrinklerEat']==='undefined') ? (typeof def==='undefined'?1:def) : effs['wrinklerEat'];

		cpsSucked=sucking*suckRate;


		if (Game.Has('Elder Covenant') || considered.includes('Elder Covenant')) mult*=0.95;

		if (Game.Has('Golden switch [off]') || considered.includes('Golden switch [off]'))
		{
			let goldenSwitchMult=1.5;
			if (Game.Has('Residual luck') || considered.includes('Residual luck'))
			{
				let upgrades=Game.goldenCookieUpgrades;
				for (let i in upgrades) {if (Game.Has(upgrades[i]) || considered.includes(upgrades[i].name)) goldenSwitchMult+=0.1;}
			}
			mult*=goldenSwitchMult;
		}
		if (Game.Has('Shimmering veil [off]') || considered.includes('Shimmering veil [off]'))
		{
			let veilMult=0.5;
			if (Game.Has('Reinforced membrane') || considered.includes('Reinforced membrane')) veilMult+=0.1;
			mult*=1+veilMult;
		}
		if (Game.Has('Magic shenanigans') || considered.includes('Magic shenanigans')) mult*=1000;
		if (Game.Has('Occult obstruction') || considered.includes('Occult obstruction')) mult*=0;


		cookiesPs=Game.runModHookOnValue('cps',cookiesPs);


		//cps without golden cookie effects
		unbuffedCps=cookiesPs*mult;

		for (let i in Game.buffs)
		{
			if (typeof Game.buffs[i].multCpS!=='undefined') mult*=Game.buffs[i].multCpS;
		}

		globalCpsMult=mult;
		cookiesPs*=globalCpsMult;

		//if (Game.hasBuff('Cursed finger')) cookiesPs=0;

		computedMouseCps=CookieAutoClicker.mouseCps(considered);

		return [cookiesPs, computedMouseCps];
	}
	
	CookieAutoClicker.mouseCps=function(considered) {
		
		let effs = CookieAutoClicker.calculatedEffs;
		
		var add=0;
		if (Game.Has('Thousand fingers') || considered.includes('Thousand fingers')) add+=		0.1;
		if (Game.Has('Million fingers') || considered.includes('Million fingers')) add*=		5;
		if (Game.Has('Billion fingers') || considered.includes('Billion fingers')) add*=		10;
		if (Game.Has('Trillion fingers') || considered.includes('Trillion fingers')) add*=		20;
		if (Game.Has('Quadrillion fingers') || considered.includes('Quadrillion fingers')) add*=	20;
		if (Game.Has('Quintillion fingers') || considered.includes('Quintillion fingers')) add*=	20;
		if (Game.Has('Sextillion fingers') || considered.includes('Sextillion fingers')) add*=	20;
		if (Game.Has('Septillion fingers') || considered.includes('Septillion fingers')) add*=	20;
		if (Game.Has('Octillion fingers') || considered.includes('Octillion fingers')) add*=	20;
		if (Game.Has('Nonillion fingers') || considered.includes('Nonillion fingers')) add*=	20;

		var num=0;
		for (var i in Game.Objects) {num+=Game.Objects[i].amount;}
		num-=Game.Objects['Cursor'].amount;
		add=add*num;
		if (Game.Has('Plastic mouse') || considered.includes('Plastic mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Iron mouse') || considered.includes('Iron mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Titanium mouse') || considered.includes('Titanium mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Adamantium mouse') || considered.includes('Adamantium mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Unobtainium mouse') || considered.includes('Unobtainium mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Eludium mouse') || considered.includes('Eludium mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Wishalloy mouse') || considered.includes('Wishalloy mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Fantasteel mouse') || considered.includes('Fantasteel mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Nevercrack mouse') || considered.includes('Nevercrack mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Armythril mouse') || considered.includes('Armythril mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Technobsidian mouse') || considered.includes('Technobsidian mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Plasmarble mouse') || considered.includes('Plasmarble mouse')) add+=Game.cookiesPs*0.01;
		if (Game.Has('Miraculite mouse') || considered.includes('Miraculite mouse')) add+=Game.cookiesPs*0.01;

		if (Game.Has('Fortune #104') || considered.includes('Fortune #104')) add+=Game.cookiesPs*0.01;
		var mult=1;

		if (Game.Has('Santa\'s helpers') || considered.includes('Santa\'s helpers')) mult*=1.1;
		if (Game.Has('Cookie egg') || considered.includes('Cookie egg')) mult*=1.1;
		if (Game.Has('Halo gloves') || considered.includes('Halo gloves')) mult*=1.1;
		if (Game.Has('Dragon claw') || considered.includes('Dragon claw')) mult*=1.03;

		if (Game.Has('Aura gloves') || considered.includes('Aura gloves'))
		{
			mult*=1+0.05*Math.min(Game.Objects['Cursor'].level,(Game.Has('Luminous gloves') || considered.includes('Luminous gloves'))?20:10);
		}

		mult*=(typeof effs['click']==='undefined') ? (typeof def==='undefined'?1:def) : effs['click'];

		if (Game.hasGod)
		{
			var godLvl=Game.hasGod('labor');
			if (godLvl==1) mult*=1.15;
			else if (godLvl==2) mult*=1.1;
			else if (godLvl==3) mult*=1.05;
		}

		for (var i in Game.buffs)
		{
			if (typeof Game.buffs[i].multClick != 'undefined') mult*=Game.buffs[i].multClick;
		}

		//if (Game.hasAura('Dragon Cursor')) mult*=1.05;
		mult*=1+Game.auraMult('Dragon Cursor')*0.05;

		let pow = (Game.Has('Reinforced index finger') || considered.includes('Reinforced index finger'))+(Game.Has('Carpal tunnel prevention cream') || considered.includes('Carpal tunnel prevention cream'))+(Game.Has('Ambidextrous') || considered.includes('Ambidextrous'));
		var out=mult*(Math.pow(2,pow)+add);

		out=Game.runModHookOnValue('cookiesPerClick',out);

		if (Game.hasBuff('Cursed finger')) out=Game.buffs['Cursed finger'].power;
		return out;
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
		
		CookieAutoClicker.addTimers();
	}
	
	CookieAutoClicker.addTimers = function(){
	  const parent = document.querySelector('#topBar');
	  let newElement = document.createElement('div');
	  newElement.id = "timerBar";
	  newElement.textContent = "";
	  parent.insertBefore(newElement, parent.lastChild);
	}
	
	CookieAutoClicker.updateDisplay = function(newPurchase){
		if(newPurchase != nextPurchase && newPurchase != "") {
			let element = document.querySelector('#nextPurchase');
			element.textContent = "Next: " + newPurchase;
			CookieAutoClicker.nextPurchase = newPurchase;
		}
		
		document.querySelector('#timerBar').textContent = "Million: " + CookieAutoClicker.msToTime(CookieAutoClicker.millionCookiesTimer) + 
			" | HC: " + CookieAutoClicker.msToTime(CookieAutoClicker.firstHCTimer) + 
			" | Ascend: " + CookieAutoClicker.msToTime(CookieAutoClicker.firstAscendTimer);
	}
	
	CookieAutoClicker.sleep = function(ms) {
		  return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	CookieAutoClicker.msToTime = function(ms) {
		let seconds = Math.floor(ms / 1000)%60;
		let minutes = Math.floor(ms / 60000);
		let hours = Math.floor(ms / 3600000);
		let days = Math.floor(ms / 86400000);
		let years = Math.floor(ms / 31536000000);
		
		return (years==0?"":(years + "y ")) + (days==0?"":(days%365 + "d ")) + (hours==0?"":(hours%24 + "h ")) + (minutes==0?"":(minutes%60 + "m ")) + seconds + "s";
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
