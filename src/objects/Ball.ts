import Phaser from 'phaser';
import Player from './Player';
import PowerBar from './PowerBar';

export type BallHolder = Phaser.GameObjects.Sprite & { x: number; y: number };

export default class Ball extends Phaser.GameObjects.Sprite {
    private holdOffset = { x: 0, y: -30 };

    public isHeld: boolean = false;
    private holder: BallHolder | null = null;

    private spaceKey!: Phaser.Input.Keyboard.Key;

    public isCharging = false;
    public throwPower = 0;
    private readonly MAX_POWER = 900;
    private readonly POWER_STEP = 15;

    public throwCount = 0;

    private lastThrownBy: string | null = null;

    private _isEnabled = true;
    private _easyBallBack = false;

    private lastStealAt = 0;
    private readonly STEAL_COOLDOWN_MS = 1000;
    private stealLockUntil = 0;

    private player: Player;
    public powerBar: PowerBar;

    constructor(scene: Phaser.Scene, player: Player, powerBar: PowerBar, x: number, y: number) {
        super(scene, x, y, 'ball_green');

        this.player = player;
        this.powerBar = powerBar;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;

        // runder Collider
        const radius = Math.floor(Math.max(this.width, this.height) / 2);
        const offsetX = this.width / 2 - radius;
        const offsetY = this.height / 2 - radius;
        body.setCircle(radius, offsetX, offsetY);

        body.setBounce(0.8, 0.8);
        body.setCollideWorldBounds(true);
        body.setAllowGravity(true);

        const input = this.scene.input;
        if (!input.keyboard) {
            console.error('[Ball] Keyboard input not available');
            return;
        }

        this.spaceKey = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceKey.on('down', this.handleSpaceDown, this);
        this.spaceKey.on('up', this.handleSpaceUp, this);

        this.powerBar.hide();
    }

    public set isEnabled(value: boolean) {
        this._isEnabled = value;
    }

    public set easyBallBack(value: boolean) {
        this._easyBallBack = value;
    }

    // -------------------------------------------------------
    // Holder helpers
    // -------------------------------------------------------

    public isHeldBy(holder: BallHolder): boolean {
        return this.isHeld && this.holder === holder;
    }

    // -------------------------------------------------------
    // Attach / Detach
    // -------------------------------------------------------
    public attach(holder: BallHolder) {
        const body = this.body as Phaser.Physics.Arcade.Body;

        this.isHeld = true;
        this.holder = holder;

        body.setVelocity(0, 0);
        body.setAllowGravity(false);

        // beim Attach sicherheitshalber Charging reset
        this.isCharging = false;
        this.throwPower = 0;
        this.powerBar.hide();
    }

    public detach() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        this.isHeld = false;
        this.holder = null;

        body.setAllowGravity(true);

        this.isCharging = false;
        this.throwPower = 0;
        this.powerBar.hide();
    }

    // -------------------------------------------------------
    // Throw
    // -------------------------------------------------------
    public throw(power: number, direction: number) {
        // WICHTIG: Position vor detach() puffern
        const hx = this.holder?.x ?? this.x;
        const hy = this.holder?.y ?? this.y;
        const holdOffsetY = this.getHoldOffsetY();

        this.detach();

        const body = this.body as Phaser.Physics.Arcade.Body;

        // Startposition leicht vor dem Werfer
        this.setPosition(hx + direction * 10, hy + holdOffsetY);

        // Arcade Throw: X proportional, Y nach oben
        const velX = direction * power;
        const velY = -power;

        body.setVelocity(velX, velY);
    }

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------
    public update() {
        if (this.isHeld && this.holder) {
            const holdOffsetY = this.getHoldOffsetY();
            // FOLLOW HOLDER
            this.setPosition(this.holder.x + this.holdOffset.x, this.holder.y + holdOffsetY);

            const body = this.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(0, 0);
            body.setAllowGravity(false);
        }

        // Charging nur, wenn Spieler den Ball hält
        if (this.isCharging && this.player.hasBall) {
            this.throwPower = Math.min(this.throwPower + this.POWER_STEP, this.MAX_POWER);
            this.powerBar.setPower(this.throwPower, this.MAX_POWER);
        }
    }

    // -------------------------------------------------------
    // Input handling (Spieler)
    // -------------------------------------------------------
    private handleSpaceDown(): void {
        if (!this._isEnabled) return;

        const PICKUP_RADIUS = 60;
        const now = this.scene.time.now;

        // 1) Ball aufnehmen / klauen (erster SPACE)
        if (!this.player.hasBall) {
            if (now < this.stealLockUntil) return;
            if (now - this.lastStealAt < this.STEAL_COOLDOWN_MS) return;

            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.x, this.y);
            if (dist <= PICKUP_RADIUS || this._easyBallBack) {
                // Wenn NPC hält -> klauen: NPC.hasBall zurücksetzen (wenn vorhanden)
                if (this.isHeld && this.holder && this.holder !== (this.player as any)) {
                    if ((this.holder as any).hasBall !== undefined) {
                        (this.holder as any).hasBall = false;
                    }
                }

                this.player.pickUpBall(this);
                this.attach(this.player as any);

                this.lastStealAt = now;
                this.lockStealFor(this.STEAL_COOLDOWN_MS, now);

                this.throwPower = 0;
                this.isCharging = false;
                this.powerBar.hide();
            }
            return;
        }

        // 2) Laden starten (zweiter SPACE gedrückt halten)
        if (!this.isCharging) {
            this.isCharging = true;
            this.throwPower = 0;

            this.powerBar.show();
            this.powerBar.setPower(0, this.MAX_POWER);
        }
    }

    private handleSpaceUp(): void {
        // 3) Loslassen -> werfen
        if (!this.isCharging) return;
        if (!this.player.hasBall) return;

        const direction = this.player.isLookingLeft ? -1 : 1;

        this.throw(this.throwPower, direction);

        this.lastThrownBy = 'player';

        // Attribution fürs Scoring
        (this.scene as any).onPlayerThrow?.();

        // Player ball-state freigeben
        this.player.releaseBall();

        // Reset charging
        this.isCharging = false;
        this.throwPower = 0;
        this.powerBar.hide();

        this.throwCount++;
        console.log('[Ball] Würfe:', this.throwCount);
    }

    public setLastThrownBy(id: string | null) {
        this.lastThrownBy = id;
    }

    public getLastThrownBy(): string | null {
        return this.lastThrownBy;
    }

    public canSteal(now: number): boolean {
        return now >= this.stealLockUntil;
    }

    public lockStealFor(ms: number, now: number) {
        this.stealLockUntil = Math.max(this.stealLockUntil, now + ms);
    }

    private getHoldOffsetY(): number {
        if (this.holder && (this.holder as any).isNpcRival) {
            return -60;
        }
        return this.holdOffset.y;
    }
}
