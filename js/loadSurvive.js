var loadSurvive = function() {
	'use strict';
	var maxWatchCount = 100;
	var watchCount = 0;
	var baseurl = './';
	var scriptsLoaded = {};
	var head = document.querySelector("head");
	var xhrStatus = true;
	var survive = null;
	var imageLoader = null;
	var mapLoader = null;
	var mapLoaded = false;
	var entityFactory = null;
	var spriteLoader = null;
	var spritesLoaded = false;
	var itemsLoader = null;
	var itemsLoaded = false
	var items = {};
	var sprites = {};
	var map = {};
	var imagesToLoad = {
		cursor : "img/sprite/FF7Cursor.png",
		attack : "img/sprite/attack.png",
		doorGreen0Open : "img/doors/open-door-token-green/r_0.png",
		doorGreen90Open : "img/doors/open-door-token-green/r_90.png",
		doorGreen0Closed : "img/doors/closed-door-token-green/r_0.png",
		doorGreen90Closed : "img/doors/closed-door-token-green/r_90.png"
	}

	var ressourceLoaded = function(ressourceId) {
		scriptsLoaded[ressourceId] = true;
	}

	var loaderWatcher = function() {
		var isAllLoaded = true;
		for ( var scriptId in scriptsLoaded) {
			if (scriptsLoaded[scriptId] == false) {
				isAllLoaded = false;
				break;
			}
		}

		if (isAllLoaded) {
			allRessourcesAreLoaded();
		} else {
			watchCount = watchCount + 1;
			if (watchCount > maxWatchCount) {
				// erreur !
				console.error("script pas charge a temps");
			} else {
				setTimeout(loaderWatcher, 100);
			}
		}
	};
	var loadJavascript = function(url, id) {
		scriptsLoaded[id] = false;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = baseurl + "/" + url + id + ".js";
		head.appendChild(script);
		return script;
	};

	var allRessourcesAreLoaded = function() {
		var options = {
			width : 1000,
			height : 2100
		};
		var survivediv = document.getElementById("survivediv");
		mapLoader = new mapLoaderFactory("testMap", loadToolBox, notifyMapLoaded, imagesToLoad);
		spriteLoader = new spriteLoaderFactory(loadToolBox, notifySpritesLoaded, imagesToLoad);
		itemsLoader = new itemsLoaderFactory(loadToolBox, notifyItemsLoaded, imagesToLoad);
		entityFactory = new entityFactoryConstructor();
		survive = new surviveFactory(survivediv, options);

		mapLoader.load();
		spriteLoader.load();
		itemsLoader.load();
	}

	var notifyItemsLoaded = function() {
		itemsLoaded = true;
		notifyImageListUpdated();
	}

	var notifySpritesLoaded = function() {
		spritesLoaded = true;
		notifyImageListUpdated();
	}

	var notifyMapLoaded = function() {
		mapLoaded = true;
		notifyImageListUpdated();
	}
	var notifyImageListUpdated = function() {
		if (mapLoaded && spritesLoaded && itemsLoaded) {
			imageLoader = new imagesLoaderBuilder();
			imageLoader.load(imagesToLoad, notifyImagesLoaded, baseurl);
		}
	}
	var notifyImagesLoaded = function() {
		console.log("images loaded, cool !");
		initGame();
	}
	var initGame = function() {

		var sprites = spriteLoader.sprites;
		survive.loadStuff({
			map : mapLoader.map,
			sprites : sprites,
			images : imageLoader.loadedImages,
			items : itemsLoader.items
		});

		entityFactory.loadAnimations(sprites);
		var survivorA = entityFactory.createSurvivor("MACHETE !", "marco", 0);
		var zombie1 = entityFactory.createWalker("Rob Zombie", 0);
		var zombie2 = entityFactory.createWalker("Zombie U", 1);
		var zombie3 = entityFactory.createWalker("Zombie U 2", 2);
		var zombie4 = entityFactory.createWalker("Zombie U 3", 3);
		var zombie5 = entityFactory.createWalker("Zombie U 4", 4);
		var zombie6 = entityFactory.createWalker("Zombie pathfind", 5);
		var fattie = entityFactory.createFattie("Big Mutha fucka !", 6);
		survivorA.addToInventory(theItemFactory.createBFG(), 0);
		survivorA.addToInventory(theItemFactory.create9mm(), 4);
		survivorA.addToInventory(theItemFactory.createKnife(), 2);
	}
	var loadToolBox = {
		loadJSON : function(url, callback, param) {
			if (xhrStatus) {
				xhr.get(baseurl + url, callback, param);
			} else {
				insertJSON("json.php?s=" + url + "&c=" + callback);
			}
		},
		insertJSON : function(url) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = baseurl + "/" + url;
			head.appendChild(script);
			return script;
		},
		parseResult : function(s) {
			if (xhrStatus) {
				return JSON.parse(s);
			} else {
				return s;
			}
		},
		xhrStatus : xhrStatus
	}

	loadJavascript('js/', "xhr");
	loadJavascript('js/preload/', "mapLoader");
	loadJavascript('js/preload/', "spriteLoader");
	loadJavascript('js/preload/', "imagesLoader");
	loadJavascript('js/preload/', "itemsLoader");
	loadJavascript('js/game/', "entity");
	loadJavascript('js/game/', "item");
	loadJavascript('js/', "survive");
	// loadJavascript('js/preload/', "imagesLoader");
	loaderWatcher();
	return {
		"ressourceLoaded" : ressourceLoaded,
		"loadJSON" : loadToolBox.loadJSON,
		"xhrStatus" : xhrStatus,
		"notifyMapLoaded" : notifyMapLoaded
	}
};
// permet de declencher le chargement
var loader = new loadSurvive();