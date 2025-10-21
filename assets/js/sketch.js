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
  PLAYER: 0.2,
  UFO: 0.2,
  OBSTACLE: 0.25,
  LOGO: 0.8,
  START_BUTTON: 0.5,
  RESTART_BUTTON: 0.3,
  RESTART_LOGO: 0.7
};

const POSITIONS = {
  GROUND_Y: 550,
  PLAYER_X: null,  // Set in setup as width / 3
  UFO_X: null,     // Set in setup as width / 5
  LOGO_Y: 70,
  START_BUTTON_Y: 350,
  RESTART_BUTTON_Y: 400,
  RESTART_LOGO_Y: 200,
  UFO_OFFSET_Y: -110
};

const DEBUG_MODE = true;

// ============================================
// GAME STATE VARIABLES
// ============================================
let gameState = GAME_STATE.INIT;
let score = 0;
let isRestartDelayActive = false;

// ============================================
// SPRITE REFERENCES
// ============================================
let player;
let ufo;
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

let ufoImages = {
  running: null
};

let obstacleImages = {
  meteorite: null,
  alienDog: null
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

  // Load UFO sprites
  ufoImages.running = loadImage("assets/img/fomo_bark.gif");

  // Load obstacle sprites
  obstacleImages.meteorite = loadImage("assets/img/obstacles/meteorite.gif");
  obstacleImages.alienDog = loadImage("assets/img/obstacles/aliendog2.gif");

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
  POSITIONS.PLAYER_X = width / 3;
  POSITIONS.UFO_X = width / 5;

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
  initializeUFO();
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
  player.setCollider("rectangle", 0, 0, player.width, player.height);
  player.visible = false;

  if (DEBUG_MODE) {
    player.debug = true;
    player.debugColor = color(255, 0, 0);
    player.debugStrokeWeight = 3;
  }
}

function initializeUFO() {
  ufo = createSprite(POSITIONS.UFO_X, height / 2, 30, 30);
  ufo.addImage("running", ufoImages.running);
  ufo.scale = SCALES.UFO;
  ufo.visible = false;
  ufo.debug = DEBUG_MODE;
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
}

// ============================================
// GAME STATE HANDLERS
// ============================================
function handleInitState() {
  startButton.visible = true;

  if (keyDown("space") || mousePressedOver(startButton)) {
    gameState = GAME_STATE.PLAY;
  }
}

function handlePlayState() {
  updatePhysics();
  updateGround();
  updateAudio();
  hideMenuUI();
  updateScore();
  spawnObstacles();
  handleUFOBehavior();
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

  // Position UFO above player
  ufo.position.x = player.position.x;
  ufo.position.y = player.position.y + POSITIONS.UFO_OFFSET_Y;

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

  ufo.velocityY += PHYSICS.GRAVITY;
  ufo.collide(invisibleGround);
  ufo.visible = true;
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

function handleUFOBehavior() {
  if (obstaclesGroup.isTouching(ufo)) {
    ufo.velocityY = PHYSICS.JUMP_VELOCITY;
  }
}

function checkCollisions() {
  if (player.isTouching(obstaclesGroup)) {
    triggerGameOver();
  }
}

function handlePlayerInput() {
  const canJump = player.position.y >= 200;
  const jumpInput = keyDown("space") || mousePressedOver(player);

  if (jumpInput && canJump) {
    player.velocityY = PHYSICS.JUMP_VELOCITY;
    sounds.jump.play();
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
  ufo.visible = false;
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
  ufo.position.x = POSITIONS.UFO_X;
  ufo.position.y = player.position.y;
  ufo.visible = true;
  isRestartDelayActive = false;
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

  // Randomly select obstacle type
  const obstacleTypes = [obstacleImages.meteorite, obstacleImages.alienDog];
  const selectedObstacle = random(obstacleTypes);
  obstacle.addImage(selectedObstacle);

  // Set collider
  obstacle.setCollider("circle", 0, 0, 300);

  if (DEBUG_MODE) {
    obstacle.debug = true;
    obstacle.debugColor = color(255, 255, 0);
    obstacle.debugStrokeWeight = 4;
  }

  obstaclesGroup.add(obstacle);
}

// ============================================
// UI RENDERING
// ============================================
function drawUI() {
  fill("white");
  textSize(20);
  text("分數: " + score, width - 130, 100);
}
