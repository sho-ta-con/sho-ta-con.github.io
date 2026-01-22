export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // 背景・ロゴ画像読み込み
        this.load.image('bg', 'images/bg.png');
        this.load.image('logo', 'images/logo.png');
        this.load.image('gameclear', 'images/gameclear.png');
        this.load.image('gameover', 'images/gameover.png');

        // ゲームオブジェクト読み込み
        this.load.atlas('assets', 'images/breakout.png', 'images/breakout.json');
        this.load.image('ball', 'images/ball.png');
        this.load.image('blue1', 'images/blue1.png');
        this.load.image('yellow1', 'images/yellow1.png');
        this.load.image('green1', 'images/green1.png');
        this.load.image('purple1', 'images/purple1.png');
        this.load.image('red1', 'images/red1.png');
        this.load.image('silver1', 'images/silver1.png');
        this.load.image('paddle1', 'images/paddle1.png');
        // 1. まずは普通の画像(image)として読み込む
        this.load.image('gaming_raw', 'images/gaming_sprite.png');
        // 2. 読み込みが完了した瞬間にサイズを計算してスプライトシートとして登録する
        this.load.once('filecomplete-image-gaming_raw', (key, type, data) => {
            // 読み込んだ画像の実際のサイズを取得
            const width = data.width;
            const height = data.height;

            // 個数で割って1コマのサイズを出す
            const cols = 5; // 横に何個か
            const rows = 6; // 縦に何個か

            // スプライトシートとしてテクスチャマネージャーに追加
            this.textures.addSpriteSheet('gaming', data, {
                frameWidth: width / cols,
                frameHeight: height / rows
            });
        });
        
        // アイテム画像読み込み
        this.load.image('life', 'images/life.png');
        this.load.image('bad_life', 'images/bad_life.png');
        this.load.image('penetrate', 'images/penetrate.png');
        this.load.image('split', 'images/split.png');
        this.load.image('enlarge', 'images/enlarge.png');
        
        // BGM読み込み
        this.load.audio('gametitle', 'sounds/gametitle.mp3');
        this.load.audio('gamemain', 'sounds/gamemain.wav');
        this.load.audio('gameover', 'sounds/gameover.mp3');
        this.load.audio('gameclear', 'sounds/gameclear.mp3');

        // 効果音読み込み
        this.load.audio('se_break', 'sounds/se_break.mp3');
        this.load.audio('se_paddle', 'sounds/se_paddle.mp3');
        this.load.audio('se_item', 'sounds/se_item.mp3');

    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('GameTitle');
    }
}
