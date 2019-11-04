import {
    gameover
} from "./gameover.js";

var player;
var player2;
var star;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var right = false;
var busy = false;
var botao;
var jogar = false;
var background;
var passos = false;
var passosp2 = false;
var x = 160;
var xdiag = 113.137;
var xnegativo = -160;
var xdiagnegativo = -113.137;
var boosttime = 0;
var temposla = 0;

//keyboard
var keyW;
var keyA;
var keyD;
var keyS;
var space;

//jogadores
var player;
var player2;

//mapa
var pilars;
var depth;
var lake;
var platforms;

//tiro
var playerBullets;
var enemyBullets;

//reticula
var reticle;

var main = new Phaser.Scene("Main");

var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,
    
    initialize:
    
    function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'star');
            this.speed = 1;
            this.born = 0;
            this.direction = 0;
            this.xSpeed = 0;
            this.ySpeed = 0;
            this.setSize(30, 30, true);
        },
    
        // Fires a bullet from the player to the reticle
        fire: function (shooter, target)
        {
            this.setPosition(shooter.x, shooter.y); // Initial position
            this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));
    
            // Calculate X and y velocity of bullet to moves it from shooter to target
            if (target.y >= this.y)
            {
                this.xSpeed = this.speed*Math.sin(this.direction);
                this.ySpeed = this.speed*Math.cos(this.direction);
            }
            else
            {
                this.xSpeed = -this.speed*Math.sin(this.direction);
                this.ySpeed = -this.speed*Math.cos(this.direction);
            }
    
            this.rotation = shooter.rotation; // angle bullet with shooters rotation
            this.born = 0; // Time since new bullet spawned
        },
    
        // Updates the position of the bullet each cycle
        update: function (time, delta)
        {
            this.x += this.xSpeed * delta;
            this.y += this.ySpeed * delta;
            this.born += delta;
            if (this.born > 1800)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }
    
    });

