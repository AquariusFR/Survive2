var surviveFactory = function(_player, _options, _debug) {
	'use strict';
	var player = _player;
	var debug = _debug;
	var options = _options;

	var _ = {};
	_ = {
		images : {},
		map : {},
		sprites : {},
		start : function() {

		},
		loadStuff : function(stuff) {
			_.images=stuff.images;
			_.map=stuff.map;
			_.sprites=stuff.sprites;
			_.items==stuff.items;
		},
		loadDependencies : function(dependencies) {

		}
	};
	return {
		start : _.start,
		loadStuff : _.loadStuff,
		loadDependencies : _.loadDependencies
	}
}
loader.ressourceLoaded("survive");