export class Options extends Phaser.Scene {
    constructor() {
        super('Options');
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        // full-screen overlay to hide game behind options
        this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.7).setOrigin(0.5).setDepth(300);
        // translucent panel for content
        this.add.rectangle(w/2, h/2, w - 120, h - 140, 0x0b62a8, 0.95).setOrigin(0.5).setDepth(305);
        this.add.text(w/2, 80, 'オプション', { fontFamily: 'Arial Black', fontSize: '36px', color: '#ffffff' }).setOrigin(0.5).setDepth(310);

        // read settings from localStorage (fallback) to populate toggles
        let settings = {};
        try { settings = JSON.parse(localStorage.getItem('itemSettings') || '{}'); } catch (e) { settings = {}; }

        const items = [
            { type: 'life', label: 'ライフ' },
            { type: 'bad_life', label: 'ダメージ' },
            { type: 'penetrate', label: '貫通' },
            { type: 'split', label: '分裂' },
            { type: 'enlarge', label: 'パドル拡大' }
        ];

        // panel metrics (use panel defined above)
        const panelW = Math.min(w - 120, Math.max(520, w * 0.85));
        const panelH = Math.max(360, h - 140);
        const panelLeft = (w - panelW) / 2;
        const panelTop = (h - panelH) / 2;
        const paddingX = 48;
        const paddingY = 40;
        const titleHeight = 80;
        const footerHeight = 100;
        const innerH = panelH - titleHeight - footerHeight - paddingY * 2;

        // compute dynamic gap so items fit on screen
        const minGap = 36;
        const maxGap = 80;
        let gap = Math.floor(innerH / (items.length + 1));
        gap = Phaser.Math.Clamp(gap, minGap, maxGap);

        const leftX = panelLeft + paddingX;
        const rightX = panelLeft + panelW - paddingX;

        this.toggles = [];
        items.forEach((it, i) => {
            const y = panelTop + titleHeight + paddingY + (i + 1) * gap;
            // icon left of label
            let icon = null;
            const frameName = it.type;
            let created = false;
            try {
                const texKeys = this.textures && this.textures.list ? Object.keys(this.textures.list) : [];
                for (let k of texKeys) {
                    try {
                        const tex = this.textures.get(k);
                        const hasFrame = tex && typeof tex.has === 'function' ? tex.has(frameName) : (tex && tex.frames && tex.frames[frameName]);
                        if (hasFrame) {
                            icon = this.add.image(leftX - 4, y, k, frameName).setOrigin(0.5).setDepth(310);
                            const w0 = icon.width || (icon.frame && icon.frame.width) || icon.displayWidth;
                            const h0 = icon.height || (icon.frame && icon.frame.height) || icon.displayHeight;
                            const shortSideTarget = (it.type === 'penetrate') ? 48 : (it.type === 'split' ? 48 : 32);
                            if (w0 && h0) {
                                const scale = shortSideTarget / Math.min(w0, h0);
                                icon.setDisplaySize(Math.round(w0 * scale), Math.round(h0 * scale));
                            } else {
                                icon.setDisplaySize(shortSideTarget, shortSideTarget);
                            }
                            // no extra scaling here; split uses short-side 48
                            created = true;
                            break;
                        }
                    } catch (e) { }
                }
            } catch (e) {}
            if (!created) {
                const tryKeys = [frameName, frameName + '.png', frameName + '.PNG'];
                for (let k of tryKeys) {
                    try {
                            if (this.textures && this.textures.exists && this.textures.exists(k)) {
                            icon = this.add.image(leftX - 4, y, k).setOrigin(0.5).setDepth(310);
                            const w0 = icon.width || (icon.frame && icon.frame.width) || icon.displayWidth;
                            const h0 = icon.height || (icon.frame && icon.frame.height) || icon.displayHeight;
                            const shortSideTarget = (it.type === 'penetrate') ? 48 : (it.type === 'split' ? 48 : 32);
                            if (w0 && h0) {
                                const scale = shortSideTarget / Math.min(w0, h0);
                                icon.setDisplaySize(Math.round(w0 * scale), Math.round(h0 * scale));
                            } else {
                                icon.setDisplaySize(shortSideTarget, shortSideTarget);
                            }
                            // no extra scaling here; split uses short-side 48
                            created = true;
                            break;
                        }
                    } catch (e) {}
                }
            }
            if (!created) {
                icon = this.add.text(leftX - 4, y, it.label.charAt(0) || '?', { fontFamily: 'Arial', fontSize: 20, color: '#ffffff' }).setOrigin(0.5).setDepth(310);
            }

            const label = this.add.text(leftX + 36, y, it.label, { fontFamily: 'Arial', fontSize: Math.max(18, Math.floor(w / 40)), color: '#ffffff', wordWrap: { width: panelW - paddingX * 4 } }).setOrigin(0, 0.5).setDepth(310);
            // prefer live game settings if available
            let enabled = (settings[it.type] === undefined) ? true : !!settings[it.type];
            try {
                const gs = this.scene.get('Game');
                if (gs && gs.itemManager && typeof gs.itemManager.isEnabled === 'function') {
                    enabled = gs.itemManager.isEnabled(it.type);
                }
            } catch (e) {}
            const btn = this.add.text(rightX, y, enabled ? 'ON' : 'OFF', { fontFamily: 'Arial Black', fontSize: Math.max(16, Math.floor(w / 60)), color: enabled ? '#66ff66' : '#ff6666', backgroundColor: '#000000', padding: { x: 10, y: 6 } }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true }).setDepth(310);
            btn.on('pointerdown', () => {
                const cur = !(JSON.parse(localStorage.getItem('itemSettings') || '{}')[it.type] === true);
                const s = JSON.parse(localStorage.getItem('itemSettings') || '{}');
                s[it.type] = cur;
                localStorage.setItem('itemSettings', JSON.stringify(s));
                // notify running Game.scene.itemManager if present
                try {
                    const gs = this.scene.get('Game');
                    if (gs && gs.itemManager && typeof gs.itemManager.setEnabled === 'function') {
                        gs.itemManager.setEnabled(it.type, cur);
                    }
                } catch (e) {}
                btn.setText(cur ? 'ON' : 'OFF');
                btn.setStyle({ color: cur ? '#66ff66' : '#ff6666' });
            });
            this.toggles.push({ type: it.type, label, btn });
        });

        const backY = panelTop + panelH - footerHeight / 2;
        const back = this.add.text(w/2, backY, '戻る', { fontFamily: 'Arial Black', fontSize: 26, color: '#ffffff', backgroundColor: '#000000', padding: { x: 8, y: 6 } }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(310);
        back.on('pointerdown', () => {
            // resume game and stop options
            try { this.scene.stop(); this.scene.resume('Game'); } catch (e) {}
        });
    }
}
