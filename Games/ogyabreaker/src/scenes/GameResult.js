export class GameResult extends Phaser.Scene {
    constructor() {
        super('GameResult');
    }

    init(data) {
        this.finalScore = (data && data.score) ? data.score : 0;
        this.isClear = (data && data.clear) ? true : false;

        if (this.isClear) {
            this.backgroundColor = 0x00aa00;
            this.resultText = 'Game Clear';
            this.resultIcon = 'gameclear';
            this.bgmtitle = 'gameclear';
        } else {
            this.backgroundColor = 0xff0000;
            this.resultText = 'Game Over';
            this.resultIcon = 'gameover';
            this.bgmtitle = 'gameover';
        }
    }

    create() {
        this.cameras.main.setBackgroundColor(this.backgroundColor);

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add(this.bgmtitle, {
            volume: 0.3,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        //this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(384, 490, this.resultText, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(384, 570, 'Score: ' + (this.finalScore || 0), {
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
            if (this.textures && this.textures.exists && this.textures.exists('gameclear')) {
                const img = this.add.image(384, 215, this.resultIcon).setOrigin(0.5).setDepth(400);
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
