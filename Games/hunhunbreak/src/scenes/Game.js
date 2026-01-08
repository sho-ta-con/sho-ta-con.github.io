import ItemManager from '../systems/ItemManager.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        this.bricks;
        this.paddle;
        this.ball;
        this.ballTrail;
        this.brickEmitters;
        this.ignoreNextPointerUp = false;
        this._isDragging = false;
    }

    create() {
        //  Enable world bounds, but disable the floor
        this.physics.world.setBoundsCollision(true, true, true, false);

        // Create brick explosion particles for each color
        const colorConfig = {
            'blue1': 0x4444ff,
            'red1': 0xff4444,
            'green1': 0x44ff44,
            'yellow1': 0xffff44,
            'silver1': 0xcccccc,
            'purple1': 0xff44ff
        };

        this.brickEmitters = {};
        Object.entries(colorConfig).forEach(([color, tint]) => {
            this.brickEmitters[color] = this.add.particles(0, 0, 'assets', {
                frame: 'ball1',
                lifespan: 800,
                speed: { min: 150, max: 250 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                gravityY: 300,
                tint,
                emitting: false
            });
        });

        //  Create the bricks in a 10x6 grid
        this.bricks = this.physics.add.staticGroup();
        const colors = ['blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1'];
        const rows = 6;
        const cols = 10;
        const startX = 120;
        const startY = 120;
        const spacingX = 88;
        const spacingY = 40;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const frame = colors[r % colors.length];
                const x = startX + c * spacingX;
                const y = startY + r * spacingY;
                const brick = this.bricks.create(x, y, 'assets', frame).setOrigin(0.5);
                brick.refreshBody();
            }
        }

        // Create paddle before any balls so colliders can be attached
        this.paddle = this.physics.add.image(this.cameras.main.centerX, 720, 'assets', 'paddle1').setImmovable(true).setDepth(100);
        this.paddle.body.allowGravity = false;
        this.paddle.setCollideWorldBounds(true);

        // disable browser touch gestures like double-tap zoom on the game canvas
        try { if (this.game && this.game.canvas) this.game.canvas.style.touchAction = 'none'; } catch (e) {}

        // Prepare balls tracking and spawn initial ball on paddle
        this.balls = [];
        this.createBall(this.paddle.x, 600, 0, 0, true);
        // Penetration is tracked per-ball via ball.data 'penetrationHits'
        // Score & combo
        this.score = 0;
        this.combo = 0;
        // Lives
        this.lives = 3;
        this.lifeIcons = [];
        this.scoreText = this.add.text(this.cameras.main.width - 16, 16, 'Score: 0', { fontFamily: 'Arial', fontSize: '24px', color: '#ffffff' })
            .setOrigin(1, 0)
            .setDepth(200);

        // Draw initial lives (hearts) at top-left
        this.updateLivesDisplay();

        //  Our colliders
        // colliders will be attached per-ball when created
        // Item manager handles spawning, update and collection
        this.itemManager = new ItemManager(this);

        //  Input events
        this.input.on('pointermove', (pointer) => {

            // only move paddle when dragging/touching (helps mobile devices)
            if (!(pointer.isDown || this._isDragging)) return;
            //  Keep the paddle within the game
            this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 972);

            // Move any balls that are currently on the paddle
            this.balls.forEach(b => {
                if (b && b.getData && b.getData('onPaddle')) {
                    b.x = this.paddle.x;
                }
            });

        }, this);

        // Track touch/drag start so mobile touchmove events are handled
        this.input.on('pointerdown', (pointer) => {
            this._isDragging = true;
            // immediately position paddle under finger
            try { this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 972); } catch (e) {}
            this.balls.forEach(b => { if (b && b.getData && b.getData('onPaddle')) b.x = this.paddle.x; });
        }, this);

        // Note: drag (pointermove) controls paddle; tap-to-move disabled to avoid accidental launches on mobile.

        this.input.on('pointerup', (pointer) => {

            // stop dragging state
            this._isDragging = false;

            // Ignore this pointerup if flagged (used when returning from Options)
            if (this.ignoreNextPointerUp) {
                this.ignoreNextPointerUp = false;
                return;
            }

            // Launch any balls that are on the paddle
            this.balls.forEach(b => {
                if (b && b.getData && b.getData('onPaddle')) {
                    b.setVelocity(-75, -300);
                    b.setData('onPaddle', false);
                }
            });

        });

        // Options button
        this.optBtn = this.add.text(16, 48, 'オプション', { fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', backgroundColor: '#000000' }).setOrigin(0, 0).setPadding(6).setDepth(500).setInteractive({ useHandCursor: true });
        this.optBtn.on('pointerdown', () => {
            try { this.ignoreNextPointerUp = true; this.scene.pause(); this.scene.launch('Options'); } catch (e) {}
        });

        // 貫通時用のアニメーションを作成
        this.anims.create({
            key: 'penetration_anim',
            frames: this.anims.generateFrameNumbers('gaming', { start: 0, end: 29 }), // コマ数は素材に合わせる
            frameRate: 30,
            repeat: -1
        });
    }

    // Create a ball and attach colliders
    createBall(x, y, vx = 0, vy = 0, onPaddle = false) {
        //const ball = this.physics.add.image(x, y, 'assets', 'ball1');
        const ball = this.physics.add.sprite(x, y, 'ball');
        ball.setDisplaySize(22 , 22);
        ball.setCollideWorldBounds(true);
        ball.setBounce(1);
        ball.setData('onPaddle', !!onPaddle);
        if (!onPaddle) {
            ball.setVelocity(vx, vy);
        } else {
            ball.setVelocity(0, 0);
        }

        // Add colliders for this ball
        this.physics.add.collider(ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(ball, this.paddle, this.hitPaddle, null, this);

        // Track ball
        this.balls.push(ball);
        // primary ball reference
        this.ball = this.balls[0];
        // apply penetration tint if this ball has penetrationHits
        try {
            const ph = ball.getData && ball.getData('penetrationHits');
            if (ph && ph > 0) {
                //ball.setTint(0xff0000);
                ball.setTexture('gaming'); // 画像を切り替え
                ball.play('penetration_anim'); // アニメ再生
                ball.setDisplaySize(22, 22); // テクスチャを変えるとサイズがリセットされるため再設定
            }
        } catch (e) {}
        return ball;
    }

    hitBrick(ball, brick) {
        const brickColor = brick.frame.name;
        // Prevent further collisions immediately (keep visual fade)
        try {
            if (brick.body) {
                brick.body.enable = false;
            }
            // mark inactive so countActive() reflects removal
            if (brick.setActive) brick.setActive(false);
        } catch (e) {}

        // Create explosion effect at brick position
        this.brickEmitters[brickColor].emitParticleAt(brick.x, brick.y, 12);
        this.brickEmitters[brickColor].setDepth(100);

        this.tweenAlpha(brick, () => {
            // fully disable and hide now
            brick.disableBody(true, true);

            // Possibly spawn an item (delegated to ItemManager)
            try { if (this.itemManager) this.itemManager.spawnAt(brick.x, brick.y); } catch (e) {}

            // Check after brick is actually disabled
            if (this.bricks.countActive() === 0) {
                // All bricks cleared -> go to Game Clear screen
                this.scene.start('GameClear', { score: this.score });
            }
        });

        // Combo scoring: increase combo if not broken by paddle; base 100, +50 per additional
        this.combo += 1;
        const points = 100 + (this.combo - 1) * 50;
        this.score += points;
        if (this.scoreText) {
            this.scoreText.setText('Score: ' + this.score);
        }

        // If this ball has penetrationHits remaining, restore previous velocity so it effectively passes through
        try {
            const ph = ball.getData && ball.getData('penetrationHits');
            if (ph && ph > 0) {
                if (ball._prevVx !== undefined && ball._prevVy !== undefined) {
                    ball.body.velocity.x = ball._prevVx;
                    ball.body.velocity.y = ball._prevVy;
                }
            }
        } catch (e) {}

        // Show combo text when combo >= 2
        if (this.combo >= 2) {
            const comboText = this.add.text(brick.x, brick.y, this.combo + ' Combo!', {
                fontFamily: 'Arial Black', fontSize: '24px', color: '#ffea00', stroke: '#000000', strokeThickness: 4
            }).setOrigin(0.5).setDepth(300);

            this.tweens.add({
                targets: comboText,
                y: brick.y - 40,
                alpha: 0,
                duration: 800,
                ease: 'Cubic.easeOut',
                onComplete: () => { comboText.destroy(); }
            });
        }

        
    }

    resetBall() {
        // destroy existing balls and create a fresh one on paddle
        this.balls.forEach(b => { try { b.destroy(); } catch (e) {} });
        this.balls = [];
        this.createBall(this.paddle.x, 600, 0, 0, true);
        // Reset combo when ball is placed back on paddle / life lost
        this.combo = 0;
    }

    resetLevel() {
        this.resetBall();

        // remove any falling items when resetting level
        if (this.itemManager && this.itemManager.items) {
            try { this.itemManager.items.clear(true, true); } catch (e) {}
        }

        this.bricks.children.each(brick => {
            brick.enableBody(false, 0, 0, true, true);
        });
        // Reset combo when level resets
        this.combo = 0;
        // reset penetration state: clear per-ball penetration data
        this.balls.forEach(b => {
            try {
                if (b && b.setData) b.setData('penetrationHits', 0);
                    //b.clearTint();
                b.stop();
                b.setTexture('ball'); 
                b.setDisplaySize(22, 22);
            } catch (e) {} 
        });
    }

    hitPaddle(ball, paddle) {
        // Hitting the paddle breaks any combo
        this.combo = 0;
        // If this ball has penetrationHits, decrement that ball's counter only
        try {
            let ph = ball.getData && ball.getData('penetrationHits');
            ph = ph || 0;
            if (ph > 0) {
                ph -= 1;
                if (ball.setData) ball.setData('penetrationHits', ph);
                if (ph === 0) {
                    try {
                        //if (ball && ball.clearTint) ball.clearTint();
                        if (ball && ball.anims) {
                            ball.stop();
                            ball.setTexture('ball'); // 元の画像に戻す
                            ball.setDisplaySize(22, 22); // サイズを再設定
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}
        let diff = 0;

        if (ball.x < paddle.x) {
            //  Ball is on the left-hand side of the paddle
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        }
        else if (ball.x > paddle.x) {
            //  Ball is on the right-hand side of the paddle
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        }
        else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    tweenAlpha(target, callback) {
        this.tweens.add({
            targets: target,
            alpha: 0,
            duration: 150,
            ease: 'Sine.inOut',
            onComplete: callback
        });
    }

    update(time, delta) {
        // handle multiple balls: remove balls that fall; if none remain, lose life
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const b = this.balls[i];
            if (!b || !b.active) {
                this.balls.splice(i, 1);
                continue;
            }
            if (b.y > 768 && !b.getData('onPaddle')) {
                // destroy this ball
                try { b.destroy(); } catch (e) {}
                this.balls.splice(i, 1);
            }
        }
        if (this.balls.length === 0) {
            this.loseLife();
        }

        // Update items via ItemManager
        try { if (this.itemManager) this.itemManager.update(delta); } catch (e) {}

        // store previous velocities for balls (used to restore on penetration)
        this.balls.forEach(b => {
            if (b && b.body) {
                b._prevVx = b.body.velocity.x;
                b._prevVy = b.body.velocity.y;
            }
        });

        // Hide options button while any ball is active and not on the paddle (gameplay in progress)
        try {
            if (this.optBtn) {
                const anyMoving = this.balls.some(b => b && b.active && !(b.getData && b.getData('onPaddle')));
                this.optBtn.setVisible(!anyMoving);
                this.optBtn.setInteractive(!anyMoving);
            }
        } catch (e) {}
    }

    loseLife() {
        // Decrease life and update display
        this.lives -= 1;
        this.updateLivesDisplay();

        if (this.lives <= 0) {
            // Game over
            this.scene.start('GameOver', { score: this.score });
        } else {
            // Reset ball to paddle for next life
            // remove any falling items when waiting for respawn
            if (this.itemManager && this.itemManager.items) {
                try { this.itemManager.items.clear(true, true); } catch (e) {}
            }
            this.resetBall();
        }
    }

    updateLivesDisplay() {
        // Clear existing icons
        this.lifeIcons.forEach(icon => icon.destroy());
        this.lifeIcons = [];

        const startX = 16;
        const startY = 16;
        const spacing = 28;

        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.text(startX + i * spacing, startY, '❤', { fontFamily: 'Arial', fontSize: '24px', color: '#ff0000' })
                .setOrigin(0, 0)
                .setDepth(200);
            this.lifeIcons.push(heart);
        }
    }



    enlargePaddle(duration = 5000, factor = 1.25) {
        if (!this.paddle) return;
        // store original size if not stored
        if (!this._paddleOriginal) {
            this._paddleOriginal = { width: this.paddle.displayWidth, height: this.paddle.displayHeight };
        }
        const ow = this._paddleOriginal.width;
        const oh = this._paddleOriginal.height;
        const newW = ow * factor;
        this.paddle.setDisplaySize(newW, oh);
        // update physics body size if exists
        if (this.paddle.body && this.paddle.body.setSize) {
            this.paddle.body.setSize(newW, oh, true);
        }
        // cancel previous timer if any
        if (this._paddleEnlargeTimer) {
            this._paddleEnlargeTimer.remove();
        }
        this._paddleEnlargeTimer = this.time.addEvent({ delay: duration, callback: () => {
            // revert
            this.paddle.setDisplaySize(ow, oh);
            if (this.paddle.body && this.paddle.body.setSize) {
                this.paddle.body.setSize(ow, oh, true);
            }
            this._paddleEnlargeTimer = null;
        }});
    }
}