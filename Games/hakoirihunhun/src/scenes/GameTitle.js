export class GameTitle extends Phaser.Scene {
    constructor() {
        super('GameTitle');
    }

    init(data) {
        // 保存されているBGM音量を読み込んで、即座にPhaserの音量に反映させる
        const savedBgmVol = localStorage.getItem('bgmVolume');
        const savedSeVol = localStorage.getItem('seVolume');

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
        // 画面の中央にフレームを配置
        // --- スケール調整 ---
        const TILE_SIZE = 160; // 768px幅に対して余裕を持たせたサイズ
        const BOARD_W = 4 * TILE_SIZE;
        const BOARD_H = 5 * TILE_SIZE;
        // --- 外枠と背景 ---
        const { width, height } = this.sys.game.config;
        
        const offsetX = (width - BOARD_W) / 2;
        const offsetY = (height - BOARD_H) / 2;
        const padding = 15;
        const wallThickness = 25;
        let frameGraphics = this.add.graphics();
        frameGraphics.setPosition(offsetX, offsetY);

        frameGraphics.fillStyle(0x2a2a2a, 1);
        frameGraphics.fillRect(-padding, -padding, BOARD_W + padding * 2, BOARD_H + padding * 2);

        frameGraphics.lineStyle(wallThickness, 0x5D4037, 1);
        frameGraphics.beginPath();
        frameGraphics.moveTo(TILE_SIZE * 1, BOARD_H + padding); 
        frameGraphics.lineTo(-padding, BOARD_H + padding);      
        frameGraphics.lineTo(-padding, -padding);              
        frameGraphics.lineTo(BOARD_W + padding, -padding);      
        frameGraphics.lineTo(BOARD_W + padding, BOARD_H + padding); 
        frameGraphics.lineTo(TILE_SIZE * 3, BOARD_H + padding); 
        frameGraphics.strokePath();
        //bg.setScale(1.2);  // 必要に応じてスケールを調整

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('gametitle', {
            volume: 0.5,
            loop: true
        });

        // 3. 再生
        this.bgm.play();


        // createの中
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY;

        const logo = this.add.image(cx, 270, 'logo').setOrigin(0.5);
        const targetWidth = this.cameras.main.width * 0.8;
        const scale = targetWidth / logo.width;
        logo.setScale(scale);
        logo.setDepth(1);

        // Start button
        const startText = this.add.text(cx, 550, 'GameStart', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on('pointerup', () => {
            // Start the Game scene fresh; Game.create will initialize score and bricks
            this.sound.stopAll();
            this.scene.start('GameMain');
        });

        // Restart button
        const optionText = this.add.text(cx, 650, 'Option', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        optionText.on('pointerup', () => {
            try { this.scene.pause(); this.scene.launch('Options'); } catch (e) {}
        });
    }
}
