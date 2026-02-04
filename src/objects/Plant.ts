import Phaser from 'phaser';
import Player from './Player';

export default class Plant extends Phaser.GameObjects.Sprite {
    private readonly player: Player;
    declare public body: Phaser.Physics.Arcade.Body;

    constructor(scene: Phaser.Scene, player: Player, x: number, y: number, scale: number = 3) {
        super(scene, x, y, 'plant');

        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(scale);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Collider-Box anpassen
        this.body.setSize(this.width, this.height);

        scene.physics.add.collider(this, this.player);
    }
}
