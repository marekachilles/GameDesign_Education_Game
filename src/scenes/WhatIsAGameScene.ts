import Phaser from 'phaser';
import Companion from "../objects/Companion";
import PlayerControls from "../input/PlayerControls";
import Ball from "../objects/Ball";   // ← neu

export default class WhatIsAGameScene extends Phaser.Scene {
    // ...existing code...
    private ball!: Ball;                       // typ ändern
    private ballThrowPower: number = 400;
    private companion!: Companion;
    private playerRect!: Phaser.GameObjects.Rectangle;
    private controls!: PlayerControls;
    private playerSpeed: number = 160;
    private playerVelocityY: number = 0;
    private playerGrounded: boolean = false;
    private playerDirection: number = 1;
    private jumpPower: number = 300;
    private gravity: number = 600;
    private groundLevel: number = 400;


    constructor() {
        super('WhatIsAGameScene');
    }

    create() {
        this.companion = new Companion(this, 50, 50);
        this.companion.say("Willkommen im Level 2");
        this.companion.say("Hier lernst du, was ein Spiel ist.");

        // Player (Rechteck)
        this.playerRect = this.add.rectangle(100, this.groundLevel - 20, 28, 40, 0x00aaFF)
            .setOrigin(0.5);

        
        // Controls
        this.controls = new PlayerControls(this);

    }

    update(time: number, delta: number) {
        const dt = delta / 1000;

        // PLAYER
        const axis = this.controls.xAxis;
        this.playerRect.x += axis * this.playerSpeed * dt;

        if (axis !== 0) this.playerDirection = axis > 0 ? 1 : -1;

        this.playerVelocityY += this.gravity * dt;
        this.playerRect.y += this.playerVelocityY * dt;

        if (this.playerRect.y >= this.groundLevel - 20) {
            this.playerRect.y = this.groundLevel - 20;
            this.playerVelocityY = 0;
            this.playerGrounded = true;
        } else {
            this.playerGrounded = false;
        }

        if (this.controls.isJumping && this.playerGrounded) {
            this.playerVelocityY = -this.jumpPower;
            this.playerGrounded = false;
        }

    }
    

 
}