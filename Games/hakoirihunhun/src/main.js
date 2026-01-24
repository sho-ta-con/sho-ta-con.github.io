import { Boot } from './systems/Boot.js';
import { Preloader } from './systems/Preloader.js';
import { GameMain } from './scenes/GameMain.js';
import { Options } from './scenes/Options.js';
import { GameTitle } from './scenes/GameTitle.js';
import { GameResult } from './scenes/GameResult.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,           // 枠内に収まるように拡大縮小
        autoCenter: Phaser.Scale.CENTER_BOTH, // 上下左右中央に配置
        width: 768,
        height: 1024
    },
    backgroundColor: '#1a1a1a',
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