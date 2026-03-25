import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import InteractionSystem from '../systems/InteractionSystem.js';

const W = 960;
const H = 540;
const GROUND_Y = 490;
const PLAYER_SPEED = 160;
const JUMP_VELOCITY = -520;
const INTERACT_DIST = 70;

// Platform layout: { x, y, w } — y is top surface
// Jump height with v=-520, g=800 → ~169px max
const PLATFORMS = [
  { x: 480, y: GROUND_Y, w: W },          // ground (full width)
  { x: 130, y: 360,      w: 150 },        // low left
  { x: 320, y: 220,      w: 140 },        // mid left — 140px above P1 ✓
  { x: 510, y: 360,      w: 150 },        // mid right — gap jump from P2
  { x: 700, y: 210,      w: 140 },        // high right — 150px above P3 ✓
  { x: 860, y: 340,      w: 120 },        // far right — step down from P4
];

// Objects sit on top of platforms (index = PLATFORMS index)
const OBJECTS = [
  { platformIdx: 1, stemIndex: 0, key: 'frog',     label: 'Frog',     color: 0x2a5a1a },
  { platformIdx: 2, stemIndex: 1, key: 'obj2',     label: 'TBD',      color: 0x3a3a3a },
  { platformIdx: 3, stemIndex: 2, key: 'mushroom', label: 'Mushroom', color: 0x7a3a5a },
  { platformIdx: 4, stemIndex: 3, key: 'obj4',     label: 'TBD',      color: 0x3a3a3a },
  { platformIdx: 5, stemIndex: 4, key: 'obj5',     label: 'TBD',      color: 0x3a3a3a },
];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.audio = new AudioManager();
    this.interaction = null;
    this.player = null;
    this.platforms = null;
    this.cursors = null;
    this.wasd = null;
    this.interactKey = null;
    this.collectedUI = [];
    this.canJump = false;
  }

  async create() {
    this._generateTextures();
    this._buildBackground();
    this._buildPlatforms();
    this._buildPlayer();
    this._buildObjects();
    this._buildUI();
    this._buildInput();

    this.events.on('stemUnlocked', this._onStemUnlocked, this);

    try {
      await this.audio.init();
    } catch (e) {
      console.warn('AudioManager: running silent —', e.message);
    }
  }

  update() {
    if (!this.player) return;

    const onGround = this.player.body.blocked.down;
    const left  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;
    const jumpPressed  = Phaser.Input.Keyboard.JustDown(this.cursors.up)
                      || Phaser.Input.Keyboard.JustDown(this.cursors.space)
                      || Phaser.Input.Keyboard.JustDown(this.wasd.up);
    const interactPressed = Phaser.Input.Keyboard.JustDown(this.interactKey);

    // Horizontal movement
    this.player.setVelocityX(left ? -PLAYER_SPEED : right ? PLAYER_SPEED : 0);
    if (left)  this.player.setFlipX(true);
    if (right) this.player.setFlipX(false);

    // Jump
    if (jumpPressed && onGround) {
      this.player.setVelocityY(JUMP_VELOCITY);
    }

    this.interaction.update(interactPressed);

    // Parallax — background drifts opposite to player position
    if (this._bg) {
      const t = (this.player.x / W) - 0.5;           // -0.5 … +0.5
      const extra = this._bg.displayWidth - W;        // pixels available to shift
      this._bg.x = W / 2 - t * extra * 0.6;
    }
  }

  // ---------------------------------------------------------------------------

  _generateTextures() {
    // Cloaked Listener — long ears, closed eyes, flowing cape
    if (!this.textures.exists('listener')) {
      const g = this.make.graphics({ add: false });
      // Cape
      g.fillStyle(0x2e3d22);
      g.fillTriangle(6, 22, 26, 22, 20, 50);
      // Body
      g.fillStyle(0x4a4535);
      g.fillRoundedRect(9, 20, 14, 22, 4);
      // Head
      g.fillStyle(0x7a6e55);
      g.fillCircle(16, 14, 9);
      // Left ear
      g.fillStyle(0x7a6e55);
      g.fillTriangle(9, 10, 12, -6, 15, 10);
      // Right ear
      g.fillTriangle(17, 10, 20, -6, 23, 10);
      // Closed eyes (two small lines)
      g.fillStyle(0x2a2015);
      g.fillRect(11, 13, 4, 2);
      g.fillRect(17, 13, 4, 2);
      g.generateTexture('listener', 32, 52);
      g.destroy();
    }

    // Particle dot for VFX
    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle', 8, 8);
      g.destroy();
    }
  }

  _buildBackground() {
    const bg = this.add.image(W / 2, H / 2, 'background').setDepth(0);
    // Scale to width then add 12% extra so there's room to drift for parallax
    bg.setScale((W / bg.width) * 1.12);
    this._bg = bg;
  }

  _buildPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    PLATFORMS.forEach(({ x, y, w }, i) => {
      const thickness = i === 0 ? 60 : 16;
      const plat = this.add.rectangle(x, y + thickness / 2, w, thickness, 0x1e2a10)
        .setStrokeStyle(1, 0x3a4a18);
      this.physics.add.existing(plat, true);
      this.platforms.add(plat);

      // Mossy top accent
      this.add.rectangle(x, y, w, 4, 0x2a4a14);
    });
  }

  _buildPlayer() {
    const startX = 60;
    const startY = GROUND_Y - 26;

    this.player = this.physics.add.sprite(startX, startY, 'listener');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);
    this.player.body.setSize(18, 40);
    this.player.body.setOffset(7, 12);

    this.physics.add.collider(this.player, this.platforms);
  }

  _buildObjects() {
    this.interaction = new InteractionSystem(this, this.audio);
    this.interaction.setPlayer(this.player);

    OBJECTS.forEach(({ platformIdx, stemIndex, key, label, color }) => {
      const plat = PLATFORMS[platformIdx];
      const ox = plat.x + Phaser.Math.Between(-20, 20);
      const oy = plat.y - 28;

      // Dormant object — dim placeholder shape
      const sprite = this.add.rectangle(ox, oy, 38, 38, color)
        .setAlpha(0.5)
        .setStrokeStyle(1, 0xffffff, 0.1)
        .setDepth(15);

      // Label (dev only)
      this.add.text(ox, oy - 30, label, {
        fontSize: '10px', color: '#6a5a3a',
      }).setOrigin(0.5).setDepth(25);

      this.interaction.register(sprite, stemIndex, key);
    });

    // Prompt
    const prompt = this.add.text(W / 2, H - 30, '[E] wake it', {
      fontSize: '13px', color: '#c8a850', alpha: 0.9,
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false).setDepth(40);

    this.interaction.setPrompt(prompt);
  }

  _buildUI() {
    const slotY = H - 16;
    const startX = W / 2 - 2 * 44;

    for (let i = 0; i < 5; i++) {
      this.add.rectangle(startX + i * 44, slotY, 36, 20, 0x080c04)
        .setScrollFactor(0).setStrokeStyle(1, 0x3a2a0e).setDepth(40);

      const fill = this.add.rectangle(startX + i * 44, slotY, 28, 12, 0x6a4a18)
        .setScrollFactor(0).setAlpha(0).setDepth(41);

      this.collectedUI.push(fill);
    }

    this.stemText = this.add.text(14, H - 22, '0 / 5', {
      fontSize: '11px', color: '#4a3a18',
    }).setScrollFactor(0).setDepth(40);
  }

  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:    Phaser.Input.Keyboard.KeyCodes.W,
    });
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  _onStemUnlocked(stemIndex) {
    // Brighten UI slot
    if (this.collectedUI[stemIndex]) {
      this.collectedUI[stemIndex].setAlpha(1);
    }
    this.stemText?.setText(`${this.audio.stemCount()} / 5`);

    // Subtle camera shake — intensity grows with each stem found
    const intensity = 0.002 + stemIndex * 0.0008;
    this.cameras.main.shake(350, intensity);

    // Find the object sprite to run VFX on
    const obj = this.interaction.objects.find(o => o.stemIndex === stemIndex);
    if (obj) this._playWakeVFX(obj.sprite, stemIndex);
  }

  _playWakeVFX(sprite, stemIndex) {
    // Brighten the object
    this.tweens.add({
      targets: sprite,
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
    });

    // Expanding ring
    const ring = this.add.circle(sprite.x, sprite.y, 10, 0xd4c080, 0)
      .setStrokeStyle(2, 0xd4c080, 0.8).setDepth(30);

    this.tweens.add({
      targets: ring,
      scaleX: 4, scaleY: 4,
      alpha: 0,
      duration: 700,
      ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });

    // Particle burst
    const colours = [0xd4c080, 0x8aba50, 0xffffff, 0xa0c860];
    for (let i = 0; i < 10; i++) {
      const dot = this.add.circle(
        sprite.x + Phaser.Math.Between(-8, 8),
        sprite.y + Phaser.Math.Between(-8, 8),
        Phaser.Math.Between(2, 5),
        Phaser.Utils.Array.GetRandom(colours)
      ).setDepth(30);

      this.tweens.add({
        targets: dot,
        x: dot.x + Phaser.Math.Between(-40, 40),
        y: dot.y + Phaser.Math.Between(-50, -10),
        alpha: 0,
        duration: Phaser.Math.Between(500, 900),
        ease: 'Sine.easeOut',
        onComplete: () => dot.destroy(),
      });
    }

    // Floating note
    const note = this.add.text(sprite.x, sprite.y - 30, '♪', {
      fontSize: '20px', color: '#d4c080',
    }).setOrigin(0.5).setDepth(35);

    this.tweens.add({
      targets: note,
      y: note.y - 50,
      alpha: 0,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => note.destroy(),
    });
  }
}
