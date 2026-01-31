/**
 * 将軍不動斬り - メインゲームシーン
 */

// ゲームバランス調整用定数（マジックナンバー排除）
const GAME_SETTINGS = {
    SCREEN_WIDTH: 800,
    SCREEN_HEIGHT: 600,
    ENEMY_SIZE: 80,          // 敵・姫様の表示サイズ（正方形）
    HP_ICON_SIZE: 30,       // ライフアイコンのサイズ
    HIT_RANGE: 150,         // 刀が届く距離（射程画像の半径と一致させる）
    STUN_DURATION: 500,     // 空振り時の硬直時間(ms)
    ATTACK_FRAME_TIME: 100, // 攻撃画像を表示する時間(ms)
    BASE_SPEED: 200,        // 敵の初期速度
    SPEED_INCREMENT: 10,    // 1人斬るごとの速度上昇値
    SPAWN_INTERVAL_START: 1500, // 初期出現間隔(ms)
    SPAWN_INTERVAL_MIN: 400,    // 最小出現間隔(ms)
    SPAWN_Y_RANGE: 150,     // 中央から上下への出現範囲（60度相当）
    PRINCESS_CHANCE: 0.2    // 姫様が出る確率
};

export class GameMain extends Phaser.Scene {
    constructor() {
        super('GameMain');

    }

    init() {
        this.hp = 3;
        this.score = 0;
        this.isStunned = false;
        this.gameActive = true;
        this.isGameStarted = false; // 説明画像表示中フラグ
        this.spawnTimer = GAME_SETTINGS.SPAWN_INTERVAL_START;
        this.lastSpawnTime = 0;
        this.hpIcons = [];
    }

    create() {

        // 1. 他のシーンの曲が鳴っているかもしれないので、念のため一旦全部止める
        this.sound.stopAll();

        // 2. BGMを追加（キー：bgm_playing）
        this.bgm = this.sound.add('bgm_main', {
            volume: 0.5,
            loop: true
        });

        // 3. 再生
        this.bgm.play();

        const { width, height } = this.scale;

        // 1. 背景（800x600にフィット）
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);

        // 2. 射程範囲の画像（中身が円の正方形画像）
        this.rangeIndicator = this.add.image(width / 2, height / 2, 'range_indicator');
        this.rangeIndicator.setDisplaySize(GAME_SETTINGS.HIT_RANGE * 2, GAME_SETTINGS.HIT_RANGE * 2);
        this.rangeIndicator.setAlpha(0.5);

        // 3. 将軍の配置（デフォルト右向き）
        this.shogun = this.add.sprite(width / 2, height / 2, 'shogun_idle');
        this.shogun.setDisplaySize(150, 200);

        // 4. UI: スコア表示（右上）
        this.scoreText = this.add.text(width - 20, 20, '0人斬り！', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(1, 0);

        // 5. UI: ライフ表示（左上）初期化
        this.updateLifeIcons();

        // 6. グループ設定
        this.enemies = this.physics.add.group();
        this.princesses = this.physics.add.group();

        // 7. 説明用の一枚絵
        this.instructionImage = this.add.image(width / 2, height / 2, 'instruction_image');
        this.instructionImage.setDepth(100);

        // 8. 入力イベント
        this.input.on('pointerdown', (pointer) => {
            // 初回クリック：ゲーム開始
            if (!this.isGameStarted) {
                this.instructionImage.destroy();
                this.isGameStarted = true;
                return;
            }

            // ゲーム中のクリック処理
            if (!this.gameActive || this.isStunned) return;

            const isRightSide = pointer.x > width / 2;
            
            // 将軍の向きとテクスチャ変更（デフォルト右向きなので左クリックで反転）
            this.shogun.setFlipX(!isRightSide); 
            this.shogun.setTexture('shogun_attack');

            let hasHit = false;
            const targets = [...this.enemies.getChildren(), ...this.princesses.getChildren()];

            targets.forEach(target => {
                const dist = Phaser.Math.Distance.Between(this.shogun.x, this.shogun.y, target.x, target.y);
                const targetOnRight = target.x > width / 2;

                // 射程内 かつ クリックした側と同じ方向にターゲットがいるか
                if (dist < GAME_SETTINGS.HIT_RANGE && isRightSide === targetOnRight) {
                    this.handleHit(target);
                    hasHit = true;
                }
            });

            if (hasHit) {
                this.time.delayedCall(GAME_SETTINGS.ATTACK_FRAME_TIME, () => {
                    if (!this.isStunned) this.shogun.setTexture('shogun_idle');
                });
            } else {
                this.triggerStun();
            }
        });
    }

