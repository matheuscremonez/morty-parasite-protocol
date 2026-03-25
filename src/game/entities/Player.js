export class Player {
  constructor(game) {
    this.game = game;
    this.width = game.canvas.width * 0.074;
    this.height = game.canvas.height * 0.1816;
    
    // Starting position (middle of the floor)
    this.x = game.canvas.width * 0.8903;
    this.y = (game.canvas.height * 0.6); 
    
    this.speed = game.canvas.height * 0.5; // pixels per second
    this.image = game.assets.getImage('morty');
    
    // Sprite animation
    this.frameX = 8; // Frame 8 is idle looking left based on old code
    this.frameTimer = 0;
    this.frameInterval = 0.1; // 100ms per frame
    
    this.shootTimer = 0;
    this.fireRate = 0.3; // 300ms cooldown
    this.projectileSprite = 'projetil0';
  }

  setCharacter(name) {
    this.image = this.game.assets.getImage(name);
    if (name === 'Morty') {
      this.speed = this.game.canvas.height * 0.5;
      this.projectileSprite = 'projetil0';
      this.fireRate = 0.3;
    } else if (name === 'Summer') {
      this.speed = this.game.canvas.height * 0.6;
      this.projectileSprite = 'projetil1';
      this.fireRate = 0.28;
    } else if (name === 'Jaguar') {
      this.speed = this.game.canvas.height * 0.7;
      this.projectileSprite = 'projetil2';
      this.fireRate = 0.25;
    } else if (name === 'Wizard') {
      this.speed = this.game.canvas.height * 0.6;
      this.projectileSprite = 'projetil3';
      this.fireRate = 0.2;
    } else if (name === 'Pickle') {
      this.speed = this.game.canvas.height * 0.8;
      this.projectileSprite = 'projetil4';
      this.fireRate = 0.15;
    }
  }

  update(dtSec, input) {
    this.shootTimer += dtSec;

    let isMoving = false;

    // Boundary restricted to floor area (~22% from top, ~88% at bottom)
    if (input.isKeyDown('ArrowUp') && this.y > this.game.canvas.height * 0.22) {
      this.y -= this.speed * dtSec;
      isMoving = true;
      
      this.frameTimer += dtSec;
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0;
        this.frameX--;
        if (this.frameX < 5 || this.frameX > 7) {
          this.frameX = 7;
        }
      }
    } else if (input.isKeyDown('ArrowDown') && this.y + this.height < this.game.canvas.height * 0.88) {
      this.y += this.speed * dtSec;
      isMoving = true;
      
      this.frameTimer += dtSec;
      if (this.frameTimer > this.frameInterval) {
        this.frameTimer = 0;
        this.frameX++;
        if (this.frameX > 3 || this.frameX < 0) {
          this.frameX = 0;
        }
      }
    }

    if (!isMoving) {
      this.frameX = 8; // Idle frame looking at parasites
    }

    if (input.isKeyDown('Space') && this.shootTimer > this.fireRate) {
      this.shoot();
      this.shootTimer = 0;
    }
  }

  shoot() {
    this.game.spawnProjectile(this.x, this.y + this.height * 0.3, this.projectileSprite);
  }

  draw(ctx) {
    if (!this.image) return;
    
    // Draw simple drop shadow to ground the character
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height - 5, this.width / 2.5, this.height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Source dimensions (79x109 per frame based on legacy code)
    const sWidth = 79;
    const sHeight = 109;
    
    ctx.drawImage(
      this.image,
      this.frameX * sWidth, 0,
      sWidth, sHeight,
      this.x, this.y,
      this.width, this.height
    );
  }
}
