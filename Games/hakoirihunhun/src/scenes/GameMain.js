export class GameMain extends Phaser.Scene {
    constructor() {
        super('GameMain');
        // 定数・設定
        this.TILE_SIZE = 160;
        this.BOARD_W = 4 * this.TILE_SIZE;
        this.BOARD_H = 5 * this.TILE_SIZE;
    }

    create() {
        // 1. 初期化
        this.moveCount = 0;
        this.input.addPointer(1);
        this.setupAudio();
        this.setupBoard();
        
        // 2. UI・背景レイアウト
        const { width, height } = this.sys.game.config;
        const offsetX = (width - this.BOARD_W) / 2;
        const offsetY = (height - this.BOARD_H) / 2;
        this.drawFrame(offsetX, offsetY);
        
        // ヘッダー部分作成
        this.createOptionButton();
        const moveText = this.add.text(width / 2, 50, `MOVES: 0`, {
            fontSize: '40px', fontWeight: 'bold', fill: '#ffffff',
            stroke: '#000', strokeThickness: 6, padding: { top: 10, bottom: 10 }
        }).setOrigin(0.5);
        this.createResetButton(width);

        // 3. 駒の配置データ
        const INITIAL_LAYOUT = [
            { type: 'hunhun', x: 1, y: 0 },
            { type: 'doins',  x: 0, y: 0 }, { type: 'doins',  x: 3, y: 0 },
            { type: 'doins',  x: 0, y: 2 }, { type: 'doins',  x: 3, y: 2 },
            { type: 'matoi',  x: 1, y: 2 },
            { type: 'ogya',   x: 1, y: 3 }, { type: 'ogya',   x: 2, y: 3 },
            { type: 'ogya',   x: 0, y: 4 }, { type: 'ogya',   x: 3, y: 4 }
        ];

        // 4. ブロック生成
        INITIAL_LAYOUT.forEach(p => this.createPiece(p, offsetX, offsetY, moveText));
    }

    setupAudio() {
        // 既存のBGMがあるか、かつ再生中かを確認
        // this.sound.get('gamemain') でインスタンスが存在するかチェックできます
        let currentBgm = this.sound.get('gamemain');

        if (currentBgm && currentBgm.isPlaying) {
            // すでに鳴っているなら、新しく追加したり再生したりせずそのままにする
            return;
        }

        // 初回起動時や、止まっている時だけ新しく再生する
        this.sound.stopAll(); // 念のため他のSEなどを止める
        const bgmVol = parseFloat(localStorage.getItem('bgmVolume')) ?? 0.5;
        this.sound.setVolume(bgmVol);

        this.bgm = this.sound.add('gamemain', { 
            volume: 1.0, 
            loop: true 
        });
        this.bgm.play();
    }

    setupBoard() {
        // 0: 空き, 1: 埋まり
        this.board = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 0, 0, 1]
        ];

        this.PIECE_TYPES = {
            'hunhun': { w: 2, h: 2, color: 0xef5350, icon: 'img_hunhun', sound: 'se_hunhun' },
            'doins':  { w: 1, h: 2, color: 0xffeb3b, icon: 'img_doins',  sound: 'se_doins' },
            'matoi':  { w: 2, h: 1, color: 0x1B5E20, icon: 'img_matoi',  sound: 'se_matoi' },
            'ogya':   { w: 1, h: 1, color: 0xeeeeee, icon: 'img_ogya',   sound: 'se_ogya' }
        };
    }

    drawFrame(ox, oy) {
        const padding = 15;
        let frame = this.add.graphics().setPosition(ox, oy);
        frame.fillStyle(0x2a2a2a, 1);
        frame.fillRect(-padding, -padding, this.BOARD_W + padding * 2, this.BOARD_H + padding * 2);

        frame.lineStyle(25, 0x5D4037, 1);
        frame.beginPath();
        frame.moveTo(this.TILE_SIZE, this.BOARD_H + padding); 
        frame.lineTo(-padding, this.BOARD_H + padding);      
        frame.lineTo(-padding, -padding);               
        frame.lineTo(this.BOARD_W + padding, -padding);      
        frame.lineTo(this.BOARD_W + padding, this.BOARD_H + padding); 
        frame.lineTo(this.TILE_SIZE * 3, this.BOARD_H + padding); 
        frame.strokePath();
        frame.setDepth(10); // 駒が下を潜れるように
    }

    createOptionButton() {
        // OPTIONボタン
        const optBtn = this.add.text(130, 45, ' OPTION ', {
            fontSize: '32px',
            backgroundColor: '#444444',
            color: '#ffffff',
            padding: { x: 15, y: 10, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(100);

        optBtn.on('pointerdown', () => {
            this.scene.pause(); // メイン画面を一時停止
            this.scene.launch('Options'); // オプションを重ねて表示
        });
    }

    createResetButton(width) {
        // RESETボタンの作成
        const resetBtn = this.add.text(width - 120, 45, ' RESET ', {
            fontSize: '32px',
            backgroundColor: '#d32f2f', // 赤色
            color: '#ffffff',
            padding: { x: 15, y: 10, top: 10, bottom: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(100); // 駒より前に出す

        resetBtn.on('pointerover', () => resetBtn.setBackgroundColor('#ff5252'));
        resetBtn.on('pointerout', () => resetBtn.setBackgroundColor('#d32f2f'));

        resetBtn.on('pointerdown', () => {
            // 1. シーンを再起動（これが一番確実で簡単です）
            //this.sound.stopAll(); // BGMが重ならないように停止
            this.scene.restart();
        });
    }

    createPiece(p, offsetX, offsetY, moveText) {
        const config = this.PIECE_TYPES[p.type];
        const block = this.add.container(offsetX + p.x * this.TILE_SIZE, offsetY + p.y * this.TILE_SIZE);
        block.setDepth(20);

        const shadow = this.add.rectangle(12, 12, config.w * this.TILE_SIZE - 15, config.h * this.TILE_SIZE - 15, 0x0, 0.4).setOrigin(0);
        const rect = this.add.rectangle(7, 7, config.w * this.TILE_SIZE - 14, config.h * this.TILE_SIZE - 14, config.color).setOrigin(0);
        rect.setStrokeStyle(4, 0x0, 0.1);

        const icon = this.add.image((config.w * this.TILE_SIZE) / 2, (config.h * this.TILE_SIZE) / 2, config.icon);
        const scale = Math.min((config.w * this.TILE_SIZE - 20) / icon.width, (config.h * this.TILE_SIZE - 20) / icon.height);
        icon.setScale(scale);

        const shine = this.add.rectangle(10, 10, config.w * this.TILE_SIZE - 20, config.h * this.TILE_SIZE - 20).setOrigin(0);
        shine.setStrokeStyle(2, 0xffffff, 0.4);

        block.add([shadow, rect, icon, shine]);
        block.setData({ gridX: p.x, gridY: p.y, w: config.w, h: config.h, type: p.type, sound: config.sound, isMoving: false });

        this.fillBoard(p.x, p.y, config.w, config.h, 1);
        block.setInteractive(new Phaser.Geom.Rectangle(0, 0, config.w * this.TILE_SIZE, config.h * this.TILE_SIZE), Phaser.Geom.Rectangle.Contains);
        this.input.setDraggable(block);

        // ドラッグイベント登録
        this.setupDragEvents(block, offsetX, offsetY, moveText);
    }

    setupDragEvents(block, offsetX, offsetY, moveText) {
        block.on('drag', (pointer, dragX, dragY) => {
            const { w, h, gridX, gridY, isMoving, sound } = block.data.values;
            if (isMoving) return;

            let tx = Phaser.Math.Clamp(Math.round((dragX - offsetX) / this.TILE_SIZE), 0, 4 - w);
            let ty = Phaser.Math.Clamp(Math.round((dragY - offsetY) / this.TILE_SIZE), 0, 5 - h);

            if (tx !== gridX || ty !== gridY) {
                let dx = Phaser.Math.Clamp(tx - gridX, -1, 1);
                let dy = Phaser.Math.Clamp(ty - gridY, -1, 1);
                if (dx !== 0 && dy !== 0) dy = 0; // 斜め移動禁止

                const nx = gridX + dx;
                const ny = gridY + dy;

                this.fillBoard(gridX, gridY, w, h, 0); // 一時退避
                if (this.canMoveAt(nx, ny, w, h)) {
                    this.fillBoard(nx, ny, w, h, 1);
                    block.setData('isMoving', true);
                    this.moveCount++;
                    moveText.setText(`MOVES: ${this.moveCount}`);
                    if (sound) this.sound.play(sound, { volume: 0.5 });

                    this.tweens.add({
                        targets: block,
                        x: offsetX + nx * this.TILE_SIZE,
                        y: offsetY + ny * this.TILE_SIZE,
                        duration: 120, ease: 'Cubic.easeOut',
                        onComplete: () => {
                            block.setData({ isMoving: false, gridX: nx, gridY: ny });
                            this.checkWin(nx, ny, block);
                        }
                    });
                } else {
                    this.fillBoard(gridX, gridY, w, h, 1); // 戻す
                }
            }
        });

        block.on('dragend', () => {
            const { gridX, gridY } = block.data.values;
            block.x = offsetX + gridX * this.TILE_SIZE;
            block.y = offsetY + gridY * this.TILE_SIZE;
        });
    }

    canMoveAt(nx, ny, w, h) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let tx = nx + i, ty = ny + j;
                if (tx < 0 || tx >= 4 || ty < 0 || ty >= 5) return false;
                if (this.board[ty][tx] === 1) return false;
            }
        }
        return true;
    }

    fillBoard(x, y, w, h, val) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.board[y + j][x + i] = val;
            }
        }
    }

    checkWin(x, y, block) {
        const { type } = block.data.values;
        if (type === 'hunhun' && x === 1 && y === 3) {
            this.input.enabled = false;
            this.tweens.add({
                targets: block,
                y: block.y + this.TILE_SIZE * 4,
                alpha: 0, duration: 800, ease: 'Cubic.easeIn',
                onComplete: () => {
                    this.time.delayedCall(200, () => {
                        this.sound.stopAll();
                        this.scene.start('GameResult', { move: this.moveCount });
                    });
                }
            });
        }
    }
}