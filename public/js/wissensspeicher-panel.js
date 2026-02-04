/**
 * WissensspeicherPanel - Manages the knowledge base panel overlay
 */
class WissensspeicherPanel {
    constructor(container = null) {
        this.backdrop = null;
        this.panel = null;
        this.iframe = null;
        this.container = container;
        this.closeHandler = this.handleCloseMessage.bind(this);
    }

    open() {
        if (this.panel) return; // Already open

        this.createBackdrop();
        this.createPanel();
        this.attachEventListeners();
    }

    createBackdrop() {
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'knowledge-backdrop';
        
        // Use absolute if in container, fixed if in body
        const positionClass = this.container ? 'absolute' : 'fixed';
        this.backdrop.className = `${positionClass} inset-0 bg-black/50 z-[1999] animate-fadeIn`;
        
        (this.container || document.body).appendChild(this.backdrop);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'knowledge-panel-overlay';
        
        const positionClass = this.container ? 'absolute' : 'fixed';
        this.panel.className = `${positionClass} right-0 top-0 w-[600px] h-full z-[2000] shadow-[-4px_0_20px_rgba(0,0,0,0.3)] animate-slideIn`;

        this.iframe = document.createElement('iframe');
        this.iframe.src = '/wissensspeicher.html';
        this.iframe.className = 'w-full h-full border-none bg-[#1a1a1a]';

        this.panel.appendChild(this.iframe);
        (this.container || document.body).appendChild(this.panel);
    }

    attachEventListeners() {
        // Click outside to close
        this.backdrop.addEventListener('click', () => this.close());

        // Listen for close message from iframe
        window.addEventListener('message', this.closeHandler);
    }

    handleCloseMessage(event) {
        if (event.data === 'closePanel') {
            this.close();
        }
    }

    close() {
        if (!this.panel) return;

        // Animate out
        this.backdrop.classList.add('animate-fadeOut');
        this.panel.classList.remove('animate-slideIn');
        this.panel.classList.add('animate-slideOut');

        // Remove after animation
        setTimeout(() => {
            this.backdrop?.remove();
            this.panel?.remove();
            window.removeEventListener('message', this.closeHandler);

            // Reset references
            this.backdrop = null;
            this.panel = null;
            this.iframe = null;
        }, 300);
    }
}

// Export for use in other scripts
window.WissensspeicherPanel = WissensspeicherPanel;
