function AnimationFactory(_player, _options) {
    var player = _player,
        options = _options;

    // shim layer with setTimeout fallback
    function requestAnimFrame() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }
    function createCanvas(_options) {
        var canvas = document.createElement('canvas');
        canvas.width = _options.width;
        canvas.height = _options.height;
        canvas.style.position = "absolute";
        return canvas;
    }
    //initialisation vm
    var vm = {
        contextBackground: null,
        contextAnimation: null,
        contextHighlight: null,
        contextMenu: null,
        contextCombat: null,
        init: null,
        start: null,
        refreshAnimation: null,
        refreshAnimationInScope: null,
        getAnimation: null,
        drawSprite: null,
        eraseSprite: null,
        eraseCorpses: null,
        eraseSurvivors: null,
        eraseZombies: null,
        drawZombies: null,
        drawCorpses: null,
        drawSurvivors: null,
        drawSurvivorInfos: null
    };
    vm.start = function (params) {
        vm.refreshAnimation(this);
    };
    vm.init = function () {
        var divPlayer = document.createElement('div'),
            canvasBackground = createCanvas(options),
            canvasAnimation = createCanvas(options),
            canvasContextualMenu = createCanvas(options),
            canvasCombat = createCanvas(options),
            canvasHighlight = createCanvas(options);

        divPlayer.appendChild(canvasBackground);
        divPlayer.appendChild(canvasAnimation);
        divPlayer.appendChild(canvasHighlight);
        divPlayer.appendChild(canvasCombat);
        divPlayer.appendChild(canvasContextualMenu);

        player.appendChild(divPlayer);
        player.style.position = "relative";

        vm.contextBackground = canvasBackground.getContext('2d');
        vm.contextAnimation = canvasAnimation.getContext('2d');
        vm.contextHighlight = canvasHighlight.getContext('2d');
        vm.contextMenu = canvasContextualMenu.getContext('2d');
        vm.contextCombat = canvasCombat.getContext('2d');
        //vm.contextBackground.webkitImageSmoothingEnabled = false;
        //vm.contextBackground.mozImageSmoothingEnabled = false;
        vm.contextBackground.imageSmoothingEnabled = false; // future
        //vm.contextCombat.webkitImageSmoothingEnabled = false;
        //vm.contextCombat.mozImageSmoothingEnabled = false;
        vm.contextCombat.imageSmoothingEnabled = false; // future
    };
    // methode raffraichissant l'animation (les sprites)
    vm.refreshAnimation = function () {
        requestAnimFrame(function () {
            vm.refreshAnimation();
        });
        vm.refreshAnimationInScope();
    };
    vm.refreshAnimationInScope = function () {
        if (!this.isAllImagesLoaded) {
            console.debug('all images are still not loaded');
            return;
        }
        if (!this.isSpriteAssigned) {
            vm.isSpriteAssigned = true;
            vm.updateItems();
            vm.updatemap();
            vm.updateDoors();
            vm.updateAnimations();
            return;
        }
        if (!this.isBoardDrawed) {
            console.debug('drawingBoard !');
            vm.isBoardDrawed = true;
            vm.drawBoard();
            vm.drawStaticSprites();
            return;
        }
        vm.currentFrame = this.currentFrame + 1;

        if (this.currentFrame == 60) {
            vm.currentFrame = 0;
            vm.contextAnimation.clearRect(0, 0, options.width, options.height);
            /*
             * var rect = canvasHighlight.getBoundingClientRect();
             * 
             * console.debug('screen position ' + rect.left + ":" + rect.top); this.contextHighlight.fillRect(8 - rect.left ,8 - rect.top,150,100);
             */
        }

        vm.eraseCorpses();
        vm.eraseSurvivors();
        vm.eraseZombies();
        vm.drawCorpses();
        vm.drawZombies();
        vm.drawSurvivors();
        vm.hudManager.launch({ drawHUD: true });
        vm.menuManager.launch({ drawMenu: true });
        vm.menuManager.launch({ drawInventory: true });
        // vm.drawHUD();
        vm.drawText();
    };
    vm.getAnimation = function (_animations, state) {
        for (var i = 0; i < _animations.length; i++) {
            var currentAnimation = _animations[i];
            if (currentAnimation.state == state) {
                return currentAnimation;
            }
        }
        console.debug("state " + state + " not found");
        return -1;
    };
    vm.drawText = function () {
        // si il y a un text qui viens d'utre effacer, on
        // supprime le texte
        var textX = options.width / 2;
        var textY = 200;
        if (vm.highLightText === false && vm.previousHighLightText) {
            vm.contextMenu.clearRect(textX, textY - 35, 300, 50);
            vm.previousHighLightText = false;
            return;
        }

        if (!this.highLightText) {
            return;
        }
        // on affiche un texte
        vm.previousHighLightText = true;
        var textDelta = Date.now() - vm.highLightText.ts;
        vm.contextMenu.fillStyle = "rgba(0,0,0,1)";
        vm.contextMenu.font = "bold 32px 'Segoe UI'";
        // this.contextHighlight.textAlign = 'center';
        vm.contextMenu.fillText(vm.highLightText.text, textX, textY);

        if (this.highLightText.duration < textDelta) {
            vm.highLightText = false;
        }
    };
    vm.drawSprite = function (_sprite, _onMouseOver, _onMouseOut) {
        if (_sprite === false) {
            return;
        }
        var currentAnimation = _sprite.currentAnimation;
        var spriteInfos = this.animations[_sprite.sprite];
        var availableAnimation = spriteInfos.animations;

        if (currentAnimation == -1 || currentAnimation.state != _sprite.state) {
            currentAnimation = vm.getAnimation(availableAnimation, _sprite.state);
            _sprite.currentAnimation = currentAnimation;
            if (currentAnimation == -1) {
                console.debug("no animation found");
                return;
            }
        }

        var step = currentAnimation.step;

        var delta = Date.now() - _sprite.lastUpdateTime;
        _sprite.lastUpdateTime = Date.now();
        if (_sprite.acDelta > step) {
            _sprite.acDelta = 0;
            // on passe u l'image suivante

            if (currentAnimation.reverse) {
                // sur la derniere frame on inverse le
                // sens de l'animation
                if (_sprite.reverseAnim) {
                    _sprite.currentFrame = _sprite.currentFrame - 1;
                    if (_sprite.currentFrame <= 0) {
                        _sprite.reverseAnim = false;
                    }
                    // si derniure
                    if (_sprite.currentFrame >= currentAnimation.frames.length - 1) {
                        _sprite.reverseAnim = true;
                        _sprite.currentFrame = currentAnimation.frames.length - 2;
                    }
                } else {
                    _sprite.currentFrame = _sprite.currentFrame + 1;
                    if (_sprite.currentFrame == currentAnimation.frames.length) {
                        _sprite.reverseAnim = true;
                        _sprite.currentFrame = currentAnimation.frames.length - 2;
                    }
                }
            } else {
                _sprite.currentFrame = _sprite.currentFrame + 1;
                if (_sprite.currentFrame >= currentAnimation.frames.length - 1) {
                    if (currentAnimation.loop) {
                        _sprite.currentFrame = 0;
                    } else {
                        _sprite.currentFrame = currentAnimation.frames.length - 1;
                        if (_sprite.callback !== false) {

                            vm.eraseSprite(_sprite);
                            _sprite.callback(_sprite, this);
                            return;
                        }
                    }
                }
            }
        } else {
            _sprite.acDelta += delta;
        }

        if (_sprite.moving) {
            var speed = _sprite.speed;
            var fromX = _sprite.position[0];
            var fromY = _sprite.position[1];
            var toX = _sprite.to[0];
            var toY = _sprite.to[1];
            if (fromX < toX) {
                fromX = Math.min(toX, (fromX + speed));
            }
            if (fromY < toY) {
                fromY = Math.min(toY, (fromY + speed));
            }
            if (fromX > toX) {
                fromX = Math.max(toX, (fromX - speed));
            }
            if (fromY > toY) {
                fromY = Math.max(toY, (fromY - speed));
            }

            if (fromX == toX && fromY == toY) {
                _sprite.moving = false;
                _sprite.state = "0";
            }
            _sprite.position[0] = fromX;
            _sprite.position[1] = fromY;
        }

        // ceinture et bretelle
        if (_sprite.currentFrame >= currentAnimation.frames.length) {
            _sprite.currentFrame = currentAnimation.frames.length - 1;
        }
        _sprite.previousFrame = _sprite.currentFrame;
        _sprite.previousPosition = _sprite.position;
        var currentFrame = currentAnimation.frames[_sprite.currentFrame];

        var offsetX = currentFrame[4];
        var offsetY = currentFrame[5];
        var positionX = _sprite.position[0] + offsetX * 2;
        var positionY = _sprite.position[1] - offsetY * 2;

        vm.contextAnimation.drawImage(
            currentFrame.canvas,
            positionX,
            positionY
            );
        if (_sprite.mouseOver && _sprite.mouseState != "over") {
            _sprite.mouseState = "over";
            _onMouseOver(_sprite);
            console.debug("Mouse over " + _sprite.id);
        } else if (!_sprite.mouseOver && _sprite.mouseState == "over") {
            _onMouseOut(_sprite);
            _sprite.mouseState = false;
            console.debug("Mouse out " + _sprite.id);
        }
    };
    vm.eraseSprite = function (_sprite) {
        var frameToErase = _sprite.previousFrame;
        if (frameToErase == -1) {
            return;
        }
        var currentAnimation = _sprite.currentAnimation;
        var spriteInfos = this.animations[_sprite.sprite];
        var availableAnimation = spriteInfos.animations;
        if (currentAnimation == -1 || currentAnimation.state != _sprite.state) {
            currentAnimation = vm.getAnimation(availableAnimation, _sprite.state);
            _sprite.currentAnimation = currentAnimation;
            if (currentAnimation == -1) {
                console.debug("no animation found");
                return;
            }
        }

        if (frameToErase < 0) {
            frameIndex = 0;
        }
        if (frameToErase > currentAnimation.frames.length - 1) {
            frameToErase = currentAnimation.frames.length - 1;
        }

        var currentSprite = currentAnimation.frames[frameToErase];

        var width = currentSprite[2];
        var height = currentSprite[3];
        var offsetX = currentSprite[4];
        var offsetY = currentSprite[5];
        var positionX = _sprite.previousPosition[0] + offsetX * 2;
        var positionY = _sprite.previousPosition[1] - offsetY * 2;
        vm.contextAnimation.clearRect(
            positionX - 5, // (this.x * 32) - (this.largeur
            // / 2) + 16,//
            // Point de
            // destination
            // (depend de la
            // taille du
            // personnage)
            positionY - 5, // (this.y * 32) - this.hauteur
            // + 24, // Point
            // de
            // destination
            // (depend de la
            // taille du
            // personnage)
            10 + width * 2, // Taille du rectangle
            // destination (c'est la
            // taille
            // du
            // personnage)
            10 + height * 2
            );
    };
    vm.eraseCorpses = function () {
        var corpses = this.corpses;
        for (var zombieI = 0; zombieI < corpses.length; zombieI++) {
            var currentCorpse = corpses[zombieI];
            if (currentCorpse !== false) {
                vm.eraseSprite(currentCorpse);
            }
        }
    };
    vm.eraseSurvivors = function () {
        for (var zombieI = 0; zombieI < this.survivors.length; zombieI++) {
            var currentSurvivor = this.survivors[zombieI];
            vm.eraseSprite(currentSurvivor);
            if (currentSurvivor.moving) {
                vm.contextMenu.clearRect(
                    currentSurvivor.previousPosition[0] - 15,
                    currentSurvivor.previousPosition[1] - 17,
                    50,
                    50
                    );
            }
        }
    };
    vm.eraseZombies = function () {
        var zombies = this.zombies;
        for (var zombieI = 0; zombieI < zombies.length; zombieI++) {
            var currentZombie = zombies[zombieI];
            if (currentZombie !== false) {
                vm.eraseSprite(currentZombie);
            }
        }
    };
    vm.drawZombies = function () {
        for (var zombieI = 0; zombieI < this.zombies.length; zombieI++) {
            var currentSurvivor = this.zombies[zombieI];
            vm.drawSprite(currentSurvivor, vm.drawZombieInfos, vm.clearZombieInfos);
        }

        // clean dead survivors
        for (var i = this.zombies.length - 1; i >= 0; i--) {
            if (this.zombies[i] === false) {
                vm.zombies.splice(i, 1);
            }
        }
    };
    vm.drawCorpses = function () {
        for (var corpseI = 0; corpseI < this.corpses.length; corpseI++) {
            var currentCorpse = this.corpses[corpseI];
            vm.drawSprite(currentCorpse, vm.drawSurvivorInfos, vm.clearSurvivorInfos);
        }
    };
    vm.drawSurvivors = function () {
        for (var survivorI = 0; survivorI < this.survivors.length; survivorI++) {
            var currentSurvivor = this.survivors[survivorI];
            vm.drawSprite(currentSurvivor, vm.drawSurvivorInfos, vm.clearSurvivorInfos);
        }

        // clean dead survivors
        for (var i = this.survivors.length - 1; i >= 0; i--) {
            if (this.survivors[i] === false) {
                vm.survivors.splice(i, 1);
            }
        }
    };
    vm.drawSurvivorInfos = function (currentSurvivor) {
        if (vm.menuManager.isMenuOpen()) { return; }
        var _contextMenu = vm.contextMenu;
        var x1 = currentSurvivor.position[0] + 5;
        var y1 = currentSurvivor.position[1] + 48 * 2;
        var _menuWidth = 200;
        var _menuHeight = 30;

        var actions = currentSurvivor.actions;
        var stamina = currentSurvivor.stamina;
        _contextMenu.save();
        var my_gradient = _contextMenu.createLinearGradient(x1, y1, x1 + _menuWidth, y1 + _menuHeight);
        my_gradient.addColorStop(0, "#005aab");
        my_gradient.addColorStop(1, "#010024");
        _contextMenu.fillStyle = my_gradient;

        _contextMenu.fillRect(x1, y1, _menuWidth, _menuHeight);
        _contextMenu.strokeStyle = "#dcd8cf";
        _contextMenu.lineWidth = 2;
        _contextMenu.strokeRect(x1, y1, _menuWidth, _menuHeight);

        _contextMenu.fillStyle = "#eaece9";
        _contextMenu.font = "bold 12px Arial";

        if (stamina < 1) {
            _contextMenu.fillText("DEAD", x1 + 5, y1 + 20);
        }
        else {
            _contextMenu.fillText("HP : " + stamina + "/" + currentSurvivor.staminaMax, x1 + 5, y1 + 20);
            _contextMenu.fillText("AP : " + actions + "/" + currentSurvivor.actionsMax, x1 + 50, y1 + 20);
        }
        _contextMenu.restore();
    };

    return {
        init: vm.init
    };
}
loader.ressourceLoaded("animation");