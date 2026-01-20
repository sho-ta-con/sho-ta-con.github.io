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
        //this.load.setPath('assets');
        //this.load.setPath('assets/normal');
        this.load.setPath('assets/ogya');

        this.load.image('bg', 'bg.png');
        this.load.atlas('assets', 'breakout.png', 'breakout.json');
        // Optional: load individual item PNGs so ItemManager can use single-image keys
        // Make sure these files exist under the assets/ folder
        this.load.image('ball', 'ball.png');
        this.load.image('blue1', 'blue1.png');
        this.load.image('yellow1', 'yellow1.png');
        this.load.image('green1', 'green1.png');
        this.load.image('purple1', 'purple1.png');
        this.load.image('red1', 'red1.png');
        this.load.image('silver1', 'silver1.png');
        this.load.image('paddle1', 'paddle1.png');
        // 1. まずは普通の画像(image)として読み込む
        this.load.image('gaming_raw', 'gaming_sprite.png');

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
        this.load.image('life', 'life.png');
        this.load.image('bad_life', 'bad_life.png');
        this.load.image('penetrate', 'penetrate.png');
        this.load.image('split', 'split.png');
        this.load.image('enlarge', 'enlarge.png');
        this.load.image('gameclear', 'gameclear.png');
        this.load.image('gameover', 'gameover.png');

    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
