import Phaser from 'phaser';
import SoundManager from '../utils/SoundManager';

export default class BaseScene extends Phaser.Scene {
    preload() {
        const assetRoot = '/src/assets/abstract-platformer-pack/PNG';

        // preload assets that are reused among all levels

        // player sprites
        const players: string[] = ['Red', 'Blue', 'Green'];
        const animations: Record<string, number> = { stand: 0, walk: 5, up: 3, fall: 0, swim: 2 };

        players.forEach((player) => {
            Object.keys(animations).forEach((animation) => {
                let frames = animations[animation];
                if (frames === 0) {
                    this.load.image(
                        `player_${player.toLowerCase()}_${animation}`,
                        assetRoot + `/Players/${player}/player${player}_${animation}.png`
                    );
                } else {
                    for (let i = 1; i <= frames; i++) {
                        this.load.image(
                            `player_${player.toLowerCase()}_${animation}${i}`,
                            assetRoot + `/Players/${player}/player${player}_${animation}${i}.png`
                        );
                    }
                }
            });
        });
        const enemySets = [
            "enemyWalking",
            "enemyFlying",
            "enemyFlyingAlt",
            "enemyFloating",
            "enemySpikey",
            "enemySwimming",
        ];

    enemySets.forEach((set) => {
        for (let i = 1; i <= 4; i++) {
        this.load.image(`${set}_${i}`, `${assetRoot}/Enemies/${set}_${i}.png`);
        }
    });
        //NPCSprites
        this.load.image('npc_1', assetRoot + '/Enemies/enemyWalking_1.png');
        this.load.image('npc_2', assetRoot + '/Enemies/enemyWalking_2.png');
        this.load.image('npc_3', assetRoot + '/Enemies/enemyWalking_3.png');
        this.load.image('npc_4', assetRoot + '/Enemies/enemyWalking_4.png');

        //ball sprites
        this.load.image('ball_green', '/src/assets/abstract-platformer-pack/PNG/Items/discGreen.png');
        this.load.image('ball_red', '/src/assets/abstract-platformer-pack/PNG/Items/discRed.png');

        // companion sprites
        this.load.image('companion_idle', assetRoot + '/Players/Grey/playerGrey_swim1.png');

        // Items
        this.load.image('crystal', assetRoot + '/Items/yellowCrystal.png');

        // Jewel baskets (named by color as "color_basket")
        this.load.image('blue_basket', '/src/assets/abstract-platformer-pack/PNG/Items/blueJewel.png');
        this.load.image('red_basket', '/src/assets/abstract-platformer-pack/PNG/Items/redJewel.png');
        this.load.image('green_basket', '/src/assets/abstract-platformer-pack/PNG/Items/greenJewel.png');
        this.load.image('yellow_basket', '/src/assets/abstract-platformer-pack/PNG/Items/yellowJewel.png');

        // Platforms
        this.load.image('brown_platform_top_left', '/src/assets/environment/brown/brown_platform_top_left.png');
        this.load.image('brown_platform_top_middle', '/src/assets/environment/brown/brown_platform_top_middle.png');
        this.load.image('brown_platform_top_right', '/src/assets/environment/brown/brown_platform_top_right.png');
        this.load.image('brown_platform_fill', '/src/assets/environment/brown/brown_platform_middle.png');

        // Green platforms
        this.load.image('green_platform_top_start', '/src/assets/environment/green/green_platform_top_start.png');
        this.load.image('green_platform_top_middle', '/src/assets/environment/green/green_platform_top_middle.png');
        this.load.image('green_platform_top_end', '/src/assets/environment/green/green_platform_top_end.png');
        this.load.image('green_platform_fill', '/src/assets/environment/green/green_platform_middle.png');

        // Blue platforms (will be added later)
        // this.load.image('blue_platform_top_left', '/src/assets/environment/blue/blue_platform_top_left.png');
        // this.load.image('blue_platform_top_middle', '/src/assets/environment/blue/blue_platform_top_middle.png');
        // this.load.image('blue_platform_top_right', '/src/assets/environment/blue/blue_platform_top_right.png');

        // Yellow platforms (will be added later)
        // this.load.image('yellow_platform_top_left', '/src/assets/environment/yellow/yellow_platform_top_left.png');
        // this.load.image('yellow_platform_top_middle', '/src/assets/environment/yellow/yellow_platform_top_middle.png');
        // this.load.image('yellow_platform_top_right', '/src/assets/environment/yellow/yellow_platform_top_right.png');

        // Background
        this.load.image('bg1_solid', assetRoot + '/Backgrounds/set1_background.png');
        this.load.image('bg1_hills', assetRoot + '/Backgrounds/set1_hills.png');
        this.load.image('bg1_tiles', assetRoot + '/Backgrounds/set1_tiles.png');
        this.load.image('bg2_solid', assetRoot + '/Backgrounds/set2_background.png');
        this.load.image('bg2_hills', assetRoot + '/Backgrounds/set2_hills.png');
        this.load.image('bg2_tiles', assetRoot + '/Backgrounds/set2_tiles.png');
        this.load.image('bg3_solid', assetRoot + '/Backgrounds/set3_background.png');
        this.load.image('bg3_hills', assetRoot + '/Backgrounds/set3_hills.png');
        this.load.image('bg3_tiles', assetRoot + '/Backgrounds/set3_tiles.png');
        this.load.image('bg4_solid', assetRoot + '/Backgrounds/set4_background.png');
        this.load.image('bg4_hills', assetRoot + '/Backgrounds/set4_hills.png');
        this.load.image('bg4_tiles', assetRoot + '/Backgrounds/set4_tiles.png');

        // Preload sounds
        SoundManager.getInstance().preloadSounds(this);

        // Obstacles
        this.load.image('hindernis', assetRoot + '/Other/spikesLow.png');
        this.load.image('water_top', assetRoot + '/Other/fluidBlue_top.png');
        this.load.image('water_fill', assetRoot + '/Other/fluidBlue.png');

        // Fence parts
        this.load.image('fence', assetRoot + '/Other/fence.png');
        this.load.image('fenceBroken', assetRoot + '/Other/fenceBroken.png');
        this.load.image('fenceLeft', assetRoot + '/Other/fenceLeft.png');
        this.load.image('fenceMid', assetRoot + '/Other/fenceMid.png');
        this.load.image('fenceOpen', assetRoot + '/Other/fenceOpen.png');
        this.load.image('fenceRight', assetRoot + '/Other/fenceRight.png');

        // Plants
        this.load.image('plant', assetRoot + '/Other/plantGreen_4.png');
    }

    create() {
        const { width, height } = this.scale;

        this.add
            .sprite(width / 2, height / 2, 'bg2_solid')
            .setDisplaySize(width, height)
            .setDepth(-100)
            .setScrollFactor(0);
        this.add
            .sprite(width / 2, height / 2, 'bg2_tiles')
            .setDisplaySize(width, height)
            .setDepth(-100)
            .setScrollFactor(0);

        // Initialize sounds
        SoundManager.getInstance().addSounds(this);
        this.add
            .sprite(width / 2, height / 2, 'bg2_solid')
            .setDisplaySize(width, height)
            .setDepth(-100)
            .setScrollFactor(0);
        this.add
            .sprite(width / 2, height / 2, 'bg2_tiles')
            .setDisplaySize(width, height)
            .setDepth(-100)
            .setScrollFactor(0);
    }
}