main.preload = function () 
{
    this.load.image('mapa', 'assets/mapaaaa.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('groundvertshort','assets/platformvertshort.png');
    this.load.image('groundvert', 'assets/platformvert.png');
    this.load.image('paredegeral', 'assets/mapa1.png');
    this.load.image('groundvertshort2', 'assets/platformvertshort2.png');
    this.load.spritesheet('dude', 'assets/dude2.png', { frameWidth: 17, frameHeight: 20 });
    this.load.image('pilar1', 'assets/pilar1.png');
    this.load.image('pilar2', 'assets/pilar2.png');
    this.load.image('pilar3', 'assets/pilar3.png');
    this.load.image('pilar4', 'assets/pilar4.png');
    this.load.image('pilar', 'assets/pilar.png');
    this.load.image('lake1', 'assets/lake1.png');
    this.load.image('lake2', 'assets/lake2.png');
    this.load.image('lake3', 'assets/lake3.png');
    this.load.image('lake4', 'assets/lake4.png');
    this.load.image('lakea', 'assets/lakea.png');
    this.load.image('lakeb', 'assets/lakeb.png');
    this.load.image('lakec', 'assets/lakec.png');
    this.load.image('click', 'assets/botao.png');
    this.load.image('background', 'assets/background.png');
    this.load.audio('footstep', 'assets/footstep.mp3');
    this.load.audio('music', 'assets/music.mp3');
    this.load.spritesheet("fullscreen", "assets/fullscreen.png", { frameWidth: 64,frameHeight: 64 });
}

main.create = function () 
{

    //  A simple background for our game
    this.add.image(512, 310, 'mapa');
    //limite tela
    this.physics.world.setBounds(0, 0, 1024, 620);

    //controles wasd 
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //tiro
    playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
    enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

    this.input.on('pointerdown', function (pointer, time, lastFired) {
        if (player.active === false)
            return;        
            var bullet = playerBullets.get().setActive(true).setVisible(true);

    if (bullet)
    {
        bullet.fire(player, reticle);
    }
    }, this);

    this.input.on('pointerdown', function () {
        main.input.mouse.requestPointerLock();
    });

    this.input.keyboard.on('keydown_Q', function (event) {
        if (main.input.mouse.locked)
            main.input.mouse.releasePointerLock();
    }, 0, this);


    //retícula
    reticle = this.physics.add.sprite(900, 300, 'bomb');

    this.input.on('pointermove', function (pointer) {
        if (this.input.mouse.locked)
        {
            reticle.x += pointer.movementX;
            reticle.y += pointer.movementY;
        }
    }, this);

    reticle.setCollideWorldBounds(true);

    

    //pilares
    pilars = this.physics.add.staticGroup();
    depth = this.physics.add.staticGroup();

    //lago
    lake = this.physics.add.staticGroup();

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //colisao estrelas
    star = this.physics.add.staticGroup();

    //sprite personagens
    player = this.physics.add.sprite(924, 340, 'dude');
    player.setScale(2);
    player.setSize(11, 18, true);
    player.setOffset(3, 3);

    player2 = this.physics.add.sprite(100, 340, 'dude');
    player2.setScale(2);
    player2.setSize(11, 18, true);
    player2.setOffset(3, 3);

    //  Paredes do mapa, pilares
    platforms.create(713, 40, 'ground');
    platforms.create(310, 40, 'ground');
    platforms.create(310, 610, 'ground');
    platforms.create(713, 610, 'ground');
    platforms.create(-100, 300, 'ground');
    platforms.create(-100, 385, 'ground');
    platforms.create(1124, 300, 'ground');
    platforms.create(1124, 385, 'ground');
    platforms.create(90, 528, 'groundvert');
    platforms.create(934, 528, 'groundvert');
    platforms.create(90, 157, 'groundvert');
    platforms.create(934, 157, 'groundvert');
    platforms.create(-15, 310, 'groundvert');
    platforms.create(1039, 310, 'groundvert');
    depth.create(224, 160, 'pilar1');
    depth.create(800, 161, 'pilar2');
    depth.create(798, 478, 'pilar3');
    depth.create(224, 497, 'pilar4');
    pilars.create(224, 175, 'pilar');
    pilars.create(800, 175, 'pilar');
    pilars.create(798, 493, 'pilar');
    pilars.create(224, 497, 'pilar');
    lake.create(422, 314, 'lake1');
    lake.create(422, 230, 'lake2');
    lake.create(477, 173, 'lake3');
    lake.create(511, 130, 'lake4');
    lake.create(374, 485, 'lakea');
    lake.create(485, 500, 'lakeb');
    lake.create(513, 553, 'lakec');

    //Fullscreen
    var button = this.add
    .image(1030 - 16, 16, "fullscreen", 0)
    .setOrigin(1, 0)
    .setInteractive();

  // Ao clicar no botão de tela cheia
  button.on(
    "pointerup",
    function() {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );
   // Tecla "F" também ativa/desativa tela cheia
  var FKey = this.input.keyboard.addKey("F");
  FKey.on(
    "down",
    function() {
      if (this.scale.isFullscreen) {
        button.setFrame(0);
        this.scale.stopFullscreen();
      } else {
        button.setFrame(1);
        this.scale.startFullscreen();
      }
    },
    this
  );
    //player1 carinha
    this.anims.create({
        key: 'busy',
        frames: this.anims.generateFrameNumbers('dude', {start: 4, end: 6}),
        frameRate: 5,
        repeat: -1
    });
    
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });

    //player 2 mago
    this.anims.create({
        key: 'busy2',
        frames: this.anims.generateFrameNumbers('dude', {start:  7, end: 9}),
        frameRate: 5,
        repeat: -1
    })

    this.anims.create({
        key: 'walk2',
        frames: this.anims.generateFrameNumbers('dude', { start: 10, end: 13}),
        frameRate: 10,
        repeat: -1
    });

    //cursores setinhas
    cursors = this.input.keyboard.createCursorKeys();

    //  Colisões
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, pilars);
    //this.physics.add.collider(star, platforms);
    //this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, lake);
    this.physics.add.collider(player2, lake);
    this.physics.add.collider(player2, platforms);
    this.physics.add.collider(player2, pilars);

    //function collider
    this.physics.add.overlap(player, player2, colisao, null, this);
    this.physics.add.overlap(player2, playerBullets, atingir, null, this);
}

