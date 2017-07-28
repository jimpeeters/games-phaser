// Tutorial: http://www.lessmilk.com/tutorial/flappy-bird-phaser-1

// Create our 'main' state that will contain the game
var startText, bar;
var screenWidth = 400;
var screenHeight = 490;

var mainState = {
    mainComponents: {
        previousScore: '',
        jumpSound: '',
        deathSound: '',
        wtfSound: '',
    },

    inputButtons: {
        spaceKey: '',
        onTap: '',
    },

    states: {
        previousScore: 0,
        currentScore: 0,
        gameStarted: false,
        isDeath: false,
    },
    preload: function () {
        // This function will be executed at the beginning

        // That's where we load the images and sounds
        // Load the bird sprite
        game.load.image('bird', 'assets/michiel.png');
        game.load.image('pipe', 'assets/fristi.jpg');
        game.load.image('buttonStart', 'assets/button-start.png');
        game.load.image('fullScreenIcon', 'assets/fullscreen-icon.png');
        game.load.audio('jump', 'assets/jump.wav');
        game.load.audio('death', 'assets/dood.wav');
        game.load.audio('wtf', 'assets/WTF.wav');
    },

    update: function () {
        // This function is called 60 times per second    
        // It contains the game's logic

        if (this.states.gameStarted) {
            // If the bird is out of the screen (too high or too low)
            // Call the 'restartGame' function
            if (this.bird.y < 0 || this.bird.y > screenHeight) {
                if (!this.states.isDeath) {
                    this.mainComponents.wtfSound.play();
                }
                this.restartGame();
            }
            //game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
            game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);  
            
            if (this.bird.angle < 20) {
                 this.bird.angle += 1; 
            }
               
        }
    },
    create: function () {
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc. 
        
        this.mainComponents.jumpSound = game.add.audio('jump', 0.3);
        this.mainComponents.deathSound = game.add.audio('death');
        this.mainComponents.wtfSound = game.add.audio('wtf');

        this.states.gameStarted = false;
        this.states.isDeath = false;

        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';

        if (this.states.previousScore > 0) {
            this.mainComponents.previousScore = game.add.text(20, 20, "Vorige score: " + this.states.previousScore, {
                font: "30px Arial",
                fill: "#ffffff"
            });
        }
        
        this.toggleBeginText(true);
        
        // FullscreenButton
        game.add.button(game.world.width - 90 - 5, 5, 'fullScreenIcon', this.toggleFullscreen, this);

        // initialize the keys
        this.inputButtons.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.inputButtons.onTap = game.input.onTap;


        this.inputButtons.onTap.remove(this.jump, this);
        this.inputButtons.onTap.add(this.startgame, this);
        this.inputButtons.spaceKey.onDown.remove(this.jump, this);
        this.inputButtons.spaceKey.onDown.add(this.startgame, this);
    },
    
    toggleBeginText: function(toggleOn) {
        if(toggleOn) {
            bar = game.add.graphics();
            bar.beginFill(0x000000, 0.2);
            bar.drawRect(0, 100, screenHeight, 100);

            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

            //  The Text is positioned at 0, 100
            startText = game.add.text(0, 0, "Tap to start", style);
            startText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

            startText.setTextBounds(0, 100, screenHeight - 100, 100);
        } else {
            startText.kill();
            bar.kill();
        }
    },

    startgame: function () {
        
        this.toggleBeginText(false);

        if (this.states.previousScore > 0) {
            this.mainComponents.previousScore.kill();
        }
        
        
        this.states.previousScore = 0;
        

        this.states.gameStarted = true;

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);



        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird');

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;
        
        this.bird.anchor.setTo(-0.2, 0.5); 

        this.inputButtons.spaceKey.onDown.remove(this.startgame, this);
        this.inputButtons.spaceKey.onDown.add(this.jump, this);
        this.inputButtons.onTap.remove(this.startgame, this);
        this.inputButtons.onTap.add(this.jump, this);

        // Create an empty group
        this.pipes = game.add.group();

        // Every 1.5 seconds create group of pipes going left
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // Score text
        this.states.currentScore = 0;
        this.labelScore = game.add.text(20, 20, this.states.currentScore, {
            font: "30px Arial",
            fill: "#ffffff"
        });
    },
    
    toggleFullscreen: function() {
        // Stretch to fill
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.startFullScreen(false);
    },
    
    // Restart the game
    restartGame: function () {
        // Start the 'main' state, which restarts the game
        this.states.previousScore = this.states.currentScore;
        game.state.start('main');
    },

    // Make the bird jump 
    jump: function () {
        
        if (this.bird.alive == false) {
            return;
        }  
        
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        
        // Create an animation on the bird
        var animation = game.add.tween(this.bird);
        // Change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);
        // And start the animation
        animation.start();
        
        this.mainComponents.jumpSound.play(); 
        
        // game.add.tween(this.bird).to({angle: -20}, 100).start(); 
    },
    
    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive == false) {
             return;
        }
        
        if (!this.mainComponents.deathSound.isPlaying) {
          this.mainComponents.deathSound.play();   
        }
           

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
        
        this.states.isDeath = true;
    }, 

    addOnePipe: function (x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe');

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe 
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function () {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1) {
                this.addOnePipe(screenWidth, i * 60 + 10);
            }
        }

        this.states.currentScore += 1;
        this.labelScore.text = this.states.currentScore;
    },

};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(screenWidth, screenHeight);


// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
