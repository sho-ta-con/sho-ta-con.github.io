export class Options extends Phaser.Scene {
    constructor() {
        super('Options');
    }

    create() {
        const cx = this.cameras.main.centerX;
        const cy = this.cameras.main.centerY - 30;

        // 1. 背景オーバーレイ
        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0.5);

        // 2. 設定パネルの土台
        this.add.rectangle(cx, cy, 540, 350, 0x2a2a2a, 0.95).setOrigin(0.5).setStrokeStyle(4, 0x555555);

        // 3. タイトル
        this.add.text(cx, cy - 140, 'オプション', { fontSize: '36px', fontWeight: 'bold', color: '#fff' , padding: { top: 10, bottom: 10 } }).setOrigin(0.5);

        // --- 音量設定（選択状態の管理付き） ---
        const createVolumeRow = (label, y, storageKey) => {
            this.add.text(cx - 200, y, label, { fontSize: '24px', color: '#ccc' , padding: { top: 10, bottom: 10 } }).setOrigin(0, 0.5);
            
            const levels = [
                { t: '消', v: 0 }, { t: '小', v: 0.2 }, { t: '中', v: 0.5 }, { t: '大', v: 1.0 }
            ];

            // 現在保存されている音量を取得（未設定なら '中' 相当の 0.5）
            const currentVol = parseFloat(localStorage.getItem(storageKey)) || 0.5;
            const buttons = [];

            levels.forEach((lv, i) => {
                const btn = this.add.text(cx + 40 + (i * 65), y, lv.t, {
                    fontSize: '20px', 
                    backgroundColor: '#444', // デフォルト背景
                    color: '#fff',
                    padding: { x: 12, y: 6 , top: 10, bottom: 10 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                buttons.push(btn);

                // 初期状態のハイライト判定
                if (Math.abs(currentVol - lv.v) < 0.1) {
                    btn.setBackgroundColor('#f39c12'); // 選択色はオレンジ
                }

                btn.on('pointerdown', () => {
                    // 全ボタンを一旦リセット
                    buttons.forEach(b => b.setBackgroundColor('#444'));
                    // 押したボタンだけ色を変える
                    btn.setBackgroundColor('#f39c12');

                    // 設定の保存と反映
                    localStorage.setItem(storageKey, lv.v);
                    if (storageKey === 'bgmVolume') {
                        this.sound.setVolume(lv.v);
                    } else {
                        // SEの確認音（ここはお好みで）
                        this.sound.play('se_ogya', { volume: lv.v });
                    }
                });
            });
        };

        createVolumeRow('BGM音量', cy - 60, 'bgmVolume');
        createVolumeRow('SE音量', cy + 20, 'seVolume');

        // 4. 戻るボタン
        const back = this.add.text(cx, cy + 120, ' 閉じる ', {
            fontSize: '24px', backgroundColor: '#333', color: '#fff', padding: { x: 40, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        back.on('pointerover', () => back.setBackgroundColor('#555'));
        back.on('pointerout', () => back.setBackgroundColor('#333'));

        back.on('pointerdown', () => {
            this.scene.stop();
            // resume先を明示的に指定するか、呼び出し元の管理が必要
            this.scene.resume('GameTitle'); 
            this.scene.resume('GameMain');
        });
    }
}