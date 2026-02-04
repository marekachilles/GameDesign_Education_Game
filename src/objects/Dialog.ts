import Phaser from 'phaser';
import Button from './Button';

export interface DialogOption {
    text: string;
    callback: () => void;
}

export default class Dialog extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string, options: DialogOption[]) {
        super(scene, x, y);

        const width = 500;
        const padding = 20;
        const buttonHeight = 60;
        const buttonSpacing = 20;

        // Calculate height based on text and options
        // For simplicity, we'll estimate text height or use a fixed minimum
        const minHeight = 200;
        const totalButtonHeight = options.length * (buttonHeight + buttonSpacing);
        const height = minHeight + totalButtonHeight;

        // Background
        const bg = scene.add.rectangle(0, 0, width, height, 0xffffff, 1).setStrokeStyle(4, 0x000000);
        this.add(bg);

        // Text
        const message = scene.add
            .text(0, -height / 2 + padding + 40, text, {
                fontSize: '20px',
                color: '#000000',
                align: 'center',
                wordWrap: { width: width - padding * 2 }
            })
            .setOrigin(0.5);
        this.add(message);

        // Options
        let currentY = message.y + message.height / 2 + 40;

        options.forEach((option) => {
            // We can't use the Button class directly inside the container easily if it adds itself to the scene
            // But our Button class DOES add itself to the scene.
            // So we should create it and then add it to THIS container,
            // BUT Button extends Container, and nesting Containers in Phaser 3 can be tricky with input.
            // However, since Phaser 3.50+, nested containers are better supported.
            // Let's try using the Button class but we need to make sure it's positioned relative to this container.

            const btn = new Button(
                scene,
                0,
                currentY,
                option.text,
                () => {
                    option.callback();
                    this.destroy(); // Auto-close dialog on selection
                },
                200,
                50,
                'primary'
            );

            // The Button constructor adds it to the scene. We want it in this container.
            // We can remove it from the scene display list and add it here.
            scene.children.remove(btn);
            this.add(btn);

            currentY += buttonHeight + buttonSpacing;
        });

        scene.add.existing(this);
    }
}
