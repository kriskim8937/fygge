// InteractionSystem — manages proximity detection and interaction triggers
// for each of the 5 interactable objects in the scene.

const INTERACT_DISTANCE = 80; // pixels

export default class InteractionSystem {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    this.objects = [];   // { sprite, stemIndex, activated, zone }
    this.player = null;
    this.promptText = null;
  }

  setPlayer(player) {
    this.player = player;
  }

  // Register an interactable object
  // sprite      — Phaser GameObject
  // stemIndex   — 0–4, maps to AudioManager stem
  // zone        — string label for debugging
  register(sprite, stemIndex, zone) {
    this.objects.push({ sprite, stemIndex, activated: false, zone });
  }

  setPrompt(textObject) {
    this.promptText = textObject;
  }

  // Call from GameScene.update()
  update(interactJustPressed) {
    if (!this.player) return;

    const px = this.player.x;
    const py = this.player.y;
    let nearObject = null;

    for (const obj of this.objects) {
      if (obj.activated) continue;
      const dx = obj.sprite.x - px;
      const dy = obj.sprite.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < INTERACT_DISTANCE) {
        nearObject = obj;
        break;
      }
    }

    if (this.promptText) {
      this.promptText.setVisible(nearObject !== null);
    }

    if (nearObject && interactJustPressed) {
      this._activate(nearObject);
    }
  }

  // Also call this from pointer-click handler
  tryClickInteract(worldX, worldY) {
    for (const obj of this.objects) {
      if (obj.activated) continue;
      const dx = obj.sprite.x - worldX;
      const dy = obj.sprite.y - worldY;
      if (Math.sqrt(dx * dx + dy * dy) < INTERACT_DISTANCE) {
        this._activate(obj);
        return true;
      }
    }
    return false;
  }

  _activate(obj) {
    obj.activated = true;

    // Play object activation animation if defined
    if (obj.sprite.anims && obj.sprite.anims.exists(`${obj.zone}-activated`)) {
      obj.sprite.play(`${obj.zone}-activated`);
    }

    // Unlock the audio stem
    this.audio.unlockStem(obj.stemIndex);

    // Emit scene event so GameScene can respond (particles, UI update, etc.)
    this.scene.events.emit('stemUnlocked', obj.stemIndex);

    // Check win condition
    if (this.audio.allUnlocked()) {
      this.scene.time.delayedCall(3000, () => {
        this.scene.scene.start('EndScene');
      });
    }
  }

  activatedCount() {
    return this.objects.filter((o) => o.activated).length;
  }
}
