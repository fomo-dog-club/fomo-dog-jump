// ============================================
// GAME CONSTANTS
// ============================================
const GAME_STATE = {
  INIT: -1,
  PLAY: 1,
  END: 0
};

const CANVAS = {
  WIDTH: 1280,
  HEIGHT: 600
};

const PHYSICS = {
  GRAVITY: 0.8,
  JUMP_VELOCITY: -12,
  BASE_GROUND_SPEED: -4,
  OBSTACLE_SPEED: -6
};

const SPAWN_RATES = {
  NORMAL: 60,      // Every 60 frames
  MEDIUM: 30,      // After score > 1000
  FAST: 10         // After score > 2000
};

const SCALES = {
  LOGO: 0.8,
  START_BUTTON: 0.35,
  PLAYER: 0.2,
  PET: 0.2,
  OBSTACLE: 0.25,
  RESTART_BUTTON: 0.3,
  RESTART_LOGO: 0.7
};

const POSITIONS = {
  GROUND_Y: 550,
  LOGO_Y: 80,
  SCORE_X: null,   // Set in setup as width - 130
  SCORE_Y: 90,
  START_BUTTON_Y: 320,
  PLAYER_X: null,  // Set in setup as width / 3
  PET_X: null,     // Set in setup as width / 5
  PET_OFFSET_Y: -160,
  RESTART_BUTTON_Y: 440,
  RESTART_LOGO_Y: 240
};

const COLLIDERS = {
  PLAYER: {
    type: "circle",
    offsetX: 0,
    offsetY: 0,
    radius: 250  // Tighter circular collider for the player body
  },
  PET: {
    type: "rectangle",
    offsetX: 60,
    offsetY: 100,
    width: 400,
    height: 420
  },
  METEORITE: {
    type: "circle",
    offsetX: -90,  // Shift center LEFT to match the rock core position
    offsetY: 0,
    radius: 140  // 50% of original - matches just the rock core, not fire trail
  },
  UFO_ALIEN_DOG: {
    alienDog: {
      type: "circle",
      offsetX: 0,
      offsetY: 0,
      radius: 175  // Matches the alien dog body
    },
    ufo: {
      type: "rectangle",
      offsetX: 0,
      offsetY: -40,  // Shift up to cover UFO top part
      width: 620,    // Wide enough to cover UFO horizontal span
      height: 80     // Tall enough to cover UFO vertical span
    }
  }
};

const DEBUG_MODE = false;
const DEBUG_COLOR = [0, 255, 255]; // Cyan color for all debug borders
const DEBUG_STROKE_WEIGHT = 3;     // Thickness for all debug borders

// ============================================
// GAME STATE VARIABLES
// ============================================
let gameState = GAME_STATE.INIT;
let gameStartFrame = 0; // Track when game starts for showing instructions
let score = 0;
let isRestartDelayActive = false;
let petJumpQueue = []; // Queue of frames when pet should jump

// ============================================
// SPRITE REFERENCES
// ============================================
let player;
let pet;
let ground;
let invisibleGround;
let logo;
let startButton;
let restartButton;
let restartLogo;
let obstaclesGroup;

// ============================================
// ASSET REFERENCES - IMAGES
// ============================================
let playerImages = {
  running: null,
  collided: null,
  idle: null
};

let petImages = {
  running: null
};

let obstacleImages = {
  meteorite: null,
  ufoAlienDog: null
};

let uiImages = {
  startButton: null,
  restartButton: null,
  restartLogo: null,
  logo: null
};

let backgroundImages = {
  ground: null
};

// ============================================
// ASSET REFERENCES - SOUNDS
// ============================================
let sounds = {
  jump: null,
  die: null,
  checkpoint: null,
  background: null,
  playGame: null
};

// ============================================
// PRELOAD - Load all assets
// ============================================
function preload() {
  // Load sounds
  sounds.jump = loadSound("assets/music/mario_jump.mp3");
  sounds.die = loadSound("assets/music/mario_die.mp3");
  sounds.checkpoint = loadSound("assets/music/check_point.mp3");
  sounds.background = loadSound("assets/music/fdc_theme.mp3");
  sounds.playGame = loadSound("assets/music/do_you_wanna_play_a_game.mp3");

  // Load player sprites
  playerImages.running = loadImage("assets/img/sprite/cropped_fast.gif");
  playerImages.collided = loadImage("assets/img/sprite/better_luck.gif");
  playerImages.idle = loadImage("assets/img/sprite/cropped_slow.gif");

  // Load pet sprites
  petImages.running = loadImage("assets/img/fomo_bark.gif");

  // Load obstacle sprites
  obstacleImages.meteorite = loadImage("assets/img/obstacles/meteorite.gif");
  obstacleImages.ufoAlienDog = loadImage("assets/img/obstacles/aliendog2.gif");

  // Load UI images
  uiImages.startButton = loadImage("assets/img/start.gif");
  uiImages.restartButton = loadImage("assets/img/sprite/play.gif");
  uiImages.restartLogo = loadImage("assets/img/restartLogo.gif");
  uiImages.logo = loadImage("assets/img/bg/bg_banner.png");

  // Load background images
  backgroundImages.ground = loadImage("assets/img/bg/bg_spacex.png");
}

