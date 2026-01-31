import {Preloader} from './system/Preloader.js';
import {GameTitle} from './scenes/GameTitle.js';
import { Options } from './system/Options.js';
import {GameMain} from './scenes/GameMain.js';
import {GameResult} from './scenes/GameResult.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false // 本番はfalse、当たり判定を見たい時はtrueに
        }
    },
    scene: [Preloader, GameTitle, Options, GameMain, GameResult],
    input: {
        activePointers: 3,
        touch: { capture: true }
    }
};

new Phaser.Game(config);