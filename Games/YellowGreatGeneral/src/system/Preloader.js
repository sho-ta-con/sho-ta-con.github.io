export class Preloader extends Phaser.Scene {
    constructor() { super('Preloader'); }

    preload() {
        this.load.setPath('assets/images');
        this.load.image('logo', 'logo.png');
        this.load.image('background', '1096425.jpg');
        this.load.image('instruction_image', 'intro.png');
        this.load.image('range_indicator', 'd5cc18a6271bf7d21._50png.png');
        this.load.image('shogun_idle', '黄衣大将軍A.png');
        this.load.image('shogun_attack', '黄衣大将軍B.png');
        this.load.image('shogun_icon', 'character_cthulhu_hastur.png');
        this.load.image('enemy', '45_202205241208262.png');
        this.load.image('princess', 'F8PJGM0akAAP1W-.png');
        
        this.load.setPath('assets/sounds');
        this.load.audio('se_slash', 'doyinsdoyins.mp3');
        this.load.audio('se_miss', 'mateyo.mp3');
        this.load.audio('se_damage', 'ogya.mp3');
        this.load.audio('se_gain', 'kawachii.mp3');
        this.load.audio('se_tragedy', 'pukkyui.mp3');
        this.load.audio('bgm_title', 'ようこそラビリンスへ.mp3');
        this.load.audio('bgm_main', 'heiannoyoi.mp3');
        this.load.audio('bgm_result', '届かない声 (2).mp3');
    }

    create() {
        // ロード画面ですべての読み込み（JSON + 各テキスト）が終わったらタイトルへ
        // すでに終わっている場合はすぐに実行されます
        if (this.load.isLoading()) {
            this.load.once('complete', () => {
                this.scene.start('GameTitle');
            });
        } else {
            this.scene.start('GameTitle');
        }
    }
}