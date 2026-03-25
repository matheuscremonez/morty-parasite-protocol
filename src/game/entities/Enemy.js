export class Enemy {
  constructor(game, x, y, typeData) {
    this.game = game;
    this.type = typeData.nome;
    this.health = typeData.vida || 1;
    this.maxHealth = this.health;
    
    this.width = game.canvas.width * 0.074;
    this.height = game.canvas.height * 0.1816;
    this.x = x || 0;
    this.y = y;
    
    this.speed = game.canvas.width * 0.1; // pixels per second
    this.image = game.assets.getImage(this.type);
    
    // Sprite animation
    this.frameX = 0;
    this.maxFrame = 3; // Typically 4 frames for enemies
    this.frameTimer = 0;
    this.frameInterval = 0.15; // 150ms per frame
    
    this.markedForDeletion = false;
  }

  update(dtSec) {
    this.x += this.speed * dtSec; // Move right towards player

    // Check if reached player
    if (this.x > this.game.canvas.width * 0.8903) { 
        this.markedForDeletion = true;
        this.game.loseLife();
    }

    this.frameTimer += dtSec;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.frameX = 0;
      }
    }
  }

  draw(ctx) {
    if (this.image) {
      // Draw simple drop shadow to ground the enemy
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, this.width / 2.5, this.height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      const sWidth = 79;
      const sHeight = 109;
      
      ctx.drawImage(
        this.image,
        this.frameX * sWidth, 0,
        sWidth, sHeight,
        this.x, this.y,
        this.width, this.height
      );

      // Draw health bar if needed
      if (this.maxHealth > 1) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 10, this.width, 5);
        ctx.fillStyle = 'green';
        const healthRatio = this.health / this.maxHealth;
        ctx.fillRect(this.x, this.y - 10, this.width * healthRatio, 5);
      }

    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
