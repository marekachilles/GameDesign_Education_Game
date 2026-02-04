import Phaser from 'phaser';
import Player from './Player';

export interface FenceConfig {
    totalParts: number;
    brokenPartsCount?: number;
    hasOpening?: boolean;
    openingIndex?: number;
}

export default class Fence extends Phaser.GameObjects.Container {
    private readonly player: Player;
    declare public body: Phaser.Physics.Arcade.Body;

    public static partWidth: number = 64;

    constructor(scene: Phaser.Scene, player: Player, x: number, y: number, config: FenceConfig) {
        super(scene, x, y);

        this.player = player;

        const { totalParts, brokenPartsCount = 0, hasOpening = false, openingIndex } = config;

        // Bestimme die Position für die Öffnung, falls gewünscht
        const actualOpeningIndex = hasOpening
            ? openingIndex !== undefined
                ? openingIndex
                : Math.floor(totalParts / 2)
            : -1;

        // Bestimme zufällige Indizes für kaputte Teile (außer der Öffnung und den Enden)
        const brokenIndices = new Set<number>();
        if (brokenPartsCount > 0) {
            let attempts = 0;
            while (brokenIndices.size < brokenPartsCount && attempts < 100) {
                const rand = Phaser.Math.Between(1, totalParts - 2);
                if (rand !== actualOpeningIndex) {
                    brokenIndices.add(rand);
                }
                attempts++;
            }
        }

        let currentX = 0;
        const partWidth = Fence.partWidth; // Kleine Überlappung, um Lücken zu vermeiden

        for (let i = 0; i < totalParts; i++) {
            let texture = 'fence';

            if (i === actualOpeningIndex) {
                texture = 'fenceOpen';
            } else if (brokenIndices.has(i)) {
                texture = 'fenceBroken';
            } else if (totalParts > 1) {
                if (i === 0) {
                    texture = 'fenceLeft';
                } else if (i === totalParts - 1) {
                    texture = 'fenceRight';
                } else {
                    texture = 'fenceMid';
                }
            } else {
                // Nur ein Teil
                texture = 'fence';
            }

            const sprite = scene.add.sprite(currentX, 0, texture);
            sprite.setOrigin(0, 0.5);
            this.add(sprite);

            currentX += partWidth;
        }

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Collider-Box an die Gesamtbreite des Zauns anpassen
        const totalWidth = totalParts * partWidth;
        this.body.setSize(totalWidth, 45); // 45 ist die tatsächliche Höhe laut Spritesheet
        this.body.setOffset(0, -22.5); // Zentrierung korrigieren (45 / 2)

        scene.physics.add.collider(this, this.player);
    }
}