    update(time) {
        if (!this.isGameStarted || !this.gameActive) return;

        // 敵の生成管理
        if (time > this.lastSpawnTime + this.spawnTimer) {
            this.spawnEnemy();
            this.lastSpawnTime = time;
            // 徐々にスピードアップ
            this.spawnTimer = Math.max(GAME_SETTINGS.SPAWN_INTERVAL_MIN, this.spawnTimer * 0.98);
        }

        // 衝突判定
        this.checkCollision();
    }

    updateLifeIcons() {
        this.hpIcons.forEach(icon => icon.destroy());
        this.hpIcons = [];
        for (let i = 0; i < this.hp; i++) {
            const icon = this.add.image(40 + (i * (GAME_SETTINGS.HP_ICON_SIZE + 10)), 40, 'shogun_icon');
            icon.setDisplaySize(GAME_SETTINGS.HP_ICON_SIZE, GAME_SETTINGS.HP_ICON_SIZE);
            this.hpIcons.push(icon);
        }
    }

    spawnEnemy() {
        const { width, height } = this.scale;
        const isPrincess = Math.random() < GAME_SETTINGS.PRINCESS_CHANCE;
        const isFromRight = Math.random() < 0.5;
        
        const startX = isFromRight ? width + 50 : -50;
        const startY = Phaser.Math.Between(
            height / 2 - GAME_SETTINGS.SPAWN_Y_RANGE, 
            height / 2 + GAME_SETTINGS.SPAWN_Y_RANGE
        );
        
        const key = isPrincess ? 'princess' : 'enemy';
        const entity = this.physics.add.sprite(startX, startY, key);
        entity.setDisplaySize(GAME_SETTINGS.ENEMY_SIZE, GAME_SETTINGS.ENEMY_SIZE);
        
        if (isPrincess) {
            entity.setFlipX(isFromRight); // デフォルト右向き
            this.princesses.add(entity);
        } else {
            entity.setFlipX(!isFromRight); // デフォルト左向き
            this.enemies.add(entity);
        }

        const speed = GAME_SETTINGS.BASE_SPEED + (this.score * GAME_SETTINGS.SPEED_INCREMENT);
        this.physics.moveToObject(entity, this.shogun, speed);
    }

    handleHit(target) {
        if (this.enemies.contains(target)) {
            this.sound.play('se_slash');
            this.score++;
            this.scoreText.setText(`${this.score}人斬り！`);
            target.destroy();
        } else {
            // 姫様を斬った（ペナルティ）
            target.destroy();
            this.takeDamage(true);
        }
    }

    triggerStun() {
        this.isStunned = true;
        this.sound.play('se_miss');
        this.shogun.setTint(0xff0000); // 硬直中は赤くなる

        this.time.delayedCall(GAME_SETTINGS.STUN_DURATION, () => {
            this.isStunned = false;
            this.shogun.clearTint();
            this.shogun.setTexture('shogun_idle');
        });
    }

    checkCollision() {
        // 敵が将軍に接触
        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(this.shogun.x, this.shogun.y, enemy.x, enemy.y);
            if (dist < 30) {
                enemy.destroy();
                this.takeDamage(false);
            }
        });

        // 姫様が将軍に接触（獲得・回復）
        this.princesses.getChildren().forEach(princess => {
            const dist = Phaser.Math.Distance.Between(this.shogun.x, this.shogun.y, princess.x, princess.y);
            if (dist < 30) {
                princess.destroy();
                this.gainLife();
            }
        });
    }

    gainLife() {
        this.hp++;
        this.updateLifeIcons();
        this.sound.play('se_gain');
        
        // 回復演出（一瞬緑色に）
        this.shogun.setTint(0x00ff00);
        this.time.delayedCall(200, () => {
            if (!this.isStunned) this.shogun.clearTint();
        });
    }

    takeDamage(isPrincess) {
        this.hp--;
        this.updateLifeIcons();
        this.cameras.main.shake(200, 0.02);

        if (isPrincess) {
            this.sound.play('se_tragedy');
        } else {
            this.sound.play('se_damage');
        }

        if (this.hp <= 0) {
            this.gameActive = false;
            // 1秒後にリザルトシーンへ（scoreを渡す）
            this.time.delayedCall(1000, () => {
                this.scene.start('GameResult', { score: this.score });
            });
        }
    }
}