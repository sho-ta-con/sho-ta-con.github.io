export class GameTitle extends Phaser.Scene {
    constructor() {
        super('GameTitle');
    }

    init(data) {
        this.finalScore = (data && data.score) ? data.score : 0;
    }

    create() {
        // 画面の中央に背景画像を配置
        const bg = this.add.image(414, 512, 'bg');
        //bg.setScale(1.2);  // 必要に応じてスケールを調整
        bg.setDepth(-1);  // 最背面に配置

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('gametitle', {
            volume: 0.5,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        const logo = this.add.image(384, 170, 'logo').setOrigin(0.5);
        logo.setDepth(1);

        // Start button
        const startText = this.add.text(398, 500, 'GameStart', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startText.on('pointerup', () => {
            // Start the Game scene fresh; Game.create will initialize score and bricks
            this.sound.stopAll();
            this.scene.start('GameMain');
        });

        // Restart button
        const optionText = this.add.text(400, 600, 'Option', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        optionText.on('pointerup', () => {
            try { this.scene.pause(); this.scene.launch('Options'); } catch (e) {}
        });
    }
}
