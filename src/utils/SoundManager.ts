import Phaser from 'phaser';

/**
 * SoundManager - Singleton class for managing game sound effects
 *
 * Usage:
 * 1. Preload sounds in your scene's preload():
 *    SoundManager.getInstance().preloadSounds(this);
 *
 * 2. Play sounds anywhere in your scene:
 *    SoundManager.getInstance().play('success');
 */
export default class SoundManager {
    private static instance: SoundManager;
    private game: Phaser.Game | null = null;
    private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private soundsPreloaded: boolean = false;

    // Sound configuration
    private soundConfig = {
        success: {
            key: 'success1',
            path: '/src/assets/sounds/success1.mp3',
            volume: 0.7,
            loop: false
        },
        click: {
            key: 'click',
            path: '/src/assets/sounds/click.mp3',
            volume: 0.7,
            loop: false
        },
        walk: {
            key: 'walk',
            path: '/src/assets/sounds/walk.mp3',
            volume: 0.7,
            loop: false
        },
        jump: {
            key: 'jump',
            path: '/src/assets/sounds/jump.mp3',
            volume: 0.7,
            loop: false
        },
        level3_bgm: {
            key: 'level3_bgm',
            path: '/src/assets/sounds/sport-legends-sport-movie-background-music-4492.mp3',
            volume: 0.35,
            loop: true
        },
        level1_2_bgm: {
            key: 'level1_2_bgm',
            path: '/src/assets/sounds/happy-music-happy-vibes-467763.mp3',
            volume: 0.35,
            loop: true
        }
        // Add more sounds here as needed:
        // error: {
        //     key: 'error1',
        //     path: '/src/assets/sounds/error1.mp3',
        //     volume: 0.5,
        //     loop: false
        // }
    };

    private constructor() {}

    /**
     * Get the singleton instance
     */
    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    /**
     * Initialize the sound manager with the game instance
     */
    public init(game: Phaser.Game): void {
        this.game = game;
    }

    /**
     * Preload all sounds in a scene
     * Call this in your scene's preload() method
     */
    public preloadSounds(scene: Phaser.Scene): void {
        if (this.soundsPreloaded) {
            return; // Already preloaded
        }

        Object.values(this.soundConfig).forEach((config) => {
            scene.load.audio(config.key, config.path);
        });

        this.soundsPreloaded = true;
    }

    /**
     * Add sounds to the scene after preloading
     * Call this in your scene's create() method
     */
    public addSounds(scene: Phaser.Scene): void {
        Object.values(this.soundConfig).forEach((config) => {
            // Only add sound if it exists in the cache and hasn't been added yet
            if (scene.cache.audio.exists(config.key) && !this.sounds.has(config.key)) {
                const sound = scene.sound.add(config.key, {
                    volume: config.volume,
                    loop: config.loop
                });
                this.sounds.set(config.key, sound);
            }
        });
    }

    /**
     * Play a sound by name
     * @param soundName - The name of the sound (e.g., 'success')
     * @param volume - Optional volume override (0-1)
     */
    public play(soundName: keyof typeof this.soundConfig, volume?: number): void {
        const config = this.soundConfig[soundName];
        if (!config) {
            console.warn(`[SoundManager] Sound '${soundName}' not found in configuration`);
            return;
        }

        const sound = this.sounds.get(config.key);
        if (sound) {
            if (volume !== undefined) {
                sound.play({ volume });
            } else {
                sound.play();
            }
        } else {
            console.warn(
                `[SoundManager] Sound '${soundName}' (key: '${config.key}') not loaded. ` +
                    `This usually means the sound wasn't preloaded. ` +
                    `Make sure your scene extends BaseScene or manually calls ` +
                    `SoundManager.getInstance().preloadSounds(this) in preload() and ` +
                    `SoundManager.getInstance().addSounds(this) in create().`
            );
        }
    }

    /**
     * Stop a currently playing sound
     */
    public stop(soundName: keyof typeof this.soundConfig): void {
        const config = this.soundConfig[soundName];
        if (!config) {
            return;
        }

        const sound = this.sounds.get(config.key);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    /**
     * Check if a sound is currently playing
     */
    public isPlaying(soundName: keyof typeof this.soundConfig): boolean {
        const config = this.soundConfig[soundName];
        if (!config) {
            return false;
        }

        const sound = this.sounds.get(config.key);
        return !!sound && sound.isPlaying;
    }

    /**
     * Set the volume for a specific sound
     */
    public setVolume(soundName: keyof typeof this.soundConfig, volume: number): void {
        const config = this.soundConfig[soundName];
        if (!config) {
            return;
        }

        const sound = this.sounds.get(config.key);
        if (sound && 'setVolume' in sound) {
            (sound as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(volume);
        }
    }

    /**
     * Set the global volume for all sounds
     */
    public setGlobalVolume(volume: number): void {
        if (this.game) {
            this.game.sound.volume = volume;
        }
    }

    /**
     * Mute/unmute all sounds
     */
    public setMute(muted: boolean): void {
        if (this.game) {
            this.game.sound.mute = muted;
        }
    }

    /**
     * Check if sounds are currently muted
     */
    public isMuted(): boolean {
        return this.game ? this.game.sound.mute : false;
    }

    /**
     * Clean up sounds when a scene is destroyed
     */
    public cleanup(): void {
        this.sounds.forEach((sound) => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
        this.sounds.clear();
        this.soundsPreloaded = false;
    }
}
