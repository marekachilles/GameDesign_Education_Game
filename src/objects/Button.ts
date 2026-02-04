import Phaser from 'phaser';

export type ButtonStyle = 'primary' | 'secondary';

export default class Button extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private textObject: Phaser.GameObjects.Text;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        callback: () => void,
        width: number = 200,
        height: number = 60,
        style: ButtonStyle = 'primary'
    ) {
        super(scene, x, y);

        // Colors based on style
        const bgColor = style === 'primary' ? 0x333333 : 0x222222;
        const hoverColor = style === 'primary' ? 0x555555 : 0x444444;
        const borderColor = 0xffffff;

        // Background (Pixelated look: simple rectangle with border)
        this.background = scene.add.rectangle(0, 0, width, height, bgColor).setStrokeStyle(4, borderColor);

        // Text
        this.textObject = scene.add
            .text(0, 0, text, {
                fontSize: '24px',
                color: '#ffffff'
            })
            .setOrigin(0.5);

        // Add to container
        this.add([this.background, this.textObject]);

        // Interactivity
        this.setSize(width, height);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerover', () => {
            this.background.setFillStyle(hoverColor);
        });

        this.on('pointerout', () => {
            this.background.setFillStyle(bgColor);
        });

        this.on('pointerdown', callback);

        scene.add.existing(this);
    }
}
