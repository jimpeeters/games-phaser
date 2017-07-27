// Tutorial: http://www.lessmilk.com/tutorial/flappy-bird-phaser-1

// Create our 'main' state that will contain the game
var mainState = {
    mainComponents: {
        startButton: '',
        previousScore: ''
    },

    inputButtons: {
        spaceKey: '',
    },

    states: {
        previousScore: 0,
        currentScore: 0,
        gameStarted: false,
    },
    preload: function () {
        // This function will be executed at the beginning

        // That's where we load the images and sounds
        // Load the bird sprite
        game.load.image('bird', 'assets/michiel.png');
        game.load.image('pipe', 'assets/fristi.jpg');
        game.load.image('buttonStart', 'assets/button-start.png')
    },

    update: function () {
        // This function is called 60 times per second    
        // It contains the game's logic

        if (this.states.gameStarted) {
            // If the bird is out of the screen (too high or too low)
            // Call the 'restartGame' function
            if (this.bird.y < 0 || this.bird.y > 490) {
                this.restartGame();
            }
            game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        }
    },
    create: function () {
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc. 

        this.states.gameStarted = false;

        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';
        
        console.log(this.states.previousScore);
        if (this.states.previousScore > 0) {
            this.mainComponents.previousScore = game.add.text(20, 20, "Your previous score: " + this.states.previousScore, {
                font: "30px Arial",
                fill: "#ffffff"
            });
        }
        
        this.mainComponents.startButton = game.add.button(game.world.centerX - 112, game.world.centerY - 35, 'buttonStart', this.startgame, this);

        // initialize the keys
        this.inputButtons.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


        this.inputButtons.spaceKey.onDown.remove(this.jump, this);
        this.inputButtons.spaceKey.onDown.add(this.startgame, this);
    },

    startgame: function () {

        if (this.states.previousScore > 0) {
            this.mainComponents.previousScore.kill();
        }
        
        this.mainComponents.startButton.kill();
        
        
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

        this.inputButtons.spaceKey.onDown.remove(this.startgame, this);
        this.inputButtons.spaceKey.onDown.add(this.jump, this);

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
    
    // Restart the game
    restartGame: function () {
        // Start the 'main' state, which restarts the game
        this.states.previousScore = this.states.currentScore;
        game.state.start('main');
    },

    // Make the bird jump 
    jump: function () {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
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
                this.addOnePipe(400, i * 60 + 10);
            }
        }

        this.states.currentScore += 1;
        this.labelScore.text = this.states.currentScore;
    },

};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