// ============================================
// SETUP - Initialize game
// ============================================
function setup() {
  const canvas = createCanvas(CANVAS.WIDTH, CANVAS.HEIGHT);
  canvas.parent("canvas-container");

  // Set dynamic positions
  POSITIONS.PLAYER_X = width / 4.5;
  POSITIONS.PET_X = width / 10;
  POSITIONS.SCORE_X = width - 130;

  initializeSprites();

  obstaclesGroup = new Group();
  score = 0;
}

// ============================================
// SPRITE INITIALIZATION
// ============================================
function initializeSprites() {
  initializeGround();
  initializeLogo();
  initializePlayer();
  initializePet();
  initializeUI();
}

function initializeGround() {
  ground = createSprite(width / 2, height / 2, 0, 0);
  ground.addImage("ground", backgroundImages.ground);
  ground.scale = 1;
  ground.debug = DEBUG_MODE;

  invisibleGround = createSprite(width / 2, POSITIONS.GROUND_Y, width, 10);
  invisibleGround.visible = false;
  invisibleGround.debug = DEBUG_MODE;
}

function initializeLogo() {
  logo = createSprite(width / 2 - 30, POSITIONS.LOGO_Y, 0, 0);
  logo.addImage("logo", uiImages.logo);
  logo.scale = SCALES.LOGO;
  logo.debug = DEBUG_MODE;
}

function initializePlayer() {
  player = createSprite(POSITIONS.PLAYER_X, height / 2, 30, 30);
  player.addImage("running", playerImages.running);
  player.addImage("collided", playerImages.collided);
  player.addImage("idle", playerImages.idle);
  player.scale = SCALES.PLAYER;

  // Use circular collider that matches the player body better
  player.setCollider(
    COLLIDERS.PLAYER.type,
    COLLIDERS.PLAYER.offsetX,
    COLLIDERS.PLAYER.offsetY,
    COLLIDERS.PLAYER.radius
  );

  player.visible = false;

  player.debug = DEBUG_MODE;
}

function initializePet() {
  pet = createSprite(POSITIONS.PET_X, height / 2, 30, 30);
  pet.addImage("running", petImages.running);
  pet.scale = SCALES.PET;

  // Set collider for the pet
  pet.setCollider(
    COLLIDERS.PET.type,
    COLLIDERS.PET.offsetX,
    COLLIDERS.PET.offsetY,
    COLLIDERS.PET.width,
    COLLIDERS.PET.height
  );

  pet.visible = false;
  pet.debug = DEBUG_MODE;
}

function initializeUI() {
  startButton = createSprite(width / 2, POSITIONS.START_BUTTON_Y);
  startButton.addImage(uiImages.startButton);
  startButton.scale = SCALES.START_BUTTON;
  startButton.visible = false;

  restartButton = createSprite(width / 2, POSITIONS.RESTART_BUTTON_Y);
  restartButton.addImage(uiImages.restartButton);
  restartButton.scale = SCALES.RESTART_BUTTON;
  restartButton.visible = false;
  restartButton.debug = DEBUG_MODE;

  restartLogo = createSprite(width / 2, POSITIONS.RESTART_LOGO_Y);
  restartLogo.addImage(uiImages.restartLogo);
  restartLogo.scale = SCALES.RESTART_LOGO;
  restartLogo.visible = false;
}

// ============================================
// MAIN GAME LOOP
// ============================================
function draw() {
  clear();

  switch (gameState) {
    case GAME_STATE.INIT:
      handleInitState();
      break;
    case GAME_STATE.PLAY:
      handlePlayState();
      break;
    case GAME_STATE.END:
      handleEndState();
      break;
  }

  drawSprites();
  drawUI();
  updateCursor();
}

