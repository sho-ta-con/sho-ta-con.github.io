export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        /*
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
        */
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // 画像の読み込み
        this.load.image('logo', 'images/logo.png');
        this.load.image('img_hunhun', 'images/65_20230128003638.png');
        this.load.image('img_doins', 'images/character_cthulhu_hastur.png');
        this.load.image('img_matoi', 'images/45_202205241208262.png');
        this.load.image('img_ogya', 'images/d5cc18a6271bf7d21._50png.png');
        this.load.image('img_gameclear', 'images/65_20230128003626.png');

        // 効果音の読み込み
        this.load.audio('se_hunhun', 'sounds/hunhun.mp3');
        this.load.audio('se_doins', 'sounds/doyinsdoyins.mp3');
        this.load.audio('se_matoi', 'sounds/mateyo.mp3');
        this.load.audio('se_ogya', 'sounds/ogya.mp3');

        // BGM読み込み
        this.load.audio('gametitle', 'sounds/gametitle.mp3');
        //this.load.audio('gamemain', 'sounds/chess.mp3');
        this.load.audio('gamemain', 'sounds/gameover.mp3');
        this.load.audio('gameclear', 'sounds/gameclear.mp3');
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('GameTitle');
    }
}
