export class InputManager {
  constructor() {
    this.keys = new Map();
    this.previousKeys = new Map();

    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', e => {
      this.keys.set(e.code, false); // Changed to use .set() for consistency with Map
    });

    // Touch Controls
    this.setupTouch('btn-up', 'ArrowUp');
    this.setupTouch('btn-down', 'ArrowDown');
    this.setupTouch('btn-shoot', 'Space');
  }

  setupTouch(btnId, mappedCode) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    // Use touchstart and touchend to simulate key press and release
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevents mouse events from firing alongside touch
      this.keys.set(mappedCode, true);
    });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys.set(mappedCode, false);
    });

    // Also support mouse for testing touch buttons on desktop
    btn.addEventListener('mousedown', () => { this.keys.set(mappedCode, true); });
    btn.addEventListener('mouseup', () => { this.keys.set(mappedCode, false); });
    btn.addEventListener('mouseleave', () => { this.keys.set(mappedCode, false); });
  }

  onKeyDown(e) {
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
    }
    this.keys.set(e.code, true);
  }

  onKeyUp(e) {
    this.keys.set(e.code, false);
  }

  update() {
    // Save current frame's keys to previousKeys for isJustPressed checks
    for (const [key, value] of this.keys) {
      this.previousKeys.set(key, value);
    }
  }

  isKeyDown(code) {
    return this.keys.get(code) === true;
  }

  isJustPressed(code) {
    const isDownNow = this.keys.get(code) === true;
    const wasDownBefore = this.previousKeys.get(code) === true;
    return isDownNow && !wasDownBefore;
  }
}
