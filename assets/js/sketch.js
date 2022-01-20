function setup() {
  frameRate(60);
  createCanvas(400, 400);
  
  gameState = 0;
  score = 0;
  isPlaying = false;
  defaultTimer = 5;
  countdownTimer = null;
  lastObsSpawn = null;
  
  playerX = null;
  playerY = null;
  initPlayerX = 60;
  initPlayerY = 300;;
  
  DEBUG = false;
  
  obSpeed = 0.1;
  isJumping = false;
  doubleJumped = false;
  maxJumpDistance = 120;
  jumpStrength = 20;
  
  
  obstacles = [];
  level = 1;
  
  gravityStrength = 8;
  timeUntilSpawn = null;
  gravity = -9.8;
  
  playerVelocity = 0;
  playerAcceleration = 0;
  playerSize = 30;
  obstacleSize = 30;
  playerHalfSize = playerSize / 2;
  obstacleHalfSize = obstacleSize / 2;
  
  gameStarted = 0;
  isDead = false;
  
  highScores = [];
}

function initGame() {
  keyCode = 0;
  level = 1;
  timeUntilSpawn = int(random(1, 5 - level)) * 1000;
  countdownTimer = defaultTimer;
  score = 0;
  isDead = false;
  obstacles = [];
  playerX = initPlayerX;
  playerY = initPlayerY;
  fill(0);
  textSize(36);
  textStyle(BOLDITALIC);
  textAlign(CENTER, CENTER);
  text('FOMO DOG\nPress Space to Start!', 200, 200);
  if (DEBUG || keyIsDown(32)) {
    gameState++;
  }
}

function drawHUD() {
  if (!isDead) {
    fill(0);
    textSize(26);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text('SCORE: ' + score, 0, 0);
  }

  rectMode(CORNER);
  fill(0);
  rect(0, initPlayerY + 15, width, 100);
}

function countdown() {
  if (DEBUG || countdownTimer === 0) {
    lastObsSpawn = int(millis());
    gameStarted = int(millis());
    isPlaying = true;
  } else {
    fill(0);
    textSize(64);
    textStyle(BOLDITALIC);
    textAlign(CENTER);
    text(countdownTimer, 200, 200);
    if (frameCount % 60 == 0 && countdownTimer > 0) {
      countdownTimer--;
    }
    textSize(18);
    textStyle(ITALIC);
    text("Press SPACE to jump over the obstacles\nAnd press again for a double jump", 200, 250);
  }
}

function keyPressed() {
  if (!isDead && gameState === 1 && keyCode === 32) {
    if (isJumping && !doubleJumped) {
      playerVelocity = 30;
      doubleJumped = true;
      console.log("[SPACE BAR] Double Jump!!");
    }
    if (!isJumping) {
      playerVelocity = 40;
      isJumping = true;
      console.log("[SPACE BAR] Jump!");
    }
  }
}

function drawPlayer() {
  rectMode(CENTER);
  strokeWeight(3);
  if (isDead) {
    fill(255, 0, 0);
  } else {
    fill(255);
  }
  dt = deltaTime / 100;
  if (isJumping) {
    //print("deltaTime: " + dt);
    playerY -= playerVelocity * dt;
    playerVelocity += gravity * dt;
    /*
    if(keyIsDown(32) && !doubleJumped){
      playerVelocity += 10;
      doubledJumped = true;
    }  
    */
    if (playerY >= initPlayerY) {
      playerY = initPlayerY;
      playerVelocity = 0;
      isJumping = false;
      doubleJumped = false;
    }
  }

  rect(playerX, playerY, playerSize);

  /*
  if(keyIsDown(32) && playerY === initPlayerY){
    isJumping = true;
    playerVelocity = 40;
  } 
  */
  /*  
  if(isJumping && playerY >= initPlayerY - maxJumpDistance){
    playerY-= jumpStrength;
  }
  if (!keyIsDown(32) || playerY <= initPlayerY-maxJumpDistance){
    isJumping = false;
  }
  if(playerY <= initPlayerY) {
    playerY +=gravityStrength;
    if(playerY >= initPlayerY) playerY = initPlayerY;
  }
  */
}

