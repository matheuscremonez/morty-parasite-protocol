export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.audio = new Map();
    this.toLoad = 0;
    this.loaded = 0;
  }

  // Load a single image
  loadImage(key, src) {
    this.toLoad++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loaded++;
        this.images.set(key, img);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Error loading image ${src}`);
        reject();
      };
      img.src = src;
    });
  }

  // Load a single audio file
  loadAudio(key, src) {
    this.toLoad++;
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.loaded++;
        this.audio.set(key, audio);
        resolve(audio);
      };
      audio.onerror = () => {
        console.error(`Error loading audio ${src}`);
        reject();
      };
      audio.src = src;
      audio.load();
    });
  }

  // Helper method to retrieve an image
  getImage(key) {
    return this.images.get(key);
  }

  // Helper method to get audio
  getAudio(key) {
    return this.audio.get(key);
  }

  isDone() {
    return this.toLoad === this.loaded;
  }
}
