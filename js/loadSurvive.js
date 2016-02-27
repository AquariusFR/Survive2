var loadSurvive = function () {
    'use strict';
    var maxWatchCount = 100,
        watchCount = 0,
        baseurl = './',
        scriptsLoaded = {},
        head = document.querySelector("head"),
        xhrStatus = true,
        survive = null,
        imageLoader = null,
        mapLoader = null,
        mapLoaded = false,
        entityFactory = null,
        spriteLoader = null,
        spritesLoaded = false,
        itemsLoader = null,
        itemsLoaded = false,
        items = {},
        sprites = {},
        map = {},
        imagesToLoad = {
            cursor: "img/sprite/FF7Cursor.png",
            attack: "img/sprite/attack.png",
            doorGreen0Open: "img/doors/open-door-token-green/r_0.png",
            doorGreen90Open: "img/doors/open-door-token-green/r_90.png",
            doorGreen0Closed: "img/doors/closed-door-token-green/r_0.png",
            doorGreen90Closed: "img/doors/closed-door-token-green/r_90.png"
        },
        loadToolBox = {
            loadJSON: function (url, callback, param) {
                if (xhrStatus) {
                    xhr.get(baseurl + url, callback, param);
                } else {
                    insertJSON("json.php?s=" + url + "&c=" + callback);
                }
            },
            insertJSON: function (url) {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = baseurl + "/" + url;
                head.appendChild(script);
                return script;
            },
            parseResult: function (s) {
                if (xhrStatus) {
                    return JSON.parse(s);
                } else {
                    return s;
                }
            },
            xhrStatus: xhrStatus
        };

    function ressourceLoaded(ressourceId) {
        scriptsLoaded[ressourceId] = true;
    }

    function allRessourcesAreLoaded() {
        var options = {
            width: 1000,
            height: 2100
        },
            survivediv = document.getElementById("survivediv");
        mapLoader = new mapLoaderFactory("testMap", loadToolBox, notifyMapLoaded, imagesToLoad);
        spriteLoader = new spriteLoaderFactory(loadToolBox, notifySpritesLoaded, imagesToLoad);
        itemsLoader = new itemsLoaderFactory(loadToolBox, notifyItemsLoaded, imagesToLoad);
        entityFactory = new entityFactoryConstructor();
        survive = new surviveFactory(survivediv, options);

        mapLoader.load();
        spriteLoader.load();
        itemsLoader.load();
    }

    function loaderWatcher() {
        var isAllLoaded = true,
            scriptId;
        for (scriptId in scriptsLoaded) {
            if (scriptsLoaded[scriptId] === false) {
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
    }

    function loadJavascript(url, id) {
        scriptsLoaded[id] = false;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = baseurl + "/" + url + id + ".js";
        head.appendChild(script);
        return script;
    }


    function notifyItemsLoaded() {
        itemsLoaded = true;
        notifyImageListUpdated();
    }
    function notifySpritesLoaded() {
        spritesLoaded = true;
        notifyImageListUpdated();
    }

    function notifyMapLoaded() {
        mapLoaded = true;
        notifyImageListUpdated();
    }

    function notifyImageListUpdated() {
        if (mapLoaded && spritesLoaded && itemsLoaded) {
            imageLoader = new imagesLoaderBuilder();
            imageLoader.load(imagesToLoad, notifyImagesLoaded, baseurl);
        }
    }
    var notifyImagesLoaded = function () {
        console.log("images loaded, cool !");
        initGame();
    }
    
    function initGame() {

        var sprites = spriteLoader.sprites;

        survive.loadStuff({
            map: mapLoader.map,
            sprites: sprites,
            images: imageLoader.loadedImages,
            items: itemsLoader.items
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

        survive.start();
    }

    loadJavascript('js/', "xhr");
    loadJavascript('js/preload/', "mapLoader");
    loadJavascript('js/preload/', "spriteLoader");
    loadJavascript('js/preload/', "imagesLoader");
    loadJavascript('js/preload/', "itemsLoader");
    loadJavascript('js/game/', "animation");
    loadJavascript('js/game/', "entity");
    loadJavascript('js/game/', "item");
    loadJavascript('js/game/', "mouseManager");
    loadJavascript('js/', "survive");
    loaderWatcher();
    return {
        "ressourceLoaded": ressourceLoaded,
        "loadJSON": loadToolBox.loadJSON,
        "xhrStatus": xhrStatus,
        "notifyMapLoaded": notifyMapLoaded
    };
};
// permet de declencher le chargement
var loader = new loadSurvive();