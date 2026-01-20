import { Boot } from './scenes/Boot.js';
import { Game } from './scenes/Game.js';
import { Options } from './scenes/Options.js';
import { GameOver } from './scenes/GameOver.js';
import { GameClear } from './scenes/GameClear.js';
import { Preloader } from './scenes/Preloader.js';

const config = {
    type: Phaser.AUTO,
    width: 768,
    height: 1024,
    parent: 'game-container',
    //backgroundColor: '#028af8',
    physics: {
        default: 'arcade'
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        Game,
        Options,
        GameClear,
        GameOver
    ]
};

new Phaser.Game(config);
