export class GameClear extends Phaser.Scene {
    constructor() {
        super('GameClear');
    }

    init(data) {
        this.finalScore = (data && data.score) ? data.score : 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00aa00);

        //this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(384, 340, 'Game Clear', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(384, 420, 'Score: ' + (this.finalScore || 0), {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Restart button (same behavior as GameOver)
        const restartText = this.add.text(384, 500, 'Restart', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartText.on('pointerup', () => {
            this.scene.start('Game');
        });

        // Display gameclear image if loaded
        try {
            if (this.textures && this.textures.exists && this.textures.exists('gameclear')) {
                const img = this.add.image(384, 165, 'gameclear').setOrigin(0.5).setDepth(400);
                try {
                    const w = img.width || (img.frame && img.frame.width) || img.displayWidth;
                    const h = img.height || (img.frame && img.frame.height) || img.displayHeight;
                    if (w && h) {
                        const scale = 240 / Math.max(w, h);
                        img.setDisplaySize(Math.round(w * scale), Math.round(h * scale));
                    } else {
                        img.setDisplaySize(240, 240);
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }
}
