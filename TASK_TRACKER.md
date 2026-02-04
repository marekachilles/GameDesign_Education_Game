# TaskTracker Component Documentation

## Overview

`TaskTracker` is a reusable UI component for displaying and tracking task progress in Phaser games. It supports two different modes:

1. **Checklist Mode**: Display a list of individual tasks with checkmarks
2. **Counter Mode**: Display a simple progress counter (e.g., "3/5 collected")

## Features

- ✅ Two display modes: checklist and counter
- ✅ Automatic completion detection
- ✅ Customizable styling (colors, fonts, sizes)
- ✅ Callback support for completion events
- ✅ Progress tracking (0-1 scale)
- ✅ Reset functionality

## Usage

### Checklist Mode

Perfect for tasks where users need to complete multiple specific items (e.g., finding control keys).

```typescript
import TaskTracker from '../objects/TaskTracker';

// Create a checklist tracker
const taskTracker = new TaskTracker(this, {
    type: 'checklist',
    x: 100,
    y: 50,
    title: 'Find the control keys:',
    tasks: [
        { id: 'left', label: 'Left  ', completed: false },
        { id: 'right', label: 'Right ', completed: false },
        { id: 'jump', label: 'Jump  ', completed: false }
    ]
});

// Mark tasks as completed
taskTracker.completeTask('left');
taskTracker.completeTask('right');
taskTracker.completeTask('jump');

// Set callback for when all tasks are done
taskTracker.onComplete(() => {
    console.log('All tasks completed!');
    taskTracker.destroy();
});
```

**Example from Level1Part1:**

```typescript
const taskTracker = new TaskTracker(this, {
    type: 'checklist',
    x: width - 100,
    y: 70,
    title: 'Finde die Buchstaben auf deiner Tastatur\nmit denen du dich nach links, rechts,\noben und unten bewegen kannst',
    tasks: [
        { id: 'left', label: 'Links  ', completed: false },
        { id: 'right', label: 'Rechts ', completed: false },
        { id: 'jump', label: 'Springen', completed: false },
        { id: 'duck', label: 'Ducken', completed: false },
        { id: 'run', label: 'Rennen', completed: false }
    ]
});

// In your update or event handler
if (leftKeyPressed) taskTracker.completeTask('left');
if (rightKeyPressed) taskTracker.completeTask('right');
```

### Counter Mode

Perfect for collection tasks where you need to track a simple count (e.g., collecting items).

```typescript
import TaskTracker from '../objects/TaskTracker';

// Create a counter tracker
const taskTracker = new TaskTracker(this, {
    type: 'counter',
    x: width - 20,
    y: 20,
    current: 0,
    total: 5,
    counterLabel: 'Items Collected',
    fontSize: '24px'
});

// Update the counter
taskTracker.updateCounter(1); // Items: 1/5
taskTracker.updateCounter(2); // Items: 2/5
taskTracker.updateCounter(5); // Items: 5/5 (turns green)

// Set callback for completion
taskTracker.onComplete(() => {
    console.log('All items collected!');
});
```

**Example from Level1Part3:**

```typescript
// Create tracker
this.taskTracker = new TaskTracker(this, {
    type: 'counter',
    x: width - 20,
    y: 20,
    current: 0,
    total: 0,
    counterLabel: 'Animationen',
    fontSize: '24px'
});

// Set total after creating collectibles
this.taskTracker.updateCounter(0, this.totalCollectibles);

// Update when collecting items
this.collectedCount++;
this.taskTracker.updateCounter(this.collectedCount);
```

## Configuration Options

### Common Options (Both Modes)

| Option              | Type                       | Default       | Description                               |
| ------------------- | -------------------------- | ------------- | ----------------------------------------- |
| `type`              | `'checklist' \| 'counter'` | **Required**  | The type of tracker                       |
| `x`                 | `number`                   | **Required**  | X position                                |
| `y`                 | `number`                   | **Required**  | Y position                                |
| `fontSize`          | `string`                   | `'20px'`      | Font size for main text                   |
| `secondaryFontSize` | `string`                   | `'18px'`      | Font size for task items (checklist only) |
| `titleColor`        | `string`                   | `'#ffffff'`   | Color for title/main text                 |
| `taskColor`         | `string`                   | `'#ffffff'`   | Color for incomplete tasks                |
| `completedColor`    | `string`                   | `'#00ff00'`   | Color for completed tasks                 |
| `fontFamily`        | `string`                   | `'monospace'` | Font family                               |

### Checklist-Specific Options

| Option  | Type              | Description                                               |
| ------- | ----------------- | --------------------------------------------------------- |
| `title` | `string`          | Optional title text above the checklist                   |
| `tasks` | `ChecklistTask[]` | Array of task objects with `id`, `label`, and `completed` |

### Counter-Specific Options

| Option         | Type     | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `current`      | `number` | Current progress value                     |
| `total`        | `number` | Total/goal value                           |
| `counterLabel` | `string` | Label to display (e.g., "Items Collected") |

