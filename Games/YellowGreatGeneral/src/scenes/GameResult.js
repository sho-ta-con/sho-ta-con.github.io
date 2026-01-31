export class GameResult extends Phaser.Scene {
    constructor() { super('GameResult'); }
    init(data) { this.score = data.score; }
    create() {
        this.cameras.main.setBackgroundColor(0xaaaa00);

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('bgm_result', {
            volume: 0.3,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        this.add.text(400, 350, 'おみごと！' + (this.score || 0) + '人斬り！', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.text(400, 450, 'タイトルに戻る', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        btn.on('pointerup', () => this.scene.start('GameTitle'));
        
        // Display gameclear image if loaded
        try {
            if (this.textures && this.textures.exists && this.textures.exists('shogun_icon')) {
                const img = this.add.image(400, 150, 'shogun_icon').setOrigin(0.5).setDepth(400);
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