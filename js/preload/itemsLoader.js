var itemsLoaderFactory = function(_loader, _notify, _imagesToLoad) {

	var loader = _loader;
	var notify = _notify;
	var imagesToLoad = _imagesToLoad;
	var items = {};

	var sprites = ["ZombieBrain", "FatZombie", "marco"];

	var loadItems = function() {
		loader.loadJSON("img/sprite/items.json", loadItemsInfosCallback);
	}
	var loadItemsInfosCallback = function(result) {

		items = loader.parseResult(result.response);;

		imagesToLoad["items"] = "img/"+items.url;

		notify();
	};

	return {
		load : loadItems,
		items : items
	}
}
loader.ressourceLoaded("itemsLoader");