## API Methods

### Checklist Mode

#### `completeTask(taskId: string): void`

Mark a specific task as completed.

```typescript
taskTracker.completeTask('jump');
```

#### `areAllTasksCompleted(): boolean`

Check if all tasks in the checklist are completed.

```typescript
if (taskTracker.areAllTasksCompleted()) {
    console.log('All done!');
}
```

### Counter Mode

#### `updateCounter(current: number, total?: number): void`

Update the counter value. Optionally update the total as well.

```typescript
// Update current only
taskTracker.updateCounter(3);

// Update both current and total
taskTracker.updateCounter(0, 10);
```

#### `isCounterComplete(): boolean`

Check if the counter has reached the goal.

```typescript
if (taskTracker.isCounterComplete()) {
    console.log('Goal reached!');
}
```

### Common Methods

#### `onComplete(callback: () => void): void`

Set a callback to be called when all tasks are completed.

```typescript
taskTracker.onComplete(() => {
    console.log('Completed!');
    this.scene.start('NextLevel');
});
```

#### `getProgress(): number`

Get the current progress as a value between 0 and 1.

```typescript
const progress = taskTracker.getProgress(); // 0.6 = 60% complete
```

#### `reset(): void`

Reset all tasks to incomplete state.

```typescript
taskTracker.reset();
```

#### `destroy(): void`

Remove the tracker from the scene (inherited from Phaser.GameObjects.Container).

```typescript
taskTracker.destroy();
```

## Styling Examples

### Custom Colors

```typescript
const taskTracker = new TaskTracker(this, {
    type: 'checklist',
    x: 100,
    y: 50,
    tasks: [...],
    titleColor: '#ffff00',      // Yellow title
    taskColor: '#cccccc',        // Gray for incomplete
    completedColor: '#00ff00'    // Green for completed
});
```

### Custom Fonts

```typescript
const taskTracker = new TaskTracker(this, {
    type: 'counter',
    x: 100,
    y: 50,
    current: 0,
    total: 10,
    counterLabel: 'Score',
    fontSize: '32px',
    fontFamily: 'Arial'
});
```

## Complete Example: Collection Game

```typescript
export default class CollectionLevel extends Phaser.Scene {
    private taskTracker!: TaskTracker;
    private itemsCollected: number = 0;
    private totalItems: number = 10;

    create() {
        const { width } = this.scale;

        // Create counter tracker
        this.taskTracker = new TaskTracker(this, {
            type: 'counter',
            x: width - 20,
            y: 20,
            current: 0,
            total: this.totalItems,
            counterLabel: 'Gems',
            fontSize: '28px',
            completedColor: '#ffd700' // Gold color
        });

        // Set completion callback
        this.taskTracker.onComplete(() => {
            this.physics.pause();
            this.showVictoryScreen();
        });

        // Create collectible items
        this.createCollectibles();
    }

    private collectItem() {
        this.itemsCollected++;
        this.taskTracker.updateCounter(this.itemsCollected);

        // Play sound effect
        this.sound.play('collect');
    }
}
```

## Best Practices

1. **Position carefully**: Use `setScrollFactor(0)` is automatically applied, so the tracker stays fixed to the camera
2. **Clean up**: Always call `destroy()` when transitioning scenes or when the tracker is no longer needed
3. **Use callbacks**: Set `onComplete()` callbacks for automatic handling of completion events
4. **Update totals early**: For counter mode, set the total count as soon as you know it
5. **Consistent IDs**: Use descriptive, consistent IDs for checklist tasks

## Migration Guide

### From Manual Text to TaskTracker

**Before:**

```typescript
// Manual counter
private collectedText!: Phaser.GameObjects.Text;

create() {
    this.collectedText = this.add.text(100, 20, 'Items: 0/5', {
        fontSize: '24px',
        color: '#ffffff'
    });
}

updateCounter() {
    this.collectedText.setText(`Items: ${this.count}/${this.total}`);
    if (this.count >= this.total) {
        this.collectedText.setColor('#00ff00');
    }
}
```

**After:**

```typescript
// TaskTracker
private taskTracker!: TaskTracker;

create() {
    this.taskTracker = new TaskTracker(this, {
        type: 'counter',
        x: 100,
        y: 20,
        current: 0,
        total: 5,
        counterLabel: 'Items'
    });

    this.taskTracker.onComplete(() => {
        console.log('All items collected!');
    });
}

updateCounter() {
    this.taskTracker.updateCounter(this.count);
}
```

## TypeScript Types

```typescript
interface ChecklistTask {
    id: string;
    label: string;
    completed: boolean;
}

interface TaskTrackerConfig {
    type: 'checklist' | 'counter';
    x: number;
    y: number;
    title?: string;
    tasks?: ChecklistTask[];
    current?: number;
    total?: number;
    counterLabel?: string;
    fontSize?: string;
    secondaryFontSize?: string;
    titleColor?: string;
    taskColor?: string;
    completedColor?: string;
    fontFamily?: string;
}
```