// ============================================
// GAME STATE HANDLERS
// ============================================
function handleInitState() {
  startButton.visible = true;

  if (keyDown("space") || mousePressedOver(startButton)) {
    gameState = GAME_STATE.PLAY;
    gameStartFrame = frameCount; // Record when game started
  }
}

function handlePlayState() {
  updatePhysics();
  updateGround();
  updateAudio();
  hideMenuUI();
  updateScore();
  spawnObstacles();
  handlePetBehavior();
  checkCollisions();
  handlePlayerInput();
}

function handleEndState() {
  if (!isRestartDelayActive) {
    isRestartDelayActive = true;
    setTimeout(showRestartUI, 5000);
  }

  player.velocityY = 0;
  player.changeImage("idle", playerImages.idle);

  // Position pet relative to player
  pet.position.x = player.position.x;

  // Check if pet would obstruct the logo (logo is around Y: 80-150)
  const petAboveY = player.position.y + POSITIONS.PET_OFFSET_Y;
  const wouldObstructLogo = petAboveY < 180; // If pet would be too high up

  if (wouldObstructLogo) {
    // Show pet below player instead
    pet.position.y = player.position.y - POSITIONS.PET_OFFSET_Y;
  } else {
    // Show pet above player (normal)
    pet.position.y = petAboveY;
  }

  player.changeImage("collided", playerImages.collided);

  stopObstacles();

  if (mousePressedOver(restartButton) || mousePressedOver(restartLogo)) {
    resetGame();
  }
}

// ============================================
// GAME LOGIC FUNCTIONS
// ============================================
function updatePhysics() {
  player.velocityY += PHYSICS.GRAVITY;
  player.collide(invisibleGround);
  player.visible = true;

  pet.velocityY += PHYSICS.GRAVITY;
  pet.collide(invisibleGround);
  pet.visible = true;
}

function updateGround() {
  if (ground.position.x < 0) {
    ground.position.x = ground.width / 2;
  }
  ground.velocityX = PHYSICS.BASE_GROUND_SPEED + (-3 * score / 100);
}

function updateAudio() {
  if (sounds.playGame.isPlaying()) {
    sounds.playGame.stop();
  }
  if (!sounds.background.isPlaying()) {
    sounds.background.play();
  }
}

function hideMenuUI() {
  startButton.visible = false;
  restartButton.visible = false;
  restartLogo.visible = false;
}

function updateScore() {
  score += Math.round(getFrameRate() / 60);

  if (score > 0 && score % 100 === 0) {
    sounds.checkpoint.play();
  }
}

function handlePetBehavior() {
  // Keep pet at fixed X position (to the left of player)
  pet.position.x = POSITIONS.PET_X;

  // Check if it's time for pet to jump (based on queued jumps)
  if (petJumpQueue.length > 0 && frameCount >= petJumpQueue[0]) {
    // Pet mimics player exactly - can jump mid-air if player did
    pet.velocityY = PHYSICS.JUMP_VELOCITY;
    // console.log('🐕 Pet jumping! Frame:', frameCount);
    petJumpQueue.shift(); // Remove this jump from queue
  }
}

function checkCollisions() {
  // Check standard collision first
  if (player.isTouching(obstaclesGroup)) {
    triggerGameOver();
    return;
  }

  // Check UFO collider for UFO alien dog obstacles
  for (let i = 0; i < obstaclesGroup.length; i++) {
    const obstacle = obstaclesGroup[i];

    // Only check UFO collider for UFO alien dogs
    if (obstacle.ufoCollider) {
      if (checkUfoCollision(player, obstacle)) {
        triggerGameOver();
        return;
      }
    }
  }
}

function checkUfoCollision(player, obstacle) {
  const config = obstacle.ufoCollider;

  // Calculate the secondary collider's bounds (rectangle)
  const obstacleScale = obstacle.scale;
  const rectWidth = config.width * obstacleScale;
  const rectHeight = config.height * obstacleScale;
  const rectOffsetX = config.offsetX * obstacleScale;
  const rectOffsetY = config.offsetY * obstacleScale;

  const rectLeft = obstacle.position.x + rectOffsetX - rectWidth / 2;
  const rectRight = obstacle.position.x + rectOffsetX + rectWidth / 2;
  const rectTop = obstacle.position.y + rectOffsetY - rectHeight / 2;
  const rectBottom = obstacle.position.y + rectOffsetY + rectHeight / 2;

  // Calculate player's circular collider bounds
  const playerRadius = COLLIDERS.PLAYER.radius * player.scale;
  const playerLeft = player.position.x - playerRadius;
  const playerRight = player.position.x + playerRadius;
  const playerTop = player.position.y - playerRadius;
  const playerBottom = player.position.y + playerRadius;

  // Check for AABB (Axis-Aligned Bounding Box) collision
  const colliding = !(playerRight < rectLeft ||
    playerLeft > rectRight ||
    playerBottom < rectTop ||
    playerTop > rectBottom);

  return colliding;
}

