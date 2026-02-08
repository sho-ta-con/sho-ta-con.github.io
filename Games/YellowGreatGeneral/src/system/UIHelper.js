export function createTextButton(scene, x, y, textStr, callback, options = {}) {
    const style = Object.assign({
        fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
        stroke: '#000000', strokeThickness: 6, align: 'center'
    }, options.style || {});

    const text = scene.add.text(x, y, textStr, style).setOrigin(0.5);

    // Create invisible rectangle to enlarge touch area for mobile
    const padX = options.padX || 20;
    const padY = options.padY || 12;
    const hit = scene.add.rectangle(x, y, Math.max(text.width + padX, 10), Math.max(text.height + padY, 10), 0x000000, 0)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

    // Forward pointer events to callback and provide basic visual feedback
    hit.on('pointerup', (p) => { if (callback) callback(p); });
    hit.on('pointerover', () => { text.setScale(1.03); });
    hit.on('pointerout', () => { text.setScale(1); });

    return { text, hit };
}

export function createHeaderText(scene, x, y, textStr, options = {}) {
    const style = Object.assign({ fontFamily: 'Arial', fontSize: 32, color: '#ffffff', stroke: '#000000', strokeThickness: 6, align: 'center' }, options.style || {});
    return scene.add.text(x, y, textStr, style).setOrigin(0.5);
}
