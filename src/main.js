import Game from './game/Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  // Handle resize matching standard display
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const game = new Game(canvas);
  game.init();

  // Basic UI Handling (could be moved to a UIManager later)
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnStoryNext = document.getElementById('btn-story-next');
  const btnStoryStart = document.getElementById('btn-story-start');
  const storyImage = document.getElementById('story-image');
  let storyIndex = 1;

  btnStart.addEventListener('click', (e) => {
    e.target.blur();
    document.getElementById('main-menu').classList.add('hidden');
    
    // Setup first intro screen
    storyIndex = 1;
    storyImage.style.backgroundImage = `url('/images/intro.png')`;
    document.getElementById('story-screen').classList.remove('hidden');
    btnStoryNext.classList.remove('hidden');
    btnStoryStart.classList.add('hidden');
  });

  // Handle window resizing dynamically
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (game) {
       game.resize(canvas.width, canvas.height);
    }
  });

  // Mute button logic
  const btnMute = document.getElementById('btn-mute');
  const iconSoundOn = document.getElementById('icon-sound-on');
  const iconSoundOff = document.getElementById('icon-sound-off');
  let isGlobalMuted = false;

  btnMute.addEventListener('click', () => {
    isGlobalMuted = !isGlobalMuted;
    if (isGlobalMuted) {
      iconSoundOn.classList.add('hidden');
      iconSoundOff.classList.remove('hidden');
    } else {
      iconSoundOn.classList.remove('hidden');
      iconSoundOff.classList.add('hidden');
    }
    if (game) game.setMute(isGlobalMuted);
    btnMute.blur(); // Remove focus to prevent spacebar issues
  });

  btnStoryNext.addEventListener('click', (e) => {
    e.target.blur();
    storyIndex++;
    if (storyIndex === 2) storyImage.style.backgroundImage = `url('/images/intro2.png')`;
    else if (storyIndex === 3) storyImage.style.backgroundImage = `url('/images/intro3.png')`;
    else if (storyIndex === 4) storyImage.style.backgroundImage = `url('/images/intro4.png')`;
    else if (storyIndex === 5) {
      storyImage.style.backgroundImage = `url('/images/intro5.png')`;
      btnStoryNext.classList.add('hidden');
      btnStoryStart.classList.remove('hidden');
    }
  });

  btnStoryStart.addEventListener('click', (e) => {
    e.target.blur();
    document.getElementById('story-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    game.start();
  });

  btnRestart.addEventListener('click', (e) => {
    e.target.blur();
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    game.restart();
  });
});