function handlePlayerInput() {
  const canJump = player.position.y >= 200;
  const jumpInput = keyDown("space") || mousePressedOver(player);

  if (jumpInput && canJump) {
    player.velocityY = PHYSICS.JUMP_VELOCITY;
    sounds.jump.play();

    // Calculate when pet should jump based on distance offset
    // Pet is at POSITIONS.PET_X, player is at POSITIONS.PLAYER_X
    const xOffset = POSITIONS.PLAYER_X - POSITIONS.PET_X; // Distance between them
    const obstacleSpeed = Math.abs(PHYSICS.OBSTACLE_SPEED); // How fast obstacles move (6 px/frame)
    const framesDelay = Math.round(xOffset / obstacleSpeed); // How many frames until obstacle reaches pet

    const petJumpFrame = frameCount + framesDelay;
    petJumpQueue.push(petJumpFrame);

    // console.log('👤 Player jumped! Pet will jump in', framesDelay, 'frames at frame', petJumpFrame);
  }
}

function triggerGameOver() {
  gameState = GAME_STATE.END;
  sounds.die.play();
  sounds.background.stop();
  ground.velocityX = 0;
}

function showRestartUI() {
  if (!sounds.playGame.isPlaying()) {
    sounds.playGame.play();
  }
  restartButton.visible = true;
  restartLogo.visible = true;
  player.visible = false;
  pet.visible = false;
}

function stopObstacles() {
  obstaclesGroup.destroyEach();
  obstaclesGroup.setLifetimeEach(-1);
  obstaclesGroup.setVelocityXEach(0);
}

function resetGame() {
  gameState = GAME_STATE.PLAY;
  restartButton.visible = false;
  restartLogo.visible = false;
  player.changeAnimation("running", playerImages.running);
  obstaclesGroup.destroyEach();
  score = 0;
  player.visible = true;
  pet.position.x = POSITIONS.PET_X;
  pet.position.y = player.position.y;
  pet.visible = true;
  isRestartDelayActive = false;
  gameStartFrame = frameCount; // Show instructions again on restart
}

// ============================================
// OBSTACLE SPAWNING
// ============================================
function spawnObstacles() {
  const shouldSpawnNormal = frameCount % SPAWN_RATES.NORMAL === 0;
  const shouldSpawnMedium = score > 1000 && frameCount % SPAWN_RATES.MEDIUM === 0;
  const shouldSpawnFast = score > 2000 && frameCount % SPAWN_RATES.FAST === 0;

  if (shouldSpawnNormal || shouldSpawnMedium || shouldSpawnFast) {
    createObstacle();
  }
}

function createObstacle() {
  const spawnX = width;
  const spawnY = POSITIONS.GROUND_Y - Math.random() * 350;
  const obstacle = createSprite(spawnX, spawnY, 30, 30);

  obstacle.velocityX = PHYSICS.OBSTACLE_SPEED;
  obstacle.scale = SCALES.OBSTACLE;

  // Randomly select obstacle type and store it for collision detection
  const isMeteor = random() > 0.5;
  const selectedImage = isMeteor ? obstacleImages.meteorite : obstacleImages.ufoAlienDog;
  obstacle.addImage(selectedImage);

  // Store obstacle type for reference
  obstacle.obstacleType = isMeteor ? "meteorite" : "ufoAlienDog";

  // Set primary collider based on obstacle type
  if (isMeteor) {
    // Meteorite: shifted left to match the rock core position
    const config = COLLIDERS.METEORITE;
    obstacle.setCollider(
      config.type,
      config.offsetX,  // Negative value shifts LEFT
      config.offsetY,
      config.radius
    );
  } else {
    // UFO Alien Dog: circular collider for the alien dog body
    const config = COLLIDERS.UFO_ALIEN_DOG.alienDog;
    obstacle.setCollider(
      config.type,
      config.offsetX,
      config.offsetY,
      config.radius
    );

    // Store UFO collider info for manual collision checking
    obstacle.ufoCollider = COLLIDERS.UFO_ALIEN_DOG.ufo;
  }

  obstacle.debug = DEBUG_MODE;

  obstaclesGroup.add(obstacle);
}
// ============================================
// UI RENDERING
// ============================================
function drawUI() {
  fill("white");
  textSize(20);
  text("Score: " + score, POSITIONS.SCORE_X, POSITIONS.SCORE_Y);

  // Show instructions briefly after game starts
  if (gameState === GAME_STATE.PLAY) {
    drawJumpInstructions();
  }

  // Draw secondary colliders for debugging
  if (DEBUG_MODE && gameState === GAME_STATE.PLAY) {
    drawUfoColliders();
  }
}