main.update = function () 
{
    if (gameOver)
    {
        return;
    }
    //if (jogar)
    //{
    //    background.disableBody(true, true);
    //}

    //alteração da velocidade de movimentação diagonal.
    if (keyA.isDown && keyW.isDown)
    {
        player.setVelocityX(xdiagnegativo);
        player.setVelocityY(xdiagnegativo);
        player.anims.play('walk', true);
        player.setFlipX(true);
        passos = true;
    }

    else if (keyA.isDown && keyS.isDown)
    {
        player.setVelocityX(xdiagnegativo);
        player.setVelocityY(xdiag);
        player.anims.play('walk', true);
        player.setFlipX(true);
        passos = true;
    }

    else if (keyD.isDown && keyW.isDown)
    {
        player.setVelocityX(xdiag);
        player.setVelocityY(xdiagnegativo);
        player.anims.play('walk', true);
        player.setFlipX(false);
        passos = true;
    }

    else if (keyD.isDown && keyS.isDown)
    {
        player.setVelocityX(xdiag);
        player.setVelocityY(xdiag);
        right = true;
        player.anims.play('walk', true);
        player.setFlipX(false);
        passos = true;
    }    
    // - fim -

    //direções normais
    else if (keyA.isDown)
    {
        player.setVelocityX(xnegativo);
        right = false;
        player.anims.play('walk', true);
        player.setFlipX(true);
        passos = true;
        player.setVelocityY(0);
    }
     else if (keyD.isDown)
    {
        player.setVelocityX(x);
        player.anims.play('walk', true);
        player.setFlipX(false);
        passos = true;
        player.setVelocityY(0);
    }

    else 
    {
        player.setVelocityX(0);
        player.anims.play('busy', true);
    }
    
    if (keyW.isDown)
    {
        player.setVelocityY(xnegativo);
        passos = true;
    }
    
    else if (keyS.isDown)
    {
        player.setVelocityY(x);
        passos = true;
    }

    else 
    {
        //player.setVelocityX(0);
        player.setVelocityY(0);
        passos = false; 
    }
    //fim


    //player 2

    if (cursors.up.isDown && cursors.left.isDown)
    {
        player2.setVelocityX(-113.137);
        player2.setVelocityY(-113.137);
        player2.anims.play('walk2', true);
        player2.setFlipX(true);
        passosp2 = true;
    }
    else if (cursors.up.isDown && cursors.right.isDown)
    {
        player2.setVelocityX(113.137);
        player2.setVelocityY(-113.137);
        player2.anims.play('walk2', true);
        player2.setFlipX(false);
        passosp2 = true;
    }
    else if (cursors.down.isDown && cursors.left.isDown)
    {
        player2.setVelocityX(-113.137);
        player2.setVelocityY(113.137);
        player2.anims.play('walk2', true);
        player2.setFlipX(true);
        passosp2 = true;
    }
    else if (cursors.down.isDown && cursors.right.isDown)
    {
        player2.setVelocityX(113.137);
        player2.setVelocityY(113.137);
        player2.anims.play('walk2', true);
        player2.setFlipX(false);
        passosp2 = true;
    }

    else if (cursors.left.isDown)
   
    {
        player2.setVelocityX(-160);
        right = false;
        player2.anims.play('walk2', true);
        player2.setFlipX(true);
        passosp2 = true;
    }
    else if (cursors.right.isDown)
    {
        player2.setVelocityX(160);
        player2.anims.play('walk2', true);
        player2.setFlipX(false);
        passosp2 = true;
    }
    else 
    {
        player2.setVelocityX(0);
        player2.anims.play('busy2', true);
        passosp2 = false;
    }

    if (cursors.up.isDown)
    {
        player2.setVelocityY(-160);
        passosp2 = true;
    }
    
    else if (cursors.down.isDown)
    {
        player2.setVelocityY(160);
        passosp2 = true;
    }
    else
    {
        player2.setVelocityY(0);
    }   
    //fim

    //boost
    if (space.isDown && boosttime > 100)
    {
        x = 1000;
        xnegativo = -1000;
        xdiag = 601.04;
        xdiagnegativo = -601.04;
        temposla ++;
        if (temposla > 5)
        {
            boosttime = 0;
            temposla = 0;
        }
    }
    
    else
    {
        x = 160;
        xnegativo = -160;
        xdiag = 113.137;
        xdiagnegativo = -113.137;
        boosttime ++;
    }
}

function colisao ()
{
    this.scene.start(gameover);
}

function atingir ()
{
    this.scene.start(gameover);
}

export {
    main
};