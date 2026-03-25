import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import InteractionSystem from '../systems/InteractionSystem.js';

const WORLD_WIDTH = 4800;  // wide horizontal scene
const GAME_HEIGHT = 540;
const PLAYER_SPEED = 160;
const GROUND_Y = 420;      // y-position of the ground plane

// Zone definitions — x positions in world space
const ZONES = [
  { key: 'stone',   x: 600,  stemIndex: 0, label: 'Forest Entrance' },
  { key: 'troll',   x: 1400, stemIndex: 1, label: 'Root Hollow'     },
  { key: 'lily',    x: 2400, stemIndex: 2, label: 'Pond'            },
  { key: 'lantern', x: 3200, stemIndex: 3, label: 'Tall Oak'        },
  { key: 'owl',     x: 4200, stemIndex: 4, label: 'Deep Clearing'   },
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
    // Resume AudioContext on first user gesture — this scene starts after
    // the start screen interaction, so we can safely init audio here.
    await this.audio.init();

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT);

    this._buildBackground();
    this._buildPlayer();
    this._buildObjects();
    this._buildUI();
    this._buildInput();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Listen for stem unlock events (for UI update, particles, etc.)
    this.events.on('stemUnlocked', this._onStemUnlocked, this);
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
      if (this.player.anims.currentAnim?.key !== 'walk') {
        this.player.play('walk', true);
      }
    } else if (right) {
      this.player.setVelocityX(PLAYER_SPEED);
      this.player.setFlipX(false);
      if (this.player.anims.currentAnim?.key !== 'walk') {
        this.player.play('walk', true);
      }
    } else {
      if (this.player.anims.currentAnim?.key !== 'idle') {
        this.player.play('idle', true);
      }
    }

    this.interaction.update(interactPressed);
  }

  // -------------------------------------------------------------------------

  _buildBackground() {
    // Placeholder coloured rectangles until art assets arrive.
    // Replace each add.rectangle with add.tileSprite using the real PNG.

    // Sky
    this.add.rectangle(WORLD_WIDTH / 2, GAME_HEIGHT / 2, WORLD_WIDTH, GAME_HEIGHT, 0x1a1408)
      .setScrollFactor(0.1);

    // Distant trees silhouette
    this.add.rectangle(WORLD_WIDTH / 2, 300, WORLD_WIDTH, 200, 0x1e2410)
      .setScrollFactor(0.3);

    // Mid-ground trees
    this.add.rectangle(WORLD_WIDTH / 2, 370, WORLD_WIDTH, 160, 0x1a2008)
      .setScrollFactor(0.6);

    // Ground
    this.add.rectangle(WORLD_WIDTH / 2, GROUND_Y + 60, WORLD_WIDTH, 120, 0x12180a)
      .setScrollFactor(1.0);
  }

  _buildPlayer() {
    // Placeholder rectangle until Tomte sprite sheet arrives
    this.player = this.physics.add.sprite(200, GROUND_Y, 'tomte');
    this.player.setCollideWorldBounds(true);

    // Placeholder: use a plain rectangle if sprite not yet loaded
    if (!this.textures.exists('tomte')) {
      const g = this.add.graphics();
      g.fillStyle(0xc8a060);
      g.fillRect(-12, -28, 24, 56);
      const rt = this.add.renderTexture(0, 0, 24, 56);
      rt.draw(g, 0, 0);
      rt.saveTexture('tomte-placeholder');
      g.destroy();

      this.player = this.physics.add.sprite(200, GROUND_Y, 'tomte-placeholder');
    }

    this.player.setCollideWorldBounds(true);

    // Animations — define only if spritesheet is loaded
    if (this.textures.exists('tomte')) {
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
      this.anims.create({
        key: 'interact',
        frames: this.anims.generateFrameNumbers('tomte', { start: 12, end: 15 }),
        frameRate: 6,
        repeat: 0,
      });
    }
  }

  _buildObjects() {
    this.interaction = new InteractionSystem(this, this.audio);
    this.interaction.setPlayer(this.player);

    ZONES.forEach(({ key, x, stemIndex }) => {
      // Placeholder rectangle until object sprites arrive
      let sprite;
      if (this.textures.exists(key)) {
        sprite = this.add.sprite(x, GROUND_Y - 20, key);
      } else {
        const g = this.add.graphics();
        g.fillStyle(0x4a6030);
        g.fillCircle(24, 24, 24);
        sprite = this.add.graphics();
        sprite.fillStyle(0x4a6030);
        sprite.fillCircle(0, 0, 20);
        sprite.x = x;
        sprite.y = GROUND_Y - 20;
        // Give graphics object a position so InteractionSystem can read it
      }

      this.interaction.register(sprite, stemIndex, key);
    });

    // Interaction prompt text
    const prompt = this.add.text(0, 0, '[E] Interact', {
      fontSize: '14px',
      color: '#d4c090',
      alpha: 0.85,
    }).setScrollFactor(0).setVisible(false).setPosition(420, 480);

    this.interaction.setPrompt(prompt);

    // Pointer click to interact
    this.input.on('pointerdown', (pointer) => {
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      this.interaction.tryClickInteract(worldX, worldY);
    });
  }

  _buildUI() {
    // Collection tray — 5 slots at bottom of screen (fixed to camera)
    const slotY = 510;
    const startX = 960 / 2 - 2 * 44;

    for (let i = 0; i < 5; i++) {
      const slot = this.add.rectangle(startX + i * 44, slotY, 36, 36, 0x1a1408)
        .setScrollFactor(0)
        .setStrokeStyle(1, 0x5a4a2a);

      const icon = this.add.rectangle(startX + i * 44, slotY, 28, 28, 0x2a2010)
        .setScrollFactor(0)
        .setAlpha(0);

      this.collectedUI.push(icon);
    }
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
    // Light up the UI slot
    if (this.collectedUI[stemIndex]) {
      this.collectedUI[stemIndex].setAlpha(1).setFillStyle(0x8a6a30);
    }

    // Floating note particles — placeholder tween until particle atlas is ready
    const cam = this.cameras.main;
    const text = this.add.text(
      this.player.x,
      this.player.y - 40,
      '♪',
      { fontSize: '24px', color: '#d4c090' }
    );
    this.tweens.add({
      targets: text,
      y: text.y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Sine.easeOut',
      onComplete: () => text.destroy(),
    });
  }
}
