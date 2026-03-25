import Phaser from 'phaser';

export default class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Progress bar
    const bar = this.add.rectangle(480, 270, 0, 8, 0x8a7a5a);
    const track = this.add.rectangle(480, 270, 400, 8, 0x2a2010);

    this.load.on('progress', (value) => {
      bar.width = 400 * value;
    });

    // Background
    this.load.image('background', 'assets/backgrounds/background.jpeg');

    // Parallax layers (uncomment when split layers are delivered)
    // this.load.image('bg-sky', 'assets/backgrounds/bg-sky.png');
    // this.load.image('bg-trees-far', 'assets/backgrounds/bg-trees-far.png');
    // this.load.image('bg-trees-mid', 'assets/backgrounds/bg-trees-mid.png');
    // this.load.image('bg-ground', 'assets/backgrounds/bg-ground.png');

    // Character sprite sheet
    // this.load.spritesheet('tomte', 'assets/sprites/tomte.png', {
    //   frameWidth: 48,
    //   frameHeight: 64,
    // });

    // Interactive objects
    // this.load.spritesheet('stone',   'assets/sprites/stone.png',   { frameWidth: 64, frameHeight: 64 });
    // this.load.spritesheet('troll',   'assets/sprites/troll.png',   { frameWidth: 96, frameHeight: 80 });
    // this.load.spritesheet('lily',    'assets/sprites/lily.png',    { frameWidth: 64, frameHeight: 48 });
    // this.load.spritesheet('lantern', 'assets/sprites/lantern.png', { frameWidth: 48, frameHeight: 64 });
    // this.load.spritesheet('owl',     'assets/sprites/owl.png',     { frameWidth: 64, frameHeight: 64 });

    // Audio stems (decoded via AudioManager before scene start)
    // Stems are loaded manually in AudioManager using fetch + decodeAudioData
    // to guarantee all buffers are ready before any source starts.

    // SFX
    // this.load.audio('sfx-stone',   ['assets/audio/sfx/sfx-stone.ogg',   'assets/audio/sfx/sfx-stone.mp3']);
    // this.load.audio('sfx-troll',   ['assets/audio/sfx/sfx-troll.ogg',   'assets/audio/sfx/sfx-troll.mp3']);
    // this.load.audio('sfx-lily',    ['assets/audio/sfx/sfx-lily.ogg',    'assets/audio/sfx/sfx-lily.mp3']);
    // this.load.audio('sfx-lantern', ['assets/audio/sfx/sfx-lantern.ogg', 'assets/audio/sfx/sfx-lantern.mp3']);
    // this.load.audio('sfx-owl',     ['assets/audio/sfx/sfx-owl.ogg',     'assets/audio/sfx/sfx-owl.mp3']);

    // Ambient loop
    // this.load.audio('ambient', ['assets/audio/ambient.ogg', 'assets/audio/ambient.mp3']);
  }

  create() {
    this.scene.start('GameScene');
  }
}
