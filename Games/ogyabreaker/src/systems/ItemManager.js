export default class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = scene.add.group();
        this.itemTypes = [
            { type: 'life', chance: 0.05, char: '❤', color: '#ff6666', frame: 'life' },
            { type: 'bad_life', chance: 0.05, char: '❤', color: '#003366', frame: 'bad_life' },
            { type: 'penetrate', chance: 0.1, char: '✦', color: '#ffffff', frame: 'penetrate' },
            { type: 'split', chance: 0.1, char: '●', color: '#ffee66', frame: 'split' },
            { type: 'enlarge', chance: 0.05, char: '▬', color: '#ffffff', frame: 'enlarge' }
        ];
        // load enabled flags from localStorage if present
        try {
            const raw = localStorage.getItem('itemSettings');
            const settings = raw ? JSON.parse(raw) : {};
            this.enabled = {};
            this.itemTypes.forEach(it => {
                this.enabled[it.type] = (settings[it.type] !== undefined) ? !!settings[it.type] : true;
            });
        } catch (e) {
            this.enabled = {};
            this.itemTypes.forEach(it => { this.enabled[it.type] = true; });
        }
    }

    spawnAt(x, y) {
        const totalChance = this.itemTypes.reduce((s, it) => s + (it.chance || 0), 0);
        if (totalChance <= 0) return;
        const p = Math.random();
        let cum = 0;
        let chosen = null;
        for (let it of this.itemTypes) {
            cum += (it.chance || 0);
            if (p < cum) { chosen = it; break; }
        }
        if (!chosen) return;
        // skip if this item type is disabled
        if (this.enabled && this.enabled[chosen.type] === false) return;
        const frameName = chosen.frame || chosen.type;
        let created = false;
        // 1) Try to find the frame in any loaded texture atlas
        try {
            const texKeys = this.scene.textures && this.scene.textures.list ? Object.keys(this.scene.textures.list) : [];
            for (let k of texKeys) {
                try {
                    const tex = this.scene.textures.get(k);
                    const hasFrame = tex && typeof tex.has === 'function' ? tex.has(frameName) : (tex && tex.frames && tex.frames[frameName]);
                    if (hasFrame) {
                        const img = this.scene.add.image(x, y - 8, k, frameName).setOrigin(0.5).setDepth(150);
                        try {
                            const w = img.width || (img.frame && img.frame.width) || img.displayWidth;
                            const h = img.height || (img.frame && img.frame.height) || img.displayHeight;
                            const shortSideTarget = (chosen.type === 'penetrate') ? 48 : (chosen.type === 'split' ? 56 : 32);
                            if (w && h) {
                                const scale = shortSideTarget / Math.min(w, h);
                                img.setDisplaySize(Math.round(w * scale), Math.round(h * scale));
                            } else {
                                img.setDisplaySize(shortSideTarget, shortSideTarget);
                            }
                        } catch (e) {}
                        img.type = chosen.type;
                        img.fallSpeed = 200;
                        img._autoDestroyTimer = this.scene.time.addEvent({ delay: 6000, callback: () => { if (img && img.active) img.destroy(); } });
                        this.items.add(img);
                        created = true;
                        break;
                    }
                } catch (e) { /* continue */ }
            }
        } catch (e) {}
        // 2) If not found as atlas frame, try standalone image keys (with/without .png)
        if (!created) {
            const tryKeys = [frameName, frameName + '.png', frameName + '.PNG', chosen.type, chosen.type + '.png', chosen.type + '.PNG'];
            for (let k of tryKeys) {
                try {
                    if (this.scene.textures && this.scene.textures.exists && this.scene.textures.exists(k)) {
                        const img = this.scene.add.image(x, y - 8, k).setOrigin(0.5).setDepth(150);
                        try {
                            const w = img.width || (img.frame && img.frame.width) || img.displayWidth;
                            const h = img.height || (img.frame && img.frame.height) || img.displayHeight;
                            const shortSideTarget = (chosen.type === 'penetrate') ? 48 : (chosen.type === 'split' ? 56 : 32);
                            if (w && h) {
                                const scale = shortSideTarget / Math.min(w, h);
                                img.setDisplaySize(Math.round(w * scale), Math.round(h * scale));
                            } else {
                                img.setDisplaySize(shortSideTarget, shortSideTarget);
                            }
                        } catch (e) {}
                        img.type = chosen.type;
                        img.fallSpeed = 200;
                        img._autoDestroyTimer = this.scene.time.addEvent({ delay: 6000, callback: () => { if (img && img.active) img.destroy(); } });
                        this.items.add(img);
                        created = true;
                        break;
                    }
                } catch (e) { /* ignore and continue */ }
            }
        }
        // 3) fallback to text if no image available
        if (!created) {
            const itemText = this.scene.add.text(x, y - 8, chosen.char || '?', { fontFamily: 'Arial', fontSize: '28px', color: chosen.color || '#ffffff' }).setOrigin(0.5).setDepth(150);
            itemText.type = chosen.type;
            itemText.fallSpeed = 200;
            itemText._autoDestroyTimer = this.scene.time.addEvent({ delay: 6000, callback: () => { if (itemText && itemText.active) itemText.destroy(); } });
            this.items.add(itemText);
        }
    }

    // settings API
    isEnabled(type) {
        if (!this.enabled) return true;
        return !!this.enabled[type];
    }

    setEnabled(type, value) {
        try {
            this.enabled = this.enabled || {};
            this.enabled[type] = !!value;
            localStorage.setItem('itemSettings', JSON.stringify(this.enabled));
        } catch (e) {}
    }

    // returns item types with enabled flag
    getTypesWithEnabled() {
        return this.itemTypes.map(it => ({ ...it, enabled: this.isEnabled(it.type) }));
    }

    update(delta) {
        const itemsToDestroy = [];
        this.items.children.each(item => {
            if (!item || !item.active) return;
            const dy = (item.fallSpeed || 120) * (delta / 1000);
            item.y += dy;
            if (item.y > 1100) { itemsToDestroy.push(item); return; }
            if (item.getBounds && this.scene.paddle && this.scene.paddle.getBounds) {
                if (Phaser.Geom.Intersects.RectangleToRectangle(item.getBounds(), this.scene.paddle.getBounds())) {
                    this.onCollect(item);
                }
            }
        }, this);
        itemsToDestroy.forEach(i => { if (i && i.destroy) i.destroy(); });
    }

    onCollect(item) {
        if (!item || !item.active) return;
        const type = item.type || null;
        try { item.destroy(); } catch (e) {}
        const scene = this.scene;
        switch (type) {
            case 'life':
                scene.lives += 1;
                scene.updateLivesDisplay();
                const pxGood = (scene.paddle && scene.paddle.x) ? scene.paddle.x : scene.cameras.main.centerX;
                const pyGood = (scene.paddle && scene.paddle.y) ? scene.paddle.y : 700;
                const posText = scene.add.text(pxGood, pyGood - 30, '❤ +1', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ff6666', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(400);
                scene.tweens.add({ targets: posText, y: pyGood - 60, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => posText.destroy() });
                break;
            case 'penetrate':
                const pen = scene.add.text(scene.cameras.main.centerX, 60, 'Penetration x2', { fontFamily: 'Arial Black', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(400);
                scene.time.addEvent({ delay: 1200, callback: () => pen.destroy() });
                scene.balls.forEach(b => {
                    try {
                        if (!b || !b.setData) return;
                        b.setData('penetrationHits', 2);
                        //if (b.setTint) b.setTint(0xff0000);
                        b.setTexture('gaming'); // 画像を切り替え
                        b.play('penetration_anim'); // アニメ再生
                        b.setDisplaySize(22, 22); // テクスチャを変えるとサイズがリセットされるため再設定
                    } catch (e) {}
                });
                break;
            case 'split':
                try {
                    const existing = scene.balls.slice(0);
                    const rad = deg => deg * Math.PI / 180;
                    const angles = [-20, 20];
                    existing.forEach(orig => {
                        if (!orig || !orig.active) return;
                        const px = orig.x;
                        const py = orig.y;
                        const onPaddle = orig.getData && orig.getData('onPaddle');
                        if (onPaddle) {
                            const b1 = scene.createBall(px - 10, py, 0, 0, true);
                            const b2 = scene.createBall(px + 10, py, 0, 0, true);
                            try {
                                const ph = orig.getData && orig.getData('penetrationHits') || 0;
                                if (ph > 0) {
                                    if (b1 && b1.setData) b1.setData('penetrationHits', ph);
                                    if (b2 && b2.setData) b2.setData('penetrationHits', ph);
                                    //if (b1 && b1.setTint) b1.setTint(0xff0000);
                                    //if (b2 && b2.setTint) b2.setTint(0xff0000);
                                    if (b1 && b1.setTexture){
                                        b1.setTexture('gaming'); // 画像を切り替え
                                        b1.play('penetration_anim'); // アニメ再生
                                        b1.setDisplaySize(22, 22); // テクスチャを変えるとサイズがリセットされるため再設定
                                    }
                                    if (b2 && b2.setTexture){
                                        b2.setTexture('gaming'); // 画像を切り替え
                                        b2.play('penetration_anim'); // アニメ再生
                                        b2.setDisplaySize(22, 22); // テクスチャを変えるとサイズがリセットされるため再設定
                                    }
                                }
                            } catch (e) {}
                        } else {
                            const vx = (orig.body && orig.body.velocity) ? orig.body.velocity.x : -75;
                            const vy = (orig.body && orig.body.velocity) ? orig.body.velocity.y : -300;
                            const speed = Math.sqrt(vx*vx + vy*vy) || 300;
                            const baseAngle = Math.atan2(vy, vx);
                            angles.forEach(a => {
                                const newAngle = baseAngle + rad(a);
                                const nvx = Math.cos(newAngle) * speed;
                                const nvy = Math.sin(newAngle) * speed;
                                const nb = scene.createBall(px, py, nvx, nvy, false);
                                try {
                                    const ph = orig.getData && orig.getData('penetrationHits') || 0;
                                    if (ph > 0 && nb) {
                                        if (nb.setData) nb.setData('penetrationHits', ph);
                                        //if (nb.setTint) nb.setTint(0xff0000);
                                        if (nb.setTexture) {
                                            nb.setTexture('gaming'); // 画像を切り替え
                                            nb.play('penetration_anim'); // アニメ再生
                                            nb.setDisplaySize(22, 22); // テクスチャを変えるとサイズがリセットされるため再設定
                                        }
                                    }
                                } catch (e) {}
                            });
                        }
                    });
                } catch (e) {}
                break;
            case 'enlarge':
                scene.enlargePaddle(5000, 1.25);
                break;
            case 'bad_life':
                scene.lives -= 1;
                if (scene.lives < 0) scene.lives = 0;
                scene.updateLivesDisplay();
                const px = (scene.paddle && scene.paddle.x) ? scene.paddle.x : scene.cameras.main.centerX;
                const py = (scene.paddle && scene.paddle.y) ? scene.paddle.y : 700;
                const negText = scene.add.text(px, py - 30, '❤ -1', { fontFamily: 'Arial Black', fontSize: '24px', color: '#003366', stroke: '#ffffff', strokeThickness: 3 }).setOrigin(0.5).setDepth(400);
                scene.tweens.add({ targets: negText, y: py - 60, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => negText.destroy() });
                if (scene.lives <= 0) {
                    scene.scene.start('GameResult', { score: scene.score , clear: false });
                }
                break;
            default:
                break;
        }
        scene.sound.play('se_item', { volume: 1.0 });
    }
}
