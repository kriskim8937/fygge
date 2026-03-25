import Phaser from 'phaser';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create() {
    const cx = 480;
    const cy = 270;

    // Dark overlay fade-in
    const overlay = this.add.rectangle(cx, cy, 960, 540, 0x080804).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 0.85, duration: 2000 });

    // Title text — replace with illustrated end card when art is ready
    const title = this.add.text(cx, cy - 60, 'The Forest Remembers', {
      fontSize: '32px',
      color: '#d4c090',
      fontStyle: 'italic',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(cx, cy, 'All voices joined.\nThe song is complete.', {
      fontSize: '16px',
      color: '#a09070',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5).setAlpha(0);

    const hint = this.add.text(cx, cy + 100, 'Click anywhere to return', {
      fontSize: '13px',
      color: '#5a4a2a',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title,    alpha: 1, delay: 1500, duration: 2000 });
    this.tweens.add({ targets: subtitle, alpha: 1, delay: 2500, duration: 2000 });
    this.tweens.add({ targets: hint,     alpha: 1, delay: 4000, duration: 1500 });

    // Restart on click
    this.input.once('pointerdown', () => {
      this.scene.start('Preload');
    });
  }
}
