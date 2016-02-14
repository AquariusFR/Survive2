var spriteLoaderFactory = function(_loader, _notify, _imagesToLoad) {

	var loader = _loader;
	var notify = _notify;
	var imagesToLoad = _imagesToLoad;
	var spriteToLoad = -1;
	var loadedSprite = 0;
	var animations = {};

	var sprites = ["ZombieBrain", "FatZombie", "marco"];

	var loadSprite = function() {
		spriteToLoad = sprites.length;
		for (var int = 0; int < spriteToLoad; int++) {
			loader.loadJSON("img/sprite/" + sprites[int] + ".json", loadAnimationsInfosCallback);
		}
	}
	var loadAnimationsInfosCallback = function(result) {
		var animation = loader.parseResult(result.response);
		animations[animation.id] = animation;
		imagesToLoad[animation.id] = "img/"+animation.url;
		loadedSprite++;
		if (loadedSprite >= spriteToLoad) {
			notify();
		}
	};

	return {
		load : loadSprite,
		sprites : animations
	}
}
loader.ressourceLoaded("spriteLoader");