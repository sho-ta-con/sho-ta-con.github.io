import { createTextButton } from '../system/UIHelper.js';

export class GameTitle extends Phaser.Scene {
    constructor() {
        super('GameTitle');
    }

    init(data) {
        // 保存されているBGM音量を読み込んで、即座にPhaserの音量に反映させる
        const savedBgmVol = localStorage.getItem('bgmVolume');

        if (savedBgmVol !== null) {
            this.sound.setVolume(parseFloat(savedBgmVol));
        } else {
            // 初回起動などで保存されていなければデフォルト(0.5)を適用
            this.sound.setVolume(0.5);
            localStorage.setItem('bgmVolume', 0.5);
        }

        if (localStorage.getItem('seVolume') === null) {
            localStorage.setItem('seVolume', 1.0);
        }
    }

    create() {
        const { width, height } = this.scale;
        // 画面の中央に背景画像を配置
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);
        bg.setDepth(-1);  // 最背面に配置

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('bgm_title', {
            volume: 0.5,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        const logo = this.add.image(width / 2, 170, 'logo').setOrigin(0.5);
        logo.setDepth(1);

        // Start button
        createTextButton(this, width / 2, 350, 'GameStart', () => {
            this.sound.stopAll();
            this.scene.start('GameMain');
        }, { style: { fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff', stroke: '#000000', strokeThickness: 8 } });

        // Options button
        createTextButton(this, width / 2, 450, 'Option', () => {
            try { this.scene.pause(); this.scene.launch('Options'); } catch (e) {}
        }, { style: { fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff', stroke: '#000000', strokeThickness: 6 } });
    }
}
