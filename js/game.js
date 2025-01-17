/*
    Winter Run is a 2d platformer game that has the player travel through snowy landscapes and listen sound chilling music
    -Phaser 3 Framework-
    Sources: Codecademy and Youtube Music
    Created by: Mustafa Abdulrahman

*/


class Level extends Phaser.Scene {
  constructor(key) {
    super({key});
    this.levelKey = key
    // the nextLevel key signifies to change scene
    this.nextLevel = {
      'Level1': 'Level2',
      'Level2': 'Level3',
      'Level3': 'Level4',
      'Level4': 'Level5',
      'Level5': 'Level6',
      'Level6': 'Level7',
      'Level7': 'Level8',
      'Level8': 'Credits',
    }
  }

  preload() {
    //loads all the assets for Level class
    this.load.image('platform', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/platform.png');
    this.load.image('snowflake', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/snowflake.png');
    this.load.spritesheet('campfire', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/campfire.png',
      { frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/codey.png', { frameWidth: 72, frameHeight: 90});

    this.load.image('bg1', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/mountain.png');
    this.load.image('bg2', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/trees.png');
    this.load.image('bg3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/snowdunes.png');
    this.load.image('points', '/assets/star.png');
    this.load.audio('theme', '/assets/theme.mp3');
      
    // enemy sprite
    this.load.spritesheet('snowman', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Cave+Crisis/snowman.png', { frameWidth: 50, frameHeight: 70 });
  }

  create() {
      
    gameState.active = true;
      
    gameState.bgColor = this.add.rectangle(0, 0, config.width, config.height, 0x00ffbb).setOrigin(0, 0);
    this.createStars();
    this.createParallaxBackgrounds();
      
    gameState.title = this.add.text( 20, 20, 'Winter Run ', {fill: '#FFFFFF', fontSize: '50px'});
    
    // show score 
    gameState.score = 0;
    // shows score text+ initializes variable
    gameState.scoreText = this.add.text(config.width / 15, config.height * .96, 'Score: 0', { fontSize: '20px', fill: '#000000' });
    gameState.scoreText.setScrollFactor(0);
      
      
    gameState.player = this.physics.add.sprite(125, 110, 'codey').setScale(.5);
    gameState.platforms = this.physics.add.staticGroup();

    this.createAnimations();

    this.createSnow();

    this.levelSetup();

    this.cameras.main.setBounds(0, 0, gameState.bg3.width, gameState.bg3.height);
    this.physics.world.setBounds(0, 0, gameState.width, gameState.bg3.height + gameState.player.height);

    this.cameras.main.startFollow(gameState.player, true, 0.5, 0.5)
    gameState.player.setCollideWorldBounds(true);

    this.physics.add.collider(gameState.player, gameState.platforms);
    this.physics.add.collider(gameState.goal, gameState.platforms);
    
    gameState.cursors = this.input.keyboard.createCursorKeys();
      
      
    this.createPoints();
    this.physics.add.collider(gameState.platforms, gameState.points);
      
    const getPoint = (pl, po) => {
      po.destroy();
      
      gameState.score += 10;
      gameState.scoreText.setText(`Score: ${gameState.score}`);
  }
    
    this.physics.add.overlap(gameState.player, gameState.points, getPoint); 
    //create random x coord, keeep y coord the same
    const xCoord = Math.random() * 640;
    gameState.enemy = this.physics.add.sprite(gameState.goal.x - 75, gameState.goal.y, 'snowman');
      
    this.physics.add.collider(gameState.enemy, gameState.platforms);

    this.anims.create({
      key: 'snowmanAlert',
      frames: this.anims.generateFrameNumbers('snowman', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1
    });

    gameState.enemy.anims.play('snowmanAlert', true);
    gameState.enemy.setCollideWorldBounds(true);
      
    //handles the tween movement for the enemy sprite
    gameState.enemy.move = this.tweens.add({
      targets: gameState.enemy, 
      x: gameState.goal.x - 75,
      ease: 'Linear',
      duration: 1800,
      repeat: -1,
      yoyo: true
      
    });
    
      
    //handles the contact with player and the enemy
    this.physics.add.overlap(gameState.player, gameState.enemy, function() {
      this.cameras.main.shake(240, .01, false, function(camera, progress) {
          if (progress > .9) {
            this.scene.restart(this.levelKey);
          }
        });
    }, null, this);
      
}

    
  createPoints() {
    // THIS WILL COVER THE POINTS(THE STAR GROUP), WHICH WILL ADD TO THE SCORE
    //  Finally some stars to collect
    gameState.points = this.physics.add.group();
    //  We will enable physics for any star that is created in this group
    gameState.points.enableBody = true;
    //  Here we'll create 28 of them evenly spaced apart
    for (var i = 0; i < 28; i++)
    {
        //  Create a star inside of the 'stars' group
        var point = gameState.points.create(i * 70, 0, 'points').setScale(.05);
        //  Let gravity do its thing
        point.body.gravity.y = 300;
        //  This just gives each star a slightly random bounce value
        point.body.bounce.y = 0.7 + Math.random() * 0.2;
        
    }  
  }

    
    
    
  createPlatform(xIndex, yIndex) {
    // Creates a platform evenly spaced along the two indices.
    // If either is not a number it won't make a platform
      if (typeof yIndex === 'number' && typeof xIndex === 'number') {
        gameState.platforms.create((220 * xIndex),  yIndex * 70, 'platform').setOrigin(0, 0.5).refreshBody();
      }
  }

  createSnow() {
    gameState.particles = this.add.particles('snowflake');

    gameState.emitter = gameState.particles.createEmitter({
      x: {min: 0, max: config.width * 2 },
      y: -5,
      lifespan: 2000,
      speedX: { min:-5, max: -200 },
      speedY: { min: 200, max: 400 },
      scale: { start: 0.6, end: 0 },
      quantity: 10,
      blendMode: 'ADD'
    })

    gameState.emitter.setScrollFactor(0);
  }
  //creates all the animations
  createAnimations() {
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('codey', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('codey', { start: 4, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('codey', { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.anims.create({
      key: 'fire',
      frames: this.anims.generateFrameNumbers('campfire'),
      frameRate: 10,
      repeat: -1
    })
  }

  createParallaxBackgrounds() {
    gameState.bg1 = this.add.image(0, 0, 'bg1');
    gameState.bg2 = this.add.image(0, 0, 'bg2');
    gameState.bg3 = this.add.image(0, 0, 'bg3');

    gameState.bg1.setOrigin(0, 0);
    gameState.bg2.setOrigin(0, 0);
    gameState.bg3.setOrigin(0, 0);

    const game_width = parseFloat(gameState.bg3.getBounds().width)
    gameState.width = game_width;
    const window_width = config.width

    const bg1_width = gameState.bg1.getBounds().width
    const bg2_width = gameState.bg2.getBounds().width
    const bg3_width = gameState.bg3.getBounds().width

    gameState.bgColor.setScrollFactor(0);
    gameState.bg1.setScrollFactor((bg1_width - window_width) / (game_width - window_width));
    gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));
  }

  levelSetup() {
    for (const [xIndex, yIndex] of this.heights.entries()) {
      this.createPlatform(xIndex, yIndex);
       
    } 
    
    // Create the campfire at the end of the level
    gameState.goal = this.physics.add.sprite(gameState.width - 40, 100, 'campfire');

    this.physics.add.overlap(gameState.player, gameState.goal, function() {
      this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
        if (progress > .9) {
          this.scene.stop(this.levelKey);
          this.scene.start(this.nextLevel[this.levelKey]);
        }
      });
    }, null, this);

    this.setWeather(this.weather);
  }

  update() {
    if(gameState.active){
      gameState.goal.anims.play('fire', true);
      if (gameState.cursors.right.isDown) {
        gameState.player.flipX = false;
        gameState.player.setVelocityX(gameState.speed);
        gameState.player.anims.play('run', true);
      } else if (gameState.cursors.left.isDown) {
        gameState.player.flipX = true;
        gameState.player.setVelocityX(-gameState.speed);
        gameState.player.anims.play('run', true);
      } else {
        gameState.player.setVelocityX(0);
        gameState.player.anims.play('idle', true);
      }

      if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && gameState.player.body.touching.down) {
        gameState.player.anims.play('jump', true);
        gameState.player.setVelocityY(-500);
      }

      if (!gameState.player.body.touching.down){
        gameState.player.anims.play('jump', true);
      }

      if (gameState.player.y > gameState.bg3.height) {
        this.cameras.main.shake(240, .01, false, function(camera, progress) {
          if (progress > .9) {
            this.scene.restart(this.levelKey);
          }
        });
      }
    }
  }
  createStars() {
    gameState.stars = [];
    function getStarPoints() {
      const color = 0xffffff;
      return {
        x: Math.floor(Math.random() * 900),
        y: Math.floor(Math.random() * config.height * .5),
        radius: Math.floor(Math.random() * 3),
        color,
      }
    }
    for (let i = 0; i < 200; i++) {
      const { x, y, radius, color} = getStarPoints();
      const star = this.add.circle(x, y, radius, color)
      star.setScrollFactor(Math.random() * .1);
      gameState.stars.push(star)
    }
  }

  setWeather(weather) {
    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'snow':  1,
        'wind':  20,
        'bgColor': 0xF8c3aC,
      },

      'afternoon': {
        'color': 0xffffff,
        'snow':  1,
        'wind': 80,
        'bgColor': 0x0571FF,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow':  10,
        'wind': 200,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow':  0,
        'wind': 0,
      },
    }
    let { color, bgColor, snow, wind } = weathers[weather];
    gameState.bg1.setTint(color);
    gameState.bg2.setTint(color);
    gameState.bg3.setTint(color);
    gameState.bgColor.fillColor = bgColor;
    gameState.emitter.setQuantity(snow);
    gameState.emitter.setSpeedX(-wind);
    gameState.player.setTint(color);
    for (let platform of gameState.platforms.getChildren()) {
      platform.setTint(color);
    }
    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }

    return
  }
}

class Level1 extends Level {
  constructor() {
    super('Level1')
    this.heights = [4, 7, 5, null, 5, 4, null, 4, 4];
    this.weather = 'afternoon';
  }
}

class Level2 extends Level {
  constructor() {
    super('Level2')
    this.heights = [5, 4, null, 4, 6, 4, null, 5, 5];
    this.weather = 'twilight';
  }
}

class Level3 extends Level {
  constructor() {
    super('Level3')
    this.heights = [6, null, 6, 4, null, 4, 5, null, 4];
    this.weather = 'night';
  }
}

class Level4 extends Level {
  constructor() {
    super('Level4')
    this.heights = [7, 6, null, 5, 6, 4, null, 5, 4];
    this.weather = 'morning';
  }
}

class Level5 extends Level {
  constructor() {
    super('Level5')
    this.heights = [5, 6, null, 6, null, 4, 5, null, 4];
    this.weather = 'afternoon';
  }
}

class Level6 extends Level {
  constructor() {
    super('Level6')
    this.heights = [3, 4, null, 5, null, 6, null, 4, 5];
    this.weather = 'twilight';
  }
}

class Level7 extends Level {
  constructor() {
    super('Level7')
    this.heights = [5, null, 3, null, 6, 7, null, 5, 3];
    this.weather = 'night';
  }
}

class Level8 extends Level {
  constructor() {
    super('Level8')
    this.heights = [6, 4, null, 6, 3, 6, null, 4, 3];
    this.weather = 'morning';
  }
}

class Credits extends Phaser.Scene {
  constructor() {
    super({ key: 'Credits' })
  }

  preload() {
    this.load.spritesheet('codey_sled', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/codey_sled.png', { frameWidth: 81, frameHeight: 90 });
    this.load.image('bg3', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/snowdunes.png');
  }

  create() {
    gameState.bg3 = this.add.image(0, 0, 'bg3');
    gameState.player = this.add.sprite(config.width / 2, config.height / 2, 'codey_sled');
    this.add.text( config.width * .25, config.height * .36, 'Thank you for Playing', {fill: '#000000', fontSize: '20px'});
    this.add.text( config.width * .28, config.height * .60, 'Reload to play again!', {fill: '#40E0D0', fontSize: '15px'});
    this.anims.create({
      key: 'sled',
      frames: this.anims.generateFrameNumbers('codey_sled'),
      frameRate: 10,
      repeat: -1
    })
    gameState.bg3.angle = 20;
    gameState.player.angle = 20;
  }

  update() {
    gameState.player.anims.play('sled', true);
  }
}


class StartScreen extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScreen' })
  }

  preload() {
    this.load.spritesheet('codey', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/Codey+Tundra/codey.png', { frameWidth: 72, frameHeight: 90})
    this.load.image('titlebg', '/assets/title_screen_bg.jpg');
    this.load.image('playbutton', '/assets/playbutton.png');
    this.load.audio('theme', '/assets/theme.mp3');
  }

  create() {
    gameState.titlebg = this.add.image(0, 3, 'titlebg').setOrigin(0, 0);
    gameState.player = this.add.sprite(config.width / 5, 280, 'codey').setScale(.8);
    gameState.rect = this.add.rectangle(250, 540, 500, 125, 0xaffada);
    gameState.button = this.add.image(config.width * .2, config.height * .62, 'playbutton').setScale(.5);
      
    this.add.text( config.width *.08, config.height *.22, 'Winter Run ', {fill: '#FFFFFF', fontSize: '70px'});
    this.add.text( 50, 530, 'Developed by Mustafa Abdulrahman ©', {fill: '#000000', fontSize: '18px'});
      
    // use gameState to make audio globally accesible
    this.sound.add('theme');
    this.sound.pauseOnBlur = false;
    this.sound.play('theme');
      
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('codey', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
      
    gameState.button.setInteractive();
      
    gameState.button.on('pointerover', function () {

        gameState.button.setTint(0xb2ffff);

    });

    gameState.button.on('pointerout', function () {

        gameState.button.clearTint();

    });
      
    gameState.button.on('pointerdown', () => {
        this.scene.stop('StartScreen');
        this.scene.start('Level1');
        
    });

  }

  update() {
    gameState.player.anims.play('run', true);
  }
}

const gameState = {
  speed: 240,
  ups: 380,
};

const config = {
  type: Phaser.AUTO,
  width: 500,
  height: 600,
  fps: {target: 60},
  backgroundColor: "b9eaff",
  audio: {
      disableWebAudio: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      enableBody: true,
    }
  },
  scene: [StartScreen, Level1, Level2, Level3, Level4, Level5, Level6, Level7, Level8, Credits]
};

const game = new Phaser.Game(config);