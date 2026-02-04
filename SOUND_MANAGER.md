# Sound Manager Documentation

## Overview

The `SoundManager` is a singleton utility class that manages all sound effects in the game. It provides a centralized way to load, play, and control sounds across all scenes.

## Features

- ✅ **Singleton Pattern**: One instance shared across the entire game
- ✅ **Automatic Preloading**: Sounds are preloaded in BaseScene
- ✅ **Easy Playback**: Simple API to play sounds from anywhere
- ✅ **Volume Control**: Per-sound and global volume management
- ✅ **Mute/Unmute**: Toggle all sounds on/off
- ✅ **Type Safety**: TypeScript support with autocomplete

## Current Sounds

| Sound Name | File           | Description                      | Default Volume |
| ---------- | -------------- | -------------------------------- | -------------- |
| `success`  | `success1.mp3` | Plays when user completes a task | 0.7            |

## Usage

### Playing a Sound

The SoundManager is already initialized and sounds are preloaded in `BaseScene`. To play a sound, simply call:

```typescript
import SoundManager from '../utils/SoundManager';

// Play the success sound
SoundManager.getInstance().play('success');

// Play with custom volume (0-1)
SoundManager.getInstance().play('success', 0.5);
```

### Examples

#### 1. Play sound when quiz is completed

```typescript
private finishQuiz() {
    // Play success sound
    SoundManager.getInstance().play('success');

    // ... rest of your code
}
```

#### 2. Play sound when player collects an item

```typescript
this.physics.add.overlap(this.player, this.item, () => {
    SoundManager.getInstance().play('success');
    this.item.destroy();
});
```

#### 3. Play sound on button click

```typescript
button.on('pointerdown', () => {
    SoundManager.getInstance().play('success');
    // Handle button action
});
```

## Adding New Sounds

### Step 1: Add the sound file

Place your sound file in `src/assets/sounds/` directory.

### Step 2: Update SoundManager configuration

Edit `src/utils/SoundManager.ts` and add your sound to the `soundConfig` object:

```typescript
private soundConfig = {
    success: {
        key: 'success1',
        path: '/src/assets/sounds/success1.mp3',
        volume: 0.7,
        loop: false
    },
    // Add your new sound here:
    error: {
        key: 'error1',
        path: '/src/assets/sounds/error.mp3',
        volume: 0.5,
        loop: false
    },
    coin_collect: {
        key: 'coin',
        path: '/src/assets/sounds/coin.mp3',
        volume: 0.6,
        loop: false
    },
    background_music: {
        key: 'bg_music',
        path: '/src/assets/sounds/background.mp3',
        volume: 0.3,
        loop: true  // Loop for background music
    }
};
```

### Step 3: Use your new sound

```typescript
SoundManager.getInstance().play('error');
SoundManager.getInstance().play('background_music');
```

## Advanced Features

### Volume Control

```typescript
// Set volume for a specific sound (0-1)
SoundManager.getInstance().setVolume('success', 0.8);

// Set global volume for all sounds (0-1)
SoundManager.getInstance().setGlobalVolume(0.5);
```

### Mute/Unmute

```typescript
// Mute all sounds
SoundManager.getInstance().setMute(true);

// Unmute all sounds
SoundManager.getInstance().setMute(false);

// Check if muted
const isMuted = SoundManager.getInstance().isMuted();
```

### Stop a Playing Sound

```typescript
// Stop a specific sound
SoundManager.getInstance().stop('background_music');
```

## Implementation Details

### Initialization Flow

1. **main.ts**: Initializes SoundManager with game instance

    ```typescript
    SoundManager.getInstance().init(window.game);
    ```

2. **BaseScene.preload()**: Preloads all sound files

    ```typescript
    SoundManager.getInstance().preloadSounds(this);
    ```

3. **BaseScene.create()**: Adds sounds to the scene

    ```typescript
    SoundManager.getInstance().addSounds(this);
    ```

4. **Any Scene/State**: Play sounds
    ```typescript
    SoundManager.getInstance().play('success');
    ```

### Where Sounds Are Currently Used

- ✅ `MultipleChoiceState.ts` - Plays when quiz is completed
- ✅ `Level1Quiz.ts` - Plays when quiz is finished

## Best Practices

1. **Keep sounds short**: Sound effects should be brief (< 2 seconds)
2. **Use appropriate volumes**: Default to 0.5-0.7 for effects, 0.2-0.4 for music
3. **Loop only music**: Set `loop: true` only for background music
4. **Optimize file size**: Use MP3 format with appropriate bitrate (128-192 kbps)
5. **Test on different devices**: Volume levels may vary across devices

## Troubleshooting

### Sound not playing?

1. Check browser console for errors
2. Verify the sound file exists in `src/assets/sounds/`
3. Ensure the sound is added to `soundConfig` in SoundManager.ts
4. Make sure sounds aren't muted: `SoundManager.getInstance().isMuted()`
5. Check if the scene extends `BaseScene` (or manually preload/add sounds)

### Sound plays multiple times?

Make sure you're not calling `play()` in an `update()` loop. Use event handlers or state changes instead.

### Volume too loud/quiet?

Adjust the default volume in `soundConfig` or use the `volume` parameter when calling `play()`.

## File Structure

```
src/
├── assets/
│   └── sounds/
│       └── success1.mp3          # Sound files
├── utils/
│   └── SoundManager.ts           # Sound manager singleton
├── scenes/
│   ├── BaseScene.ts              # Preloads and initializes sounds
│   └── level-2-whatIsAGame/
│       └── States/
│           └── MultipleChoiceState.ts  # Uses sounds
└── main.ts                       # Initializes SoundManager
```

## Future Enhancements

Consider adding:

- Sound categories (SFX, Music, Voice)
- Fade in/out effects
- Sound pooling for frequently played sounds
- Spatial audio (3D positioning)
- User preferences persistence (save volume settings)
