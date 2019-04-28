class StartScreen extends MenuScreen {
  constructor() {
    super()
    this.level = null;
    this._loadLevel();
    this.options = [
      {
        name: 'Play the only level',
        onClick: () => this.onPlayClick(),
      }
    ]
  }

  async _loadLevel() {
    this.level = await new Level('test');
  }

  onPlayClick() {
    if (this.level) {
      moveToLevel(this.level);
    }
  }
}
