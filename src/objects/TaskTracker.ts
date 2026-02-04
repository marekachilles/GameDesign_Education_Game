import Phaser from 'phaser';

/**
 * Task item for checklist-style tracking
 */
export interface ChecklistTask {
    id: string;
    label: string;
    completed: boolean;
}

/**
 * Configuration for TaskTracker
 */
export interface TaskTrackerConfig {
    type: 'checklist' | 'counter';
    x: number;
    y: number;
    title?: string;

    // For checklist type
    tasks?: ChecklistTask[];

    // For counter type
    current?: number;
    total?: number;
    counterLabel?: string;

    // Styling
    fontSize?: string;
    secondaryFontSize?: string;
    titleColor?: string;
    taskColor?: string;
    completedColor?: string;
    fontFamily?: string;
}

/**
 * TaskTracker - A reusable UI component for tracking task progress
 *
 * Supports two modes:
 * 1. Checklist: Display a list of tasks with checkmarks
 * 2. Counter: Display a simple counter (e.g., "3/5 collected")
 */
export default class TaskTracker extends Phaser.GameObjects.Container {
    private config: TaskTrackerConfig;
    private titleText?: Phaser.GameObjects.Text;
    private taskTexts: Map<string, Phaser.GameObjects.Text> = new Map();
    private counterText?: Phaser.GameObjects.Text;
    private onCompleteCallback?: () => void;

    constructor(scene: Phaser.Scene, config: TaskTrackerConfig) {
        super(scene, config.x, config.y);

        this.config = {
            fontSize: '20px',
            secondaryFontSize: '18px',
            titleColor: '#ffffff',
            taskColor: '#ffffff',
            completedColor: '#00ff00',
            fontFamily: 'monospace',
            ...config
        };

        this.setScrollFactor(0); // Fixed to camera
        this.buildUI();
        scene.add.existing(this);
    }

    /**
     * Build the UI based on the tracker type
     */
    private buildUI(): void {
        if (this.config.type === 'checklist') {
            this.buildChecklistUI();
        } else {
            this.buildCounterUI();
        }
    }

    /**
     * Build checklist-style UI
     */
    private buildChecklistUI(): void {
        let yOffset = 0;

        // Title
        if (this.config.title) {
            this.titleText = this.scene.add
                .text(0, yOffset, this.config.title, {
                    fontSize: this.config.fontSize,
                    color: this.config.titleColor,
                    align: 'right',
                    fontFamily: this.config.fontFamily
                })
                .setOrigin(1, 0);

            this.add(this.titleText);

            // Calculate actual height of title (accounts for multi-line text)
            yOffset += this.titleText.height + 10; // Add 10px spacing
        }

        // Task items
        if (this.config.tasks) {
            this.config.tasks.forEach((task, index) => {
                const taskText = this.scene.add
                    .text(0, yOffset + index * 25, `${task.label} ${task.completed ? '✓' : '?'}`, {
                        fontSize: this.config.secondaryFontSize,
                        color: task.completed ? this.config.completedColor : this.config.taskColor,
                        fontFamily: this.config.fontFamily
                    })
                    .setOrigin(1, 0);

                this.taskTexts.set(task.id, taskText);
                this.add(taskText);
            });
        }
    }

    /**
     * Build counter-style UI
     */
    private buildCounterUI(): void {
        const current = this.config.current ?? 0;
        const total = this.config.total ?? 0;
        const label = this.config.counterLabel ?? 'Progress';

        this.counterText = this.scene.add
            .text(0, 0, `${label}: ${current}/${total}`, {
                fontSize: this.config.fontSize,
                color: this.config.titleColor,
                fontFamily: this.config.fontFamily
            })
            .setOrigin(1, 0);

        this.add(this.counterText);
    }

    /**
     * Mark a checklist task as completed
     */
    public completeTask(taskId: string): void {
        if (this.config.type !== 'checklist' || !this.config.tasks) {
            console.warn('[TaskTracker] completeTask() only works with checklist type');
            return;
        }

        const task = this.config.tasks.find((t) => t.id === taskId);
        if (!task) {
            console.warn(`[TaskTracker] Task '${taskId}' not found`);
            return;
        }

        if (task.completed) {
            return; // Already completed
        }

        task.completed = true;
        const taskText = this.taskTexts.get(taskId);
        if (taskText) {
            taskText.setText(`${task.label} ✓`);
            taskText.setColor(this.config.completedColor!);
        }

        // Check if all tasks are completed
        if (this.areAllTasksCompleted()) {
            this.onCompleteCallback?.();
        }
    }

    /**
     * Update counter value
     */
    public updateCounter(current: number, total?: number): void {
        if (this.config.type !== 'counter') {
            console.warn('[TaskTracker] updateCounter() only works with counter type');
            return;
        }

        this.config.current = current;
        if (total !== undefined) {
            this.config.total = total;
        }

        if (this.counterText) {
            const label = this.config.counterLabel ?? 'Progress';
            this.counterText.setText(`${label}: ${current}/${this.config.total ?? 0}`);

            // Change color when completed
            if (current >= (this.config.total ?? 0)) {
                this.counterText.setColor(this.config.completedColor!);
                this.onCompleteCallback?.();
            }
        }
    }

    /**
     * Check if all checklist tasks are completed
     */
    public areAllTasksCompleted(): boolean {
        if (this.config.type !== 'checklist' || !this.config.tasks) {
            return false;
        }
        return this.config.tasks.every((task) => task.completed);
    }

    /**
     * Check if counter has reached the goal
     */
    public isCounterComplete(): boolean {
        if (this.config.type !== 'counter') {
            return false;
        }
        return (this.config.current ?? 0) >= (this.config.total ?? 0);
    }

    /**
     * Set callback to be called when all tasks are completed
     */
    public onComplete(callback: () => void): void {
        this.onCompleteCallback = callback;
    }

    /**
     * Get current progress (0-1)
     */
    public getProgress(): number {
        if (this.config.type === 'checklist' && this.config.tasks) {
            const completed = this.config.tasks.filter((t) => t.completed).length;
            return completed / this.config.tasks.length;
        } else if (this.config.type === 'counter') {
            const total = this.config.total ?? 1;
            return Math.min((this.config.current ?? 0) / total, 1);
        }
        return 0;
    }

    /**
     * Reset all tasks
     */
    public reset(): void {
        if (this.config.type === 'checklist' && this.config.tasks) {
            this.config.tasks.forEach((task) => {
                task.completed = false;
                const taskText = this.taskTexts.get(task.id);
                if (taskText) {
                    taskText.setText(`${task.label} ?`);
                    taskText.setColor(this.config.taskColor!);
                }
            });
        } else if (this.config.type === 'counter') {
            this.updateCounter(0);
        }
    }
}
