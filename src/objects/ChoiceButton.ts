import Phaser from "phaser";

export default class ChoiceButton extends Phaser.GameObjects.Container {

    private bg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private callback: () => void;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        width: number,
        callback: () => void
    ) {
        super(scene, x, y);
        this.callback = callback;

        scene.add.existing(this);

        // Hintergrund (Button)
        this.bg = scene.add.rectangle(0, 0, width, 50, 0x444444, 0.9)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0xffffff);

        // Label
        this.label = scene.add.text(0, 0, text, {
            fontSize: "20px",
            color: "#ffffff",
        }).setOrigin(0.5);

        this.add(this.bg);
        this.add(this.label);

        this.setSize(width, 50);
        this.setInteractive({ useHandCursor: true });

        // -------------------------------------------------
        // HOVER VISUAL
        // -------------------------------------------------
        this.on("pointerover", () => {
            this.bg.setFillStyle(0x666666);
        });

        this.on("pointerout", () => {
            this.bg.setFillStyle(0x444444);
        });

        // -------------------------------------------------
        // CLICK (nur visuell, kein Sound!)
        // -------------------------------------------------
        this.on("pointerdown", () => {
            this.bg.setFillStyle(0x2196f3);
            this.callback();
        });
    }
}
