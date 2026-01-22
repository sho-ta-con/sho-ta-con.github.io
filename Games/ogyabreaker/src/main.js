import { Boot } from './scenes/Boot.js';
import { GameMain } from './scenes/GameMain.js';
import { Options } from './scenes/Options.js';
import { GameTitle } from './scenes/GameTitle.js';
import { GameResult } from './scenes/GameResult.js';
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
        GameTitle,
        GameMain,
        Options,
        GameResult
    ]
};

new Phaser.Game(config);
