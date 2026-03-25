import { AssetLoader } from './utils/AssetLoader.js';
import { InputManager } from './utils/InputManager.js';
import { Collision } from './utils/Collision.js';
import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { Projectile } from './entities/Projectile.js';
import { Particle } from './entities/Particle.js';

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.ctx.imageSmoothingEnabled = false;

    // Core Managers
    this.assets = new AssetLoader();
    this.input = new InputManager();
    this.audioMuted = false;

    // Game state
    this.state = 'MENU'; // MENU, PLAYING, GAMEOVER
    this.lastTime = 0;
    
    // Entities
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    
    this.enemyTypes = [];
    this.spawnTimer = 0;
    this.spawnInterval = 4.0; // seconds

    this.kills = 0;
    this.lives = 3;
    this.timeSurvived = 0;
  }

  async init() {
    console.log("Initializing Game...");
    
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.remove('hidden');

    try {
      // 1. Load Enemy Data
      const res = await fetch('/enemyData.json');
      const text = await res.text();
      // Clean `var inimigos='[...]';` to just `[...]`
      let cleanJson = text.replace("var inimigos='", "");
      if (cleanJson.endsWith("';")) cleanJson = cleanJson.slice(0, -2);
      if (cleanJson.endsWith("'")) cleanJson = cleanJson.slice(0, -1);
      
      this.enemyTypes = JSON.parse(cleanJson);

      // 2. Queue Assets
      const promises = [
        this.assets.loadImage('bg_sunny', '/images/cenarioSunny.png'),
        this.assets.loadImage('morty', '/images/Morty.png'),
        this.assets.loadImage('projetil0', '/images/projetil0.png'),
        this.assets.loadImage('projetil1', '/images/projetil1.png'),
        this.assets.loadImage('projetil2', '/images/projetil2.png'),
        this.assets.loadImage('projetil3', '/images/projetil3.png'),
        this.assets.loadImage('projetil4', '/images/projetil4.png'),
        this.assets.loadImage('Summer', '/images/Summer.png'),
        this.assets.loadImage('Jaguar', '/images/Jaguar.png'),
        this.assets.loadImage('Wizard', '/images/Wizard.png'),
        this.assets.loadImage('Pickle', '/images/Pickle.png'),
        this.assets.loadAudio('introMusic', '/musics/intro.mp3'),
        this.assets.loadAudio('gameMusic', '/musics/gameMusic.mp3'),
        this.assets.loadAudio('shot', '/musics/shot.mp3'),
        this.assets.loadAudio('pickle_rick', '/musics/pickle_rick.mp3')
      ];

      // Queue enemy images
      for (const type of this.enemyTypes) {
        promises.push(this.assets.loadImage(type.nome, `/images/${type.nome}.png`));
      }

      await Promise.allSettled(promises);
      console.log("Assets loaded.");
      
    } catch(err) {
      console.error("Initialization error: ", err);
    }
    
    loadingScreen.classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    
    // Set up click handlers for character swapping
    document.querySelectorAll('.char-portrait').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.classList.contains('locked')) {
           // Provide visual feedback for selection
           document.querySelectorAll('.char-portrait').forEach(p => p.classList.remove('active'));
           e.target.classList.add('active');

           const charName = e.target.getAttribute('data-char');
           this.player.setCharacter(charName);
           
           if (charName === 'Pickle') {
             const snd = this.assets.getAudio('pickle_rick');
             if (snd && snd.readyState >= 2) {
                 snd.currentTime = 0;
                 snd.play().catch(()=>{});
             }
           }
        }
      });
    });

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  start() {
    this.state = 'PLAYING';
    
    const introMusic = this.assets.getAudio('introMusic');
    if (introMusic) introMusic.pause();
    
    const gameMusic = this.assets.getAudio('gameMusic');
    if (gameMusic) {
      gameMusic.currentTime = 0;
      gameMusic.loop = true;
      gameMusic.play().catch(e => console.log('Audio play blocked:', e));
    }

    // Reset game variables
    this.player = new Player(this);
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.kills = 0;
    this.lives = 3;
    this.timeSurvived = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 4.0;
    
    this.updateHUD();
  }

  restart() {
    this.start();
  }

  loop(timestamp) {
    let deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    this.input.update();

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  update(deltaTime) {
    if (this.state === 'PLAYING') {
      const dtSec = deltaTime / 1000;
      this.timeSurvived += dtSec;

      this.player.update(dtSec, this.input);

      // Update Projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.update(dtSec);
        if (p.markedForDeletion) {
          this.projectiles.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const pt = this.particles[i];
        pt.update(dtSec);
        if (pt.markedForDeletion) {
          this.particles.splice(i, 1);
        }
      }

      // Spawning enemies
      this.spawnTimer += dtSec;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        // Increase difficulty slightly over time
        if (this.spawnInterval > 0.5) this.spawnInterval -= 0.1;
      }

      // Update Enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.update(dtSec);
        
        // Collision: Projectiles vs Enemies
        for (let j = this.projectiles.length - 1; j >= 0; j--) {
          const p = this.projectiles[j];
          if (Collision.checkAABB(p, e)) {
            p.markedForDeletion = true;
            this.projectiles.splice(j, 1);
            e.health--;
            
            // Hit effect
            this.addExplosion(p.x, p.y, '#39FF14', 5);

            if (e.health <= 0) {
              e.markedForDeletion = true;
              this.kills++;
              this.updateHUD();
              this.checkUnlocks();
              // Death effect
              this.addExplosion(e.x + e.width/2, e.y + e.height/2, 'red', 15);
            }
          }
        }

        if (e.markedForDeletion) {
          this.enemies.splice(i, 1);
        }
      }

      document.getElementById('stat-time').innerText = `Tempo: ${Math.floor(this.timeSurvived)}s`;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const bg = this.assets.getImage('bg_sunny');
    if (bg) {
      this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.state === 'PLAYING') {
      // Draw background enemies (just a style choice from old game, we'll draw all normally for now)
      
      this.player.draw(this.ctx);

      for (const p of this.projectiles) {
        p.draw(this.ctx);
      }

      for (const e of this.enemies) {
        e.draw(this.ctx);
      }

      for (const pt of this.particles) {
        pt.draw(this.ctx);
      }
    }
  }

  addExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this, x, y, color));
    }
  }

  spawnEnemy() {
    if (this.enemyTypes.length === 0) return;
    
    const randIndex = Math.floor(Math.random() * this.enemyTypes.length);
    const typeData = this.enemyTypes[randIndex];
    
    // Random Y between 22% and 70% of screen height (strictly on the floor)
    const randY = (Math.random() * 0.48 + 0.22) * this.canvas.height;
    
    // Spawns from the left
    const enemyX = 0;
    
    this.enemies.push(new Enemy(this, enemyX, randY, typeData));
  }

  spawnProjectile(x, y, spriteId) {
    this.projectiles.push(new Projectile(this, x, y, spriteId));
    const shot = this.assets.getAudio('shot');
    if (shot && shot.readyState >= 2) {
       shot.currentTime = 0;
       shot.play().catch(e => {});
    }
  }

  loseLife() {
    this.lives--;
    this.updateHUD();
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  updateHUD() {
    document.getElementById('stat-kills').innerText = `Kills: ${this.kills}`;
    
    // Update lives UI
    const livesContainer = document.getElementById('lives-container');
    livesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const img = document.createElement('img');
        img.src = '/images/vida.svg';
        img.className = 'life-icon';
        if (i >= this.lives) {
            img.classList.add('lost-life');
        }
        
        // Handling missing images by using simple CSS if needed
        img.onerror = () => { img.style.display = 'none'; };
        livesContainer.appendChild(img);
    }
  }

  checkUnlocks() {
    if (this.kills >= 10) document.getElementById('char-Summer').classList.remove('locked');
    if (this.kills >= 30) document.getElementById('char-Jaguar').classList.remove('locked');
    if (this.kills >= 50) document.getElementById('char-Wizard').classList.remove('locked');
    if (this.kills >= 100) document.getElementById('char-Pickle').classList.remove('locked');
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    
    if (this.player) {
      // Recalculate player size/speed based on new height
      this.player.width = this.canvas.width * 0.074;
      this.player.height = this.canvas.height * 0.1816;
      this.player.speed = this.canvas.height * 0.5;
      this.player.x = this.canvas.width * 0.8903; // Reposition to the right edge
      
      // Keep player strictly within bounds during aggressive resizes
      if (this.player.y > this.canvas.height * 0.88) {
         this.player.y = this.canvas.height * 0.88 - this.player.height;
      }
    }

    this.enemies.forEach(e => {
       e.width = this.canvas.width * 0.063;
       e.height = this.canvas.height * 0.14;
    });

    this.projectiles.forEach(p => {
       p.width = this.canvas.width * 0.0121;
       p.height = this.canvas.height * 0.0217;
       p.speed = this.canvas.width * 0.4;
    });
  }

  setMute(muted) {
    this.audioMuted = muted;
    // Iterate over all HTMLAudioElements inside AssetLoader map
    if (this.assets && this.assets.audio) {
       this.assets.audio.forEach(a => {
          a.muted = muted;
       });
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    
    document.getElementById('final-kills').innerText = this.kills;
    document.getElementById('final-time').innerText = `${Math.floor(this.timeSurvived)}s`;

    const gameMusic = this.assets.getAudio('gameMusic');
    if (gameMusic) gameMusic.pause();
  }
}
