import Phaser from 'phaser';

export default class CharacterSelection extends Phaser.GameObjects.Container {
    private onSelect: (spriteKey: string) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, onSelect: (spriteKey: string) => void) {
        super(scene, x, y);
        this.onSelect = onSelect;

        // Background
        const bg = scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.8).setStrokeStyle(4, 0xffffff);
        this.add(bg);

        // Title
        const title = scene.add
            .text(0, -100, 'Wähle deinen Charakter', {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'monospace'
            })
            .setOrigin(0.5);
        this.add(title);

        // Options
        this.createOption(scene, -100, 20, 'player_red');
        this.createOption(scene, 0, 20, 'player_blue');
        this.createOption(scene, 100, 20, 'player_green');

        scene.add.existing(this);
    }

    private createOption(scene: Phaser.Scene, x: number, y: number, spriteKey: string) {
        const option = scene.add.sprite(x, y, spriteKey + '_stand').setInteractive({ useHandCursor: true });

        option.on('pointerdown', () => {
            this.onSelect(spriteKey);
        });

        // Hover effect
        option.on('pointerover', () => {
            option.setScale(1.1);
        });
        option.on('pointerout', () => {
            option.setScale(1.0);
        });

        this.add(option);
    }
}
