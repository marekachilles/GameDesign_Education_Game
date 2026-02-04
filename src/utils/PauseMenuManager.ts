import Phaser from 'phaser';

export default class PauseMenuManager {
    private static instance: PauseMenuManager;
    private game: Phaser.Game | null = null;
    private currentSceneKey: string | null = null;
    private menuHtml: string = '';
    private domElement: Phaser.GameObjects.DOMElement | null = null;

    // Ensure we type properly if we want to access global WissensspeicherPanel
    private wissensspeicherPanel: any = null;

    private constructor() {
        // Initialize listener immediately
        this.setupGlobalListener();

        // Fetch pause menu HTML
        this.loadMenu();
    }

    private async loadMenu() {
        try {
            const response = await fetch('/pause.html');
            if (response.ok) {
                this.menuHtml = await response.text();
            } else {
                console.error('Failed to load pause menu HTML');
            }
        } catch (error) {
            console.error('Error loading pause menu:', error);
        }
    }

    public static getInstance(): PauseMenuManager {
        if (!PauseMenuManager.instance) {
            PauseMenuManager.instance = new PauseMenuManager();
        }
        return PauseMenuManager.instance;
    }

    public init(game: Phaser.Game) {
        this.game = game;
    }

    private setupGlobalListener() {
        window.addEventListener(
            'keydown',
            (e) => {
                if (e.key === 'Escape') {
                    if (this.isVisible()) {
                        this.resume();
                    } else {
                        this.attemptPause();
                    }
                }
            },
            { capture: true }
        );
    }

    private attemptPause() {
        if (!this.game) {
            console.warn('PauseMenuManager: Game instance not set');
            return;
        }

        const scenes = this.game.scene.getScenes(true);
        const activeScene = scenes.find((s) => s.scene.key !== 'StartScene');

        if (activeScene) {
            this.show(activeScene.scene.key);
        } else {
            console.warn('PauseMenuManager: No active gameplay scene found to pause');
        }
    }

    public show(sceneKey: string) {
        if (!this.game || !this.menuHtml) return;
        if (this.isVisible()) return; // Prevent multiple spawns

        this.currentSceneKey = sceneKey;
        const scene = this.game.scene.getScene(sceneKey);

        if (scene) {
            scene.scene.pause();

            // Create DOM element in the scene centrally
            const { width, height } = scene.scale;
            this.domElement = scene.add.dom(width / 2, height / 2).createFromHTML(this.menuHtml);

            // Ensure proper layering and positioning
            this.domElement.setScrollFactor(0);
            this.domElement.setDepth(2000); // High depth to stay on top

            // The content from createFromHTML might be hidden via class 'hidden' in the HTML string
            // We need to ensure the container itself is visible and the inner content is shown.
            // Since we pass the full HTML, the root div might have 'hidden'.
            // Let's find the root element inside the Phaser DOM wrapper and remove hidden if present.
            const root = this.domElement.node.firstElementChild as HTMLElement;
            if (root) {
                root.classList.remove('hidden');
            }

            // Attach listeners
            // Note: createFromHTML creates elements but they are not in the main document body directly,
            // they are inside a container managed by Phaser. We can query selectors on the node.
            this.attachListeners(this.domElement.node as HTMLElement);
        }
    }

    private attachListeners(parent: HTMLElement) {
        const resumeBtn = parent.querySelector('#pause-resume-btn');
        const restartBtn = parent.querySelector('#pause-restart-btn');
        const menuBtn = parent.querySelector('#pause-menu-btn');
        const wissensspeicherBtn = parent.querySelector('#pause-wissensspeicher-btn');

        resumeBtn?.addEventListener('click', () => this.resume());
        restartBtn?.addEventListener('click', () => this.restart());
        menuBtn?.addEventListener('click', () => this.toMainMenu());

        if (wissensspeicherBtn) {
            wissensspeicherBtn.addEventListener('click', () => {
                if (!this.wissensspeicherPanel && (window as any).WissensspeicherPanel) {
                    this.wissensspeicherPanel = new (window as any).WissensspeicherPanel(this.domElement?.node);
                }

                if (this.wissensspeicherPanel) {
                    this.wissensspeicherPanel.open();
                } else {
                    console.warn('WissensspeicherPanel not available');
                }
            });
        }
    }

    public hide() {
        if (this.domElement) {
            this.domElement.destroy();
            this.domElement = null;
        }
        // Reset Wissensspeicher reference as its container is gone
        this.wissensspeicherPanel = null;
        this.currentSceneKey = null;
    }

    public isVisible(): boolean {
        return !!this.domElement;
    }

    public resume() {
        if (this.currentSceneKey && this.game) {
            const scene = this.game.scene.getScene(this.currentSceneKey);
            if (scene) {
                scene.scene.resume();
            }
        }
        this.hide();
    }

    public restart() {
        if (this.currentSceneKey && this.game) {
            const scene = this.game.scene.getScene(this.currentSceneKey);
            if (scene) {
                scene.scene.restart();
            }
        }
        this.hide();
    }

    public toMainMenu() {
        if (this.currentSceneKey && this.game) {
            const scene = this.game.scene.getScene(this.currentSceneKey);
            if (scene) {
                scene.scene.stop();
            }
            this.game.scene.start('StartScene');
        }
        this.hide();
    }
}
