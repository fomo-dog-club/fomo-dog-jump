var INIT = -1;
var PLAY = 1;
var END = 0;
var gameState = INIT;
var invisible_ground;
var doge,doge_running,doge_collided,dogeImage,ufo,ufo_running,ufo_attack;
var obstaclesGroup,obstacle1,obstacle2,obstacle3,obstacle4;
var jumpSound,dieSound,checkpointSound,bgSound,playGameSound;
var score,restart,restartImage,logo,logoImage,restartLogoImage,restartLogo,start,startImage;
var isRestart = 0;

var ground,ground_image,invisible_ground;

function preload(){
  
  jumpSound = loadSound("assets/music/mario_jump.mp3")
  dieSound = loadSound("assets/music/mario_die.mp3")  
  checkPointSound = loadSound("assets/music/check_point.mp3")
  bgSound = loadSound("assets/music/fdc_theme.mp3")
  playGameSound = loadSound("assets/music/do_you_wanna_play_a_game.mp3")
  doge_running=loadImage("assets/img/sprite/cropped_fast.gif");
  doge_collided=loadImage("assets/img/sprite/better_luck.gif");
  dogeImage=loadImage("assets/img/sprite/cropped_slow.gif");
  ufo_running=loadImage("assets/img/fomo_bark.gif");
  obstacle1=loadImage("assets/img/obstacles/meteorite.gif");
  obstacle2=loadImage("assets/img/obstacles/aliendog2.gif");
  obstacle3=loadImage("assets/img/obstacles/obstacle1.png");
  obstacle4=loadImage("assets/img/obstacles/obstacle4.png");    
  restartImage=loadImage("assets/img/sprite/play.gif");  
  restartLogoImage=loadImage("assets/img/restartLogo.gif");
  startImage=loadImage("assets/img/start.gif");
  logoImage=loadImage("assets/img/bg/bg_banner.png");

  ground_image=loadImage("assets/img/bg/bg_spacex.png");
}

function setup() {
 var myCanvas = createCanvas(1280,600);
 myCanvas.parent("canvas-container");
 
  ground=createSprite(width/2,height/2,0,0);
  ground.shapeColor="white";
  ground.addImage("ground_image",ground_image);
  ground.scale=1;
  //ground.debug=true;

  invisible_ground=createSprite(width/2,550,width,10);
  invisible_ground.visible=false;
  //invisible_ground.debug=true;

  logo=createSprite(width/2-30, 70,0,0);
  logo.scale=0.8;
  logo.shapeColor="white";
  logo.addImage("logoImage",logoImage);
  //logo.debug=true;
 
  doge=createSprite(width/3,height/2,30,30);
  doge.addImage("doge_running",doge_running);
  doge.addImage("doge_collided",doge_collided);
  doge.addImage("dogeImage",dogeImage);
  doge.scale=0.2; 
  doge.setCollider("rectangle",0,0,doge.width,doge.height)
  doge.visible = false;
  //doge.debug=true;
  
  ufo=createSprite(width/5,height/2,30,30);
  ufo.addImage("ufo_running",ufo_running);
  ufo.scale=0.2;
  ufo.visible = false;
  //ufo.debug=true;

  restart = createSprite(width/2,400);
  restart.addImage(restartImage);
  restart.visible = false;
  restart.scale=0.3;
  //restart.debug=true;

  restartLogo = createSprite(width/2,200);
  restartLogo.addImage(restartLogoImage);
  restartLogo.visible = false;
  restartLogo.scale=0.7;

  start = createSprite(width/2,350);
  start.addImage(startImage);
  start.visible = false;
  start.scale=0.5;

  obstaclesGroup=new Group();
  score=0;  
}

function draw() {
  clear();
    
  if (gameState===INIT){
    start.visible=true;
    if(keyDown("space") || mousePressedOver(start)) {
      gameState=PLAY;
    }  
  }
  else if (gameState===PLAY){

      // console.log(doge.y);
      doge.velocityY = doge.velocityY + 0.8;
      doge.collide(invisible_ground); 
      doge.visible = true;

      ufo.velocityY = ufo.velocityY + 0.8;
      ufo.collide(invisible_ground); 
      ufo.visible = true;

    //console.log('ground.x:'+ground.x);
    //ground.velocityX=-1;
    if (ground.x < 0){
      ground.x = ground.width/2;
    }
    ground.velocityX = -(4 + 3*score/100);

    if (playGameSound.isPlaying()) playGameSound.stop();
    if (!bgSound.isPlaying()) bgSound.play();

    start.visible=false;
    restart.visible=false;
    restartLogo.visible=false;
    score = score + Math.round(getFrameRate()/60);
 
    spawnObstacles();
    if (obstaclesGroup.isTouching(ufo)){
      ufo.velocityY=-12;
    }
   
     if(score>0 && score%100 === 0){
       checkPointSound.play() 
    }
    
    if (doge.isTouching(obstaclesGroup)){
      gameState=END;
      dieSound.play();
      bgSound.stop();
       isRestart = 1;
       ground.velocityX=0;
    }
    else
    {
      doge.visible=true;
      ufo.visible=true;        
    }
    
    if(((keyDown("space") || mousePressedOver(doge) ) && doge.y >= 200)) {
      doge.velocityY = -12;
      jumpSound.play();
    }  
  }
  else if ( gameState===END) {

    setTimeout(function() {
      if (!playGameSound.isPlaying() && isRestart == 1) playGameSound.play();
      isRestart = 0;
      restart.visible=true;  
      restartLogo.visible=true;  
      doge.visible=false;
      ufo.visible=false;    
      }, 5000);


    doge.velocityY = 0
    doge.changeImage("dogeImage",dogeImage);
     ufo.x=doge.x;
     ufo.y=doge.y-110;
    //if (ufo.isTouching(doge)) {
      doge.changeImage("doge_collided",doge_collided);
    //}
      
    obstaclesGroup.destroyEach();
    obstaclesGroup.setLifetimeEach(-1);
    obstaclesGroup.setVelocityXEach(0);
  
    if(mousePressedOver(restart) || mousePressedOver(restartLogo)) {
      reset();     
    }
  } 
 
  drawSprites();
  fill("white");
  textSize(20);
  text("分數: "+ score, width-130,100);
}

function reset(){
    gameState=PLAY;
    restart.visible=false;
    restartLogo.visible=false;
    doge.changeAnimation("doge_running",doge_running);   
    obstaclesGroup.destroyEach();
    score=0;
    doge.visible=true;
    ufo.x=width/5;    
    ufo.y=doge.y;
    ufo.visible=true;    
}

function spawnObstacles() {
  
  var s60 = frameCount % 60 === 0 ;
  var s30 = frameCount % 30 === 0 ;
  var s10 = frameCount % 10 === 0 ;
   if ( s60 || (score>1000 && s30) || (score>2000 && s10)){
   var obstacle = createSprite(width,550-(Math.random()*350),30,30);
   obstacle.velocityX = -6;
    
   var obstacles = [obstacle1,obstacle2];  
   var theObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
   obstacle.addImage(theObstacle);

   obstacle.scale=0.25;
   obstaclesGroup.add(obstacle);
   obstacle.debug=false;
   obstacle.setCollider("circle",0,0,1);
  }
     
}

