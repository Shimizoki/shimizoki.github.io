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
	
		setInterval(() => {
			CookieAutoClicker.TryDoPrestige();
		}, 100)
		
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

	CookieAutoClicker.calcPurchaseInSeconds = function(item, useBank=true) {
		let price = Game.Upgrades[item] ? Game.Upgrades[item].getPrice() : Game.Objects[item].price;
		let cps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
		
		return Math.max(0, (price-(useBank?Game.cookies:0)) / cps);
	}
	
	CookieAutoClicker.calcBestBuilding = function() {
		let bestRoi = 10000000000000;
		let bestIdx = -1;
		for(let i=Game.ObjectsById.length-1; i >= 0; i--) {
			let timeToBuy = CookieAutoClicker.calcPurchaseInSeconds(Game.ObjectsById[i].name);
			let deltaCps = CookieAutoClicker.calcBuildingCps(i);
			if(Game.ObjectsById[i].locked == 0 && deltaCps != 0) {
				let roi = timeToBuy + (Game.ObjectsById[i].price / deltaCps);
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
			
			if(Game.UpgradesInStore[i].name == 'Festive biscuit' || 
			   Game.UpgradesInStore[i].name == 'Ghostly biscuit' ||
			   Game.UpgradesInStore[i].name == 'Lovesick biscuit' ||
			   Game.UpgradesInStore[i].name == 'Fool\'s biscuit' ||
			   Game.UpgradesInStore[i].name == 'Bunny biscuit'  ||
			   Game.UpgradesInStore[i].name == 'Chocolate egg' ||
			   Game.UpgradesInStore[i].name == 'Golden switch [off]' ||
			   Game.UpgradesInStore[i].name == 'Golden switch [on]' ||
			   Game.UpgradesInStore[i].name == 'Shimmering veil [off]' ||
			   Game.UpgradesInStore[i].name == 'Shimmering veil [on]' 
			) {
				continue;
			}
			
			let timeToBuy = CookieAutoClicker.calcPurchaseInSeconds(Game.UpgradesInStore[i].name);
			let secondsOfCps = CookieAutoClicker.calcPurchaseInSeconds(Game.UpgradesInStore[i].name, false);
			
			if(Game.UpgradesInStore[i].name == 'Bingo center/Research facility') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice() : CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Specialized chocolate chips') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Designer cocoa beans') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Ritual rolling pins') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Underworld ovens') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Exotic nuts') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'Arcane sugar') {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			else if(Game.UpgradesInStore[i].name == 'One mind') {
				deltaCps = -1; //Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Communal brainsweep') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Elder Pact') {
				deltaCps = Game.UpgradesInStore[i].getPrice() / 50000;
			}
			else if(Game.UpgradesInStore[i].name == 'Lucky day') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice() : -1;
			}
			else if(Game.UpgradesInStore[i].name == 'Serendipity') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice() : -1;
			}
			else if(Game.UpgradesInStore[i].name == 'Get lucky') {
				deltaCps = (secondsOfCps < 60) ? Game.UpgradesInStore[i].getPrice() : -1;
			}
			else if(secondsOfCps < 10) {
				deltaCps = Game.UpgradesInStore[i].getPrice();
			}
			else {
				deltaCps = CookieAutoClicker.calcUpgradeCps(i);
			}
			
			if(deltaCps > 0) {
				let roi = timeToBuy + (Game.UpgradesInStore[i].getPrice() / deltaCps);
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
	
	CookieAutoClicker.calcPurchaseCps = function(itemName) {
		let item = Game.UpgradesInStore[itemIdx] ? Game.UpgradesInStore[itemIdx] : Game.ObjectsById[itemIdx];
		
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		let gains = CookieAutoClicker.CalculateGains(item.name);
		let newCps = gains[0] + (gains[1] * CookieAutoClicker.clicksPerSecond);
	
		return newCps - curCps;
	}
	
	CookieAutoClicker.calcBuildingCps = function(buildingId) {
	
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
	
		let gains = CookieAutoClicker.CalculateGains(Game.ObjectsById[buildingId].name);
		let newCps = gains[0] + (gains[1] * CookieAutoClicker.clicksPerSecond);
	
		return newCps - curCps;
	}
	
	CookieAutoClicker.calcUpgradeCps = function(upgradeId) {
		let curCps = Game.cookiesPs + (Game.computedMouseCps * CookieAutoClicker.clicksPerSecond);
			
		let gains = CookieAutoClicker.CalculateGains(Game.UpgradesInStore[upgradeId].name);
		let newCps = gains[0] + (gains[1] * CookieAutoClicker.clicksPerSecond);
		
		return newCps - curCps;
	}
	
	CookieAutoClicker.calcHeavenlyChips = function() {
		return Game.prestige + Game.ascendMeterLevel;
	}
	
	CookieAutoClicker.Ascend = async function() {
		Game.Ascend(1);
		await CookieAutoClicker.sleep(2000);
		
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
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(8,0);
			await CookieAutoClicker.sleep(1000);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(1000);
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
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Abbadon'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Virtues'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Dominions'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Kitten Angels'].id);
		Game.PurchaseHeavenlyUpgrade(Game.Upgrades['Permanent upgrade slot II'].id);
			await CookieAutoClicker.sleep(1000);
			Game.PutUpgradeInPermanentSlot(8,0);
			await CookieAutoClicker.sleep(1000);
			document.querySelector('#promptOption0').click();
			await CookieAutoClicker.sleep(1000);
		
		Game.Reincarnate(1);
		await CookieAutoClicker.sleep(2000);
	}
	
	{
		let hcBreakpoints = [440, 3327, 36917, 162088, 10006777, 4097661];
		let nextBreakpointIdx = 0;
		for(let i = 0; i < hcBreakpoints.Count; i++) {
			if(Game.prestige < hcBreakpoints[i]){
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
	
	CookieAutoClicker.CalculateGains=function(newUpgrade)
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
			if (Game.Has(me.name) || newUpgrade == me.name)
			{
				mult*=(1+(typeof(me.power)==='function'?me.power(me):me.power)*0.01);
			}
		}

		if (Game.Has('Specialized chocolate chips') || newUpgrade == 'Specialized chocolate chips') mult*=1.01;
		if (Game.Has('Designer cocoa beans') || newUpgrade == 'Designer cocoa beans') mult*=1.02;
		if (Game.Has('Underworld ovens') || newUpgrade == 'Underworld ovens') mult*=1.03;
		if (Game.Has('Exotic nuts') || newUpgrade == 'Exotic nuts') mult*=1.04;
		if (Game.Has('Arcane sugar') || newUpgrade == 'Arcane sugar') mult*=1.05;

		if (Game.Has('Increased merriness') || newUpgrade == 'Increased merriness') mult*=1.15;
		if (Game.Has('Improved jolliness') || newUpgrade == 'Improved jolliness') mult*=1.15;
		if (Game.Has('A lump of coal') || newUpgrade == 'A lump of coal') mult*=1.01;
		if (Game.Has('An itchy sweater') || newUpgrade == 'An itchy sweater') mult*=1.01;
		if (Game.Has('Santa\'s dominion') || newUpgrade == 'Santa\'s dominion') mult*=1.2;

		if (Game.Has('Fortune #100') || newUpgrade == 'Fortune #100') mult*=1.01;
		if (Game.Has('Fortune #101') || newUpgrade == 'Fortune #101') mult*=1.07;

		if (Game.Has('Dragon scale') || newUpgrade == 'Dragon scale') mult*=1.03;

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

		if (Game.Has('Santa\'s legacy') || newUpgrade == 'Santa\'s legacy') mult*=1+(Game.santaLevel+1)*0.03;

		milkProgress=Game.AchievementsOwned/25;
		let milkMult=1;
		if (Game.Has('Santa\'s milk and cookies') || newUpgrade == 'Santa\'s milk and cookies') milkMult*=1.05;
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

		if (Game.Has('Kitten helpers') || newUpgrade == 'Kitten helpers') catMult*=(1+milkProgress*0.1*milkMult);
		if (Game.Has('Kitten workers') || newUpgrade == 'Kitten workers') catMult*=(1+milkProgress*0.125*milkMult);
		if (Game.Has('Kitten engineers') || newUpgrade == 'Kitten engineers') catMult*=(1+milkProgress*0.15*milkMult);
		if (Game.Has('Kitten overseers') || newUpgrade == 'Kitten overseers') catMult*=(1+milkProgress*0.175*milkMult);
		if (Game.Has('Kitten managers') || newUpgrade == 'Kitten managers') catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten accountants') || newUpgrade == 'Kitten accountants') catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten specialists') || newUpgrade == 'Kitten specialists') catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten experts') || newUpgrade == 'Kitten experts') catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten consultants') || newUpgrade == 'Kitten consultants') catMult*=(1+milkProgress*0.2*milkMult);
		if (Game.Has('Kitten assistants to the regional manager') || newUpgrade == 'Kitten assistants to the regional manager') catMult*=(1+milkProgress*0.175*milkMult);
		if (Game.Has('Kitten marketeers') || newUpgrade == 'Kitten marketeers') catMult*=(1+milkProgress*0.15*milkMult);
		if (Game.Has('Kitten analysts') || newUpgrade == 'Kitten analysts') catMult*=(1+milkProgress*0.125*milkMult);
		if (Game.Has('Kitten executives') || newUpgrade == 'Kitten executives') catMult*=(1+milkProgress*0.115*milkMult);
		if (Game.Has('Kitten angels') || newUpgrade == 'Kitten angels') catMult*=(1+milkProgress*0.1*milkMult);
		if (Game.Has('Fortune #103') || newUpgrade == 'Fortune #103') catMult*=(1+milkProgress*0.05*milkMult);

		let cookiesPsByType=[];
		for (let i in Game.Objects)
		{
			let me=Game.Objects[i];
			storedCps=me.cps(me);
			if (Game.ascensionMode!=1) me.storedCps*=(1+me.level*0.01)*buildMult;
			if (me.id==1 && Game.Has('Milkhelp&reg; lactose intolerance relief tablets') || newUpgrade == 'Milkhelp&reg; lactose intolerance relief tablets') storedCps*=1+0.05*milkProgress*milkMult;//this used to be "me.storedCps*=1+0.1*Math.pow(catMult-1,0.5)" which was. hmm
			storedTotalCps=(me.amount + ((newUpgrade == me.name)?1:0))*storedCps;
			cookiesPs+=storedTotalCps;
			cookiesPsByType[me.name]=storedTotalCps;
		}
		//cps from buildings only
		buildingCps=cookiesPs;

		if (Game.Has('"egg"') || newUpgrade == '"egg"') {cookiesPs+=9;cookiesPsByType['"egg"']=9;}//"egg"

		mult*=catMult;

		let eggMult=1;
		if (Game.Has('Chicken egg') || newUpgrade == 'Chicken egg') eggMult*=1.01;
		if (Game.Has('Duck egg') || newUpgrade == 'Duck egg') eggMult*=1.01;
		if (Game.Has('Turkey egg') || newUpgrade == 'Turkey egg') eggMult*=1.01;
		if (Game.Has('Quail egg') || newUpgrade == 'Quail egg') eggMult*=1.01;
		if (Game.Has('Robin egg') || newUpgrade == 'Robin egg') eggMult*=1.01;
		if (Game.Has('Ostrich egg') || newUpgrade == 'Ostrich egg') eggMult*=1.01;
		if (Game.Has('Cassowary egg') || newUpgrade == 'Cassowary egg') eggMult*=1.01;
		if (Game.Has('Salmon roe') || newUpgrade == 'Salmon roe') eggMult*=1.01;
		if (Game.Has('Frogspawn') || newUpgrade == 'Frogspawn') eggMult*=1.01;
		if (Game.Has('Shark egg') || newUpgrade == 'Shark egg') eggMult*=1.01;
		if (Game.Has('Turtle egg') || newUpgrade == 'Turtle egg') eggMult*=1.01;
		if (Game.Has('Ant larva') || newUpgrade == 'Ant larva') eggMult*=1.01;
		if (Game.Has('Century egg') || newUpgrade == 'Century egg')
		{
			//the boost increases a little every day, with diminishing returns up to +10% on the 100th day
			let day=Math.floor((Date.now()-Game.startDate)/1000/10)*10/60/60/24;
			day=Math.min(day,100);
			eggMult*=1+(1-Math.pow(1-day/100,3))*0.1;
		}

		mult*=eggMult;

		if (Game.Has('Sugar baking') || newUpgrade == 'Sugar baking') mult*=(1+Math.min(100,Game.lumps)*0.01);

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


		if (Game.Has('Elder Covenant') || newUpgrade == 'Elder Covenant') mult*=0.95;

		if (Game.Has('Golden switch [off]') || newUpgrade == 'Golden switch [off]')
		{
			let goldenSwitchMult=1.5;
			if (Game.Has('Residual luck') || newUpgrade == 'Residual luck')
			{
				let upgrades=Game.goldenCookieUpgrades;
				for (let i in upgrades) {if (Game.Has(upgrades[i]) || newUpgrade == upgrades[i].name) goldenSwitchMult+=0.1;}
			}
			mult*=goldenSwitchMult;
		}
		if (Game.Has('Shimmering veil [off]') || newUpgrade == 'Shimmering veil [off]')
		{
			let veilMult=0.5;
			if (Game.Has('Reinforced membrane') || newUpgrade == 'Reinforced membrane') veilMult+=0.1;
			mult*=1+veilMult;
		}
		if (Game.Has('Magic shenanigans') || newUpgrade == 'Magic shenanigans') mult*=1000;
		if (Game.Has('Occult obstruction') || newUpgrade == 'Occult obstruction') mult*=0;


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

		computedMouseCps=CookieAutoClicker.mouseCps(newUpgrade);

		return [cookiesPs, computedMouseCps];
	}
	
	CookieAutoClicker.mouseCps=function(newUpgrade) {
		
		let effs = CookieAutoClicker.calculatedEffs;
		
		var add=0;
		if (Game.Has('Thousand fingers') || newUpgrade == 'Thousand fingers') add+=		0.1;
		if (Game.Has('Million fingers') || newUpgrade == 'Million fingers') add*=		5;
		if (Game.Has('Billion fingers') || newUpgrade == 'Billion fingers') add*=		10;
		if (Game.Has('Trillion fingers') || newUpgrade == 'Trillion fingers') add*=		20;
		if (Game.Has('Quadrillion fingers') || newUpgrade == 'Quadrillion fingers') add*=	20;
		if (Game.Has('Quintillion fingers') || newUpgrade == 'Quintillion fingers') add*=	20;
		if (Game.Has('Sextillion fingers') || newUpgrade == 'Sextillion fingers') add*=	20;
		if (Game.Has('Septillion fingers') || newUpgrade == 'Septillion fingers') add*=	20;
		if (Game.Has('Octillion fingers') || newUpgrade == 'Octillion fingers') add*=	20;
		if (Game.Has('Nonillion fingers') || newUpgrade == 'Nonillion fingers') add*=	20;

		var num=0;
		for (var i in Game.Objects) {num+=Game.Objects[i].amount;}
		num-=Game.Objects['Cursor'].amount;
		add=add*num;
		if (Game.Has('Plastic mouse') || newUpgrade == 'Plastic mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Iron mouse') || newUpgrade == 'Iron mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Titanium mouse') || newUpgrade == 'Titanium mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Adamantium mouse') || newUpgrade == 'Adamantium mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Unobtainium mouse') || newUpgrade == 'Unobtainium mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Eludium mouse') || newUpgrade == 'Eludium mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Wishalloy mouse') || newUpgrade == 'Wishalloy mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Fantasteel mouse') || newUpgrade == 'Fantasteel mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Nevercrack mouse') || newUpgrade == 'Nevercrack mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Armythril mouse') || newUpgrade == 'Armythril mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Technobsidian mouse') || newUpgrade == 'Technobsidian mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Plasmarble mouse') || newUpgrade == 'Plasmarble mouse') add+=Game.cookiesPs*0.01;
		if (Game.Has('Miraculite mouse') || newUpgrade == 'Miraculite mouse') add+=Game.cookiesPs*0.01;

		if (Game.Has('Fortune #104') || newUpgrade == 'Fortune #104') add+=Game.cookiesPs*0.01;
		var mult=1;

		if (Game.Has('Santa\'s helpers') || newUpgrade == 'Santa\'s helpers') mult*=1.1;
		if (Game.Has('Cookie egg') || newUpgrade == 'Cookie egg') mult*=1.1;
		if (Game.Has('Halo gloves') || newUpgrade == 'Halo gloves') mult*=1.1;
		if (Game.Has('Dragon claw') || newUpgrade == 'Dragon claw') mult*=1.03;

		if (Game.Has('Aura gloves') || newUpgrade == 'Aura gloves')
		{
			mult*=1+0.05*Math.min(Game.Objects['Cursor'].level,(Game.Has('Luminous gloves') || newUpgrade == 'Luminous gloves')?20:10);
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

		let pow = (Game.Has('Reinforced index finger') || newUpgrade == 'Reinforced index finger')+(Game.Has('Carpal tunnel prevention cream') || newUpgrade == 'Carpal tunnel prevention cream')+(Game.Has('Ambidextrous') || newUpgrade == 'Ambidextrous');
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
