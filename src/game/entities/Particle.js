export class Particle {
  constructor(game, x, y, color) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.color = color || 'red';
    
    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * game.canvas.width * 0.1; 
    this.speedX = Math.cos(angle) * speed;
    this.speedY = Math.sin(angle) * speed;

    this.size = Math.random() * 5 + 2;
    this.life = 1.0; // 1 second life
    this.markedForDeletion = false;
  }

  update(dtSec) {
    this.x += this.speedX * dtSec;
    this.y += this.speedY * dtSec;
    this.size *= 0.95; // Shrink
    this.life -= dtSec;

    if (this.life <= 0 || this.size < 0.5) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
