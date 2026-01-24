export class GameResult extends Phaser.Scene {
    constructor() {
        super('GameResult');
    }

    init(data) {
        this.finalMove = (data && data.move) ? data.move : 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x2a2a2a);

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('gameclear', {
            volume: 0.3,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        this.add.text(384, 490, 'Game Clear', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(384, 570, 'Move: ' + (this.finalMove || 0), {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Restart button (same behavior as GameOver)
        const restartText = this.add.text(384, 800, 'Restart', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartText.on('pointerup', () => {
            this.sound.stopAll();
            this.scene.start('GameTitle');
        });

        // Display gameclear image if loaded
        try {
            if (this.textures && this.textures.exists && this.textures.exists('img_gameclear')) {
                const img = this.add.image(384, 215, 'img_gameclear').setOrigin(0.5).setDepth(400);
                try {
                    const w = img.width || (img.frame && img.frame.width) || img.displayWidth;
                    const h = img.height || (img.frame && img.frame.height) || img.displayHeight;
                    if (w && h) {
                        const scale = 320 / Math.max(w, h);
                        img.setDisplaySize(Math.round(w * scale), Math.round(h * scale));
                    } else {
                        img.setDisplaySize(320, 320);
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }
}
