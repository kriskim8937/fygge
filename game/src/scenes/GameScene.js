import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import InteractionSystem from '../systems/InteractionSystem.js';

const WORLD_WIDTH = 4800;
const GAME_HEIGHT = 540;
const PLAYER_SPEED = 160;
const GROUND_Y = 400;

const ZONES = [
  { key: 'stone',   x: 600,  stemIndex: 0, label: 'Forest Entrance', color: 0x6a5a3a },
  { key: 'troll',   x: 1400, stemIndex: 1, label: 'Root Hollow',     color: 0x3a5a2a },
  { key: 'lily',    x: 2400, stemIndex: 2, label: 'Pond',            color: 0x2a4a5a },
  { key: 'lantern', x: 3200, stemIndex: 3, label: 'Tall Oak',        color: 0x5a4a1a },
  { key: 'owl',     x: 4200, stemIndex: 4, label: 'Deep Clearing',   color: 0x4a2a5a },
];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.audio = new AudioManager();
    this.interaction = null;
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.interactKey = null;
    this.collectedUI = [];
  }

  async create() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);

    this._buildBackground();
    this._buildPlayer();
    this._buildObjects();
    this._buildUI();
    this._buildInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.events.on('stemUnlocked', this._onStemUnlocked, this);

    // Init audio — gracefully skip if no audio files exist yet
    try {
      await this.audio.init();
    } catch (e) {
      console.warn('AudioManager: no stems found, running silent.', e.message);
    }
  }

  update() {
    if (!this.player) return;

    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space);

    this.player.setVelocityX(0);

    if (left) {
      this.player.setVelocityX(-PLAYER_SPEED);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
    }

    this.interaction.update(interactPressed);
  }

  // ---------------------------------------------------------------------------

  _buildBackground() {
    // Layered parallax rectangles — swap with tileSprite PNGs when art arrives
    this.add.rectangle(WORLD_WIDTH / 2, GAME_HEIGHT / 2, WORLD_WIDTH, GAME_HEIGHT, 0x1a1408).setScrollFactor(0.05);
    this.add.rectangle(WORLD_WIDTH / 2, 320, WORLD_WIDTH, 300, 0x1c2010).setScrollFactor(0.2);
    this.add.rectangle(WORLD_WIDTH / 2, 390, WORLD_WIDTH, 200, 0x18200c).setScrollFactor(0.5);
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 70, WORLD_WIDTH, 140, 0x12160a).setScrollFactor(1.0);

    // Ground line
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y, WORLD_WIDTH, 4, 0x2a3015).setScrollFactor(1.0);
  }

  _buildPlayer() {
    // Generate a placeholder tomte texture if the real spritesheet isn't loaded
    if (!this.textures.exists('tomte')) {
      const g = this.make.graphics({ add: false });
      // Body
      g.fillStyle(0x7a6a50);
      g.fillRect(6, 16, 20, 28);
      // Head
      g.fillStyle(0xc8a878);
      g.fillRect(8, 6, 16, 14);
      // Hat (red cap)
      g.fillStyle(0x8a1a1a);
      g.fillRect(6, 2, 20, 8);
      g.generateTexture('tomte', 32, 48);
      g.destroy();
    }

    this.player = this.physics.add.sprite(200, GROUND_Y - 24, 'tomte');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Animations — only if real spritesheet exists
    if (this.textures.get('tomte').frameTotal > 1) {
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('tomte', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1,
      });
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('tomte', { start: 4, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  _buildObjects() {
    this.interaction = new InteractionSystem(this, this.audio);
    this.interaction.setPlayer(this.player);

    ZONES.forEach(({ key, x, stemIndex, label, color }) => {
      // Placeholder shape — replace with spritesheet when art arrives
      const sprite = this.add.rectangle(x, GROUND_Y - 30, 44, 60, color)
        .setStrokeStyle(2, 0xffffff, 0.15)
        .setDepth(5);

      // Zone label (dev only — remove when real art is in)
      this.add.text(x, GROUND_Y - 70, label, {
        fontSize: '11px',
        color: '#a09060',
        alpha: 0.6,
      }).setOrigin(0.5).setDepth(20);

      this.interaction.register(sprite, stemIndex, key);
    });

    // Interaction prompt
    const prompt = this.add.text(480, 460, '[E] or click to interact', {
      fontSize: '13px',
      color: '#d4c090',
    }).setScrollFactor(0).setOrigin(0.5).setVisible(false).setDepth(30);

    this.interaction.setPrompt(prompt);

    this.input.on('pointerdown', (pointer) => {
      this.interaction.tryClickInteract(pointer.worldX, pointer.worldY);
    });
  }

  _buildUI() {
    const slotY = 518;
    const startX = 480 - 2 * 44;

    for (let i = 0; i < 5; i++) {
      this.add.rectangle(startX + i * 44, slotY, 36, 26, 0x0a0c06)
        .setScrollFactor(0).setStrokeStyle(1, 0x4a3a1a).setDepth(30);

      const icon = this.add.rectangle(startX + i * 44, slotY, 28, 18, 0x2a2010)
        .setScrollFactor(0).setAlpha(0).setDepth(31);

      this.collectedUI.push(icon);
    }

    // Stem counter
    this.stemText = this.add.text(16, 510, '0 / 5', {
      fontSize: '13px',
      color: '#5a4a2a',
    }).setScrollFactor(0).setDepth(30);
  }

  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  _onStemUnlocked(stemIndex) {
    // Light up UI slot
    if (this.collectedUI[stemIndex]) {
      this.collectedUI[stemIndex].setFillStyle(0x8a6a30).setAlpha(1);
    }
    this.stemText?.setText(`${this.audio.stemCount()} / 5`);

    // Floating note
    const note = this.add.text(this.player.x, this.player.y - 50, '♪', {
      fontSize: '22px',
      color: '#d4c090',
    }).setDepth(50);

    this.tweens.add({
      targets: note,
      y: note.y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => note.destroy(),
    });
  }
}