function drawJumpInstructions() {
  const framesSinceStart = frameCount - gameStartFrame;
  const showDuration = 100; // Show for ~1.7 seconds (at 60fps)
  const fadeInDuration = 30;  // Fade in over 30 frames
  const fadeOutDuration = 30; // Fade out over 30 frames

  if (framesSinceStart < showDuration) {
    let alpha = 180;

    // Fade in effect at the beginning
    if (framesSinceStart < fadeInDuration) {
      const fadeInProgress = framesSinceStart / fadeInDuration;
      alpha = 180 * fadeInProgress;
    }
    // Fade out effect at the end
    else if (framesSinceStart > showDuration - fadeOutDuration) {
      const fadeOutProgress = (framesSinceStart - (showDuration - fadeOutDuration)) / fadeOutDuration;
      alpha = 180 * (1 - fadeOutProgress);
    }

    fill(255, 255, 255, alpha);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("(press SPACE to jump)", width / 2, height / 2);
    textAlign(LEFT, BASELINE);
  }
}

function drawUfoColliders() {
  stroke(...DEBUG_COLOR);
  strokeWeight(DEBUG_STROKE_WEIGHT);
  noFill();

  for (let i = 0; i < obstaclesGroup.length; i++) {
    const obstacle = obstaclesGroup[i];

    if (obstacle.ufoCollider) {
      const config = obstacle.ufoCollider;
      const obstacleScale = obstacle.scale;

      const rectWidth = config.width * obstacleScale;
      const rectHeight = config.height * obstacleScale;
      const rectOffsetX = config.offsetX * obstacleScale;
      const rectOffsetY = config.offsetY * obstacleScale;

      const rectX = obstacle.position.x + rectOffsetX;
      const rectY = obstacle.position.y + rectOffsetY;

      // Draw the secondary rectangular collider
      rectMode(CENTER);
      rect(rectX, rectY, rectWidth, rectHeight);
    }
  }

  noStroke();
}

function updateCursor() {
  // Change cursor to pointer when hovering over clickable elements
  let isOverClickable = false;

  if (gameState === GAME_STATE.INIT && startButton.visible) {
    // Check if mouse is within the button's bounds
    const buttonWidth = startButton.width * SCALES.START_BUTTON;
    const buttonHeight = startButton.height * SCALES.START_BUTTON;

    if (mouseX > startButton.position.x - buttonWidth / 2 &&
      mouseX < startButton.position.x + buttonWidth / 2 &&
      mouseY > startButton.position.y - buttonHeight / 2 &&
      mouseY < startButton.position.y + buttonHeight / 2) {
      isOverClickable = true;
    }
  }

  if (gameState === GAME_STATE.END) {
    // Check restart button
    if (restartButton.visible) {
      const buttonWidth = restartButton.width * SCALES.RESTART_BUTTON;
      const buttonHeight = restartButton.height * SCALES.RESTART_BUTTON;

      if (mouseX > restartButton.position.x - buttonWidth / 2 &&
        mouseX < restartButton.position.x + buttonWidth / 2 &&
        mouseY > restartButton.position.y - buttonHeight / 2 &&
        mouseY < restartButton.position.y + buttonHeight / 2) {
        isOverClickable = true;
      }
    }

    // Check restart logo
    if (restartLogo.visible) {
      const logoWidth = restartLogo.width * SCALES.RESTART_LOGO;
      const logoHeight = restartLogo.height * SCALES.RESTART_LOGO;

      if (mouseX > restartLogo.position.x - logoWidth / 2 &&
        mouseX < restartLogo.position.x + logoWidth / 2 &&
        mouseY > restartLogo.position.y - logoHeight / 2 &&
        mouseY < restartLogo.position.y + logoHeight / 2) {
        isOverClickable = true;
      }
    }
  }

  // Set cursor style
  cursor(isOverClickable ? HAND : ARROW);
}
