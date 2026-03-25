export class Projectile {
  constructor(game, x, y, spriteId) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = game.canvas.width * 0.0121;
    this.height = game.canvas.height * 0.0217;
    this.speed = game.canvas.width * 0.4; // pixels per second (moving left)
    
    // Temporary fallback image or load from properties
    this.image = game.assets.getImage(spriteId || 'projetil0');
    this.markedForDeletion = false;
  }

  update(dtSec) {
    this.x -= this.speed * dtSec; // Moves left towards enemies

    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = '#39FF14'; // Neon Green
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
