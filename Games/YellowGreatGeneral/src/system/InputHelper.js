export function enableKeyboardAttacks(scene, attackCallback) {
    try {
        const keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            d: Phaser.Input.Keyboard.KeyCodes.D
        });

        const handler = (event) => {
            // Map key to direction: left/A -> left side, right/D -> right side
            const code = event.code || event.key || '';
            let isRight = null;
            if (code === 'ArrowLeft' || code === 'KeyA') isRight = false;
            if (code === 'ArrowRight' || code === 'KeyD') isRight = true;
            if (isRight === null) return;
            try { attackCallback(isRight); } catch (e) {}
        };

        scene.input.keyboard.on('keydown', handler);
        scene.events.once('shutdown', () => { try { scene.input.keyboard.off('keydown', handler); } catch (e) {} });
    } catch (e) {}
}
