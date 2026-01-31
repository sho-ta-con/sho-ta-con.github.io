export default class GameSelect extends Phaser.Scene {
    constructor() { super('GameSelect'); }

    create() {
        this.inputEnabled = false; // 初期状態は入力を無効化
        this.time.delayedCall(300, () => {
            this.inputEnabled = true; // 0.3秒後に有効化
        });
        // --- 1. 固定ヘッダー (スクロールの影響を受けない) ---
        this.add.text(400, 50, 'STAGE SELECT', { 
            fontSize: '40px', fontWeight: 'bold', padding: { top: 20, bottom: 20 } 
        }).setOrigin(0.5).setDepth(100);

        this.add.text(20, 20, "◀ タイトルへ", { 
            fontSize: '20px', backgroundColor: '#333', padding: { x: 10, y: 10 } 
        }).setInteractive({ useHandCursor: true }).setDepth(100)
          .on('pointerup', () => this.scene.start('GameTitle'));

        // --- 2. スクロールエリアの設定 ---
        const view = { x: 200, y: 120, w: 400, h: 430 };
        this.listContainer = this.add.container(400, view.y).setDepth(10);

        // マスク作成 (エリア外にはみ出したボタンを隠す)
        const maskShape = this.make.graphics();
        maskShape.fillRect(view.x, view.y, view.w, view.h);
        this.listContainer.setMask(maskShape.createGeometryMask());

        // --- 3. ステージボタンの動的生成 ---
        const listData = this.cache.json.get('levelList');
        const levelKeys = listData ? listData.levels : [];

        const itemH = 90;
        levelKeys.forEach((key, i) => {
            const yPos = i * itemH + 45;
            
            // ボタン背景
            const btnBg = this.add.rectangle(0, yPos, 360, 70, 0x444444)
                .setInteractive({ useHandCursor: true });
            
            // ステージ名 (level1 -> Stage 1)
            const stageNum = key.replace('level', '');
            const btnTxt = this.add.text(0, yPos, `Stage ${stageNum}`, { 
                fontSize: '28px', padding: { top: 10, bottom: 10 } 
            }).setOrigin(0.5);

            this.listContainer.add([btnBg, btnTxt]);

            // --- クリック判定の最適化 (ドラッグ中は反応させない) ---
            btnBg.on('pointerdown', (p) => { 
                this.startY = p.y; 
                this.isScrolling = false;
            });

            btnBg.on('pointermove', (p) => {
                if (Math.abs(p.y - this.startY) > 10) this.isScrolling = true;
            });

            btnBg.on('pointerup', (p) => {
                if (!this.isScrolling) this.startGame(key);
            });
        });

        // --- 4. スクロールバーの実装 ---
        const contentH = levelKeys.length * itemH;
        if (contentH > view.h) {
            const barX = 620;
            const minY = view.y - (contentH - view.h);
            const maxY = view.y;

            // バーの背景
            this.add.rectangle(barX, view.y + view.h / 2, 10, view.h, 0x222222).setDepth(50);
            
            // つまみ (Knob)
            const knobH = Math.max(40, (view.h / contentH) * view.h);
            const knob = this.add.rectangle(barX, view.y + knobH / 2, 16, knobH, 0x888888)
                .setInteractive({ draggable: true, useHandCursor: true }).setDepth(51);

            // スクロール同期関数
            const updateScroll = (targetY) => {
                this.listContainer.y = Phaser.Math.Clamp(targetY, minY, maxY);
                const ratio = (this.listContainer.y - maxY) / (minY - maxY);
                knob.y = (view.y + knobH / 2) + ratio * (view.h - knobH);
            };

            // つまみをドラッグしてスクロール
            knob.on('drag', (p, dragX, dragY) => {
                const kMin = view.y + knobH / 2;
                const kMax = view.y + view.h - knobH / 2;
                knob.y = Phaser.Math.Clamp(dragY, kMin, kMax);
                const ratio = (knob.y - kMin) / (kMax - kMin);
                this.listContainer.y = maxY + ratio * (minY - maxY);
            });

            // マウスホイールでのスクロール
            const scrollZone = this.add.rectangle(400, 335, 800, 600, 0, 0)
                .setInteractive().setDepth(5); 
            scrollZone.on('wheel', (p, dx, dy) => updateScroll(this.listContainer.y - dy));

            // リスト自体のドラッグスクロール
            this.input.on('pointermove', (p) => {
                if (p.isDown && !knob.input.dragState) {
                    updateScroll(this.listContainer.y + p.velocity.y);
                }
            });
        }
    }

    startGame(key) {
        const rawData = this.cache.text.get(key);
        if (!rawData) return;

        const lines = rawData.split(/\r?\n/).filter(line => line.trim() !== "");
        const board = [];
        const config = {};

        lines.forEach(line => {
            if (line.startsWith('#')) {
                const p = line.split(':');
                config[p[0]] = { word: p[1], hint: p[2] };
            } else {
                board.push(line);
            }
        });

        this.scene.start('GameMain', { board, config, levelKey: key });
    }
}