function playGame() {
  if (!isPlaying) {
    countdown();
  }
  else {
    if (int(millis()) - gameStarted > 10000) {
      level++;
      gameStarted = int(millis());
    }
    drawHUD();
    drawPlayer();
    spawnObstacles();
    drawObstacles();
    if (isDead) {
      fill(255, 0, 0);
      textAlign(CENTER);
      textSize(48);
      textStyle(BOLDITALIC);
      text("GAME OVER!", 200, 200);
      if (keyIsDown(32)) {
        gameState++;
        console.log("[SPACE BAR] Restart");
      }
    }
    if (detectCollision()) {
      isDead = true;
    }
  }
}

function detectCollision() {
  topOfObstacle = initPlayerY - obstacleHalfSize;
  bottomOfPlayer = playerY + playerHalfSize;
  playerRightSide = playerX + playerHalfSize;
  playerLeftSide = playerX - playerHalfSize;

  //  if(isJumping) {
  //    print("bottomOfPlayer " + bottomOfPlayer + " playerY" + playerY);
  //    print("topOfObstacle " + topOfObstacle);
  //  }
  for (i = 0; i < obstacles.length; i++) {
    obstacleLeftSide = obstacles[i].x - obstacleHalfSize;
    obstacleRightSide = obstacles[i].x + obstacleHalfSize;
    //    if(isJumping) {
    //    print (i + ") " + obstacleLeftSide + " " + obstacleRightSide + " " + playerLeftSide + " " + playerRightSide);
    //    }
    if (obstacleLeftSide <= playerRightSide && obstacleRightSide >= playerLeftSide) {
      // print("Checking height " + bottomOfPlayer + " >=? " + topOfObstacle + "actual center of playerY is " + playerY);
      if (bottomOfPlayer >= topOfObstacle) {
        // print ("XXXXX " + bottomOfPlayer + " " + topOfObstacle);
        // frameRate(0);
        return true;
      }
    }
    else {
      if (obstacleRightSide < playerLeftSide && obstacles[i].scored == false) {
        score++;
        obstacles[i].scored = true;
      }
      // print ("No overlap yet")
      if (obstacleLeftSide >= playerRightSide)
        // this, and all future obstacles in the array are too far away to check
        return false;
    }
  }
}

function drawObstacles() {
  if (isDead) {
    return;
  }
  dt = deltaTime / 100;
  for (i = 0; i < obstacles.length; i++) {
    rectMode(CENTER);
    strokeWeight(3);
    fill(255, 0, 0);
    rect(obstacles[i].x, initPlayerY, obstacleSize);
    obstacles[i].x -= (15 * dt) + obstacles[i].speed;  // faster as the game goes on
  }
  if (obstacles.length && obstacles[0].x < 0) {
    obstacles.splice(0, 1);
  }
}

function spawnObstacles() {
  if (isDead) {
    return;
  }
  if (int(millis() - lastObsSpawn) >= timeUntilSpawn) {
    if (obstacles.length < 8) {
      obstacles.push({ x: 410, scored: false, speed: int(random(max(1, level - 1), min(level * 2, 20))) })
      if (level < 5) {
        timeUntilSpawn = random(1, max(0.1, 2)) * (1000);
      } else if (level < 8) {
        timeUntilSpawn = random(1, max(0.1, 2)) * (800);
      } else if (level < 12) {
        timeUntilSpawn = random(1, max(0.1, 2)) * (720);
      } else {
        timeUntilSpawn = random(1, max(0.1, 2)) * (500 - (level * 2));
      }
      lastObsSpawn = millis();
    }
  }
}

function gameOver() {
  isPlaying = false;
  fill(0);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Your Score: " + score, 200, 100);
  textSize(24);
  text("CLICK TO RESTART", 200, 200);
}

function mouseClicked() {
  if (gameState === 2) {
    gameState = 0;
  }
}

function draw() {
  background(255);
  switch (gameState) {
    case 1:
      playGame();
      break;
    case 2:
      gameOver();
      break;
    default:
      initGame();
  }
}