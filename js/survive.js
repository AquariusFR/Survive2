var surviveFactory = function (_player, _options, _debug) {
    'use strict';
    var player = _player,
        debug = _debug,
        options = _options,
        vm = {};

    vm = {
        images: {},
        map: {},
        sprites: {},
        animation: {},
		hudManager : {},
        init: function () {
			vm.hudManager = hudManagerConstructor(this.contextHighlight, this.collision, options);
            vm.animation = new AnimationFactory(player, options, debug);
            vm.animation.init();
        },
        start: function () {
            vm.animation.start();
            _.hudManager.launch({setZombies:this.zombies});
            _.hudManager.launch({setSurvivors:this.survivors});
            _.menuManager.launch({setCursor:this.images["cursor"]});
        },
        loadStuff: function (stuff) {
            vm.images = stuff.images;
            vm.map = stuff.map;
            vm.sprites = stuff.sprites;
            vm.items == stuff.items;
        },
        loadDependencies: function (dependencies) {

        }
    };

    return {
        init: vm.init,
        start: vm.start,
        loadStuff: vm.loadStuff,
        loadDependencies: vm.loadDependencies
    };
}
loader.ressourceLoaded("survive");