var mapLoaderFactory = function(mapName, _loader, _notify, _imagesToLoad) {
	var notify = _notify;
	var loader = _loader;
	var imagesToLoad = _imagesToLoad;
	var map = {
		lines : []
	};
	var loadedTiles = 0;

	var loadMap = function() {
		loader.loadJSON("maps/" + mapName + ".json", loadMapCallBack);
	}
	var loadMapCallBack = function(result) {
		map = loader.parseResult(result.response);

		var lines = map.lines;
		for (var iLine = 0; iLine < lines.length; iLine++) {
			var line = lines[iLine];
			for (var iColumn = 0; iColumn < line.length; iColumn++) {
				var tile = line[iColumn];
				var pos = {
					line : iLine,
					column : iColumn
				};
				var json = "maps/tiles/" + tile + ".json";

				if (loader.xhrStatus) {
					loader.loadJSON(json, loadTileCallBack, pos);
				} else {
					loader.insertJSON("json.php?s=" + json + "&c=loadTileCallBack&v=" + JSON.stringify(pos));
				}
			};
		};
	};

	var loadTileCallBack = function(result, d) {
		console.log(d);

		var tile = loader.parseResult(result.response);
		if (!loader.xhrStatus) {
			d = JSON.parse(d);
		}
		map.lines[d.line][d.column] = tile;
		imagesToLoad[tile.tile] = "maps/tiles/"+tile.url+".png";
		loadedTiles++;
		if (map.length < loadedTiles) {
			allTilesLoaded();
		}
	};
	var allTilesLoaded = function() {
		notify();
	}
	return {
		load : loadMap,
		map : map,
		getCollectedTilesImages : function() {
			return imagesToLoad
		},

	}
};

loader.ressourceLoaded("mapLoader");