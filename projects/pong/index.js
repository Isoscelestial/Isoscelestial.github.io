/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// SETUP /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // Constant Variables
  const FRAME_RATE = 60;
  const FRAMES_PER_SECOND_INTERVAL = 1000 / FRAME_RATE;

  // SETTING VARIABLES
  var PADDLE_SPEED = 10;
  var BALL_HIT_ACCELERATION = 2;
  var FRICTION = Math.PI / 8;

  // Game Item Objects

  var GameItem = function (id, type, bounceDir) {
    var newObj = {};
    newObj.type = type;
    newObj.width = $(id).width();
    newObj.height = $(id).height();
    newObj.posX = parseFloat($(id).css("left"));
    newObj.posY = parseFloat($(id).css("top"));
    newObj.speedX = 0;
    newObj.speedY = 0;
    newObj.speed = 0;
    newObj.angle = 0;
    newObj.id = id;
    newObj.dectDir = {
      left: false,
      up: false,
      right: false,
      down: false,
    };
    newObj.bounceDir = bounceDir !== undefined ? bounceDir : undefined;

    return newObj;
  };

  var frameCount = 0;
  var gameRunning = false;

  var ball = GameItem("#ball", "ball");
  var paddle1 = GameItem("#paddle1", "paddle", "right");
  var paddle2 = GameItem("#paddle2", "paddle", "left");
  var dir = GameItem("#dir", "dir");

  var lastPointWinner = undefined;

  var score1 = 0;
  var score2 = 0;

  var pressedKeys = {
    playerOneUp: false,
    playerOneDown: false,
    playerTwoUp: false,
    playerTwoDown: false,
  };

  var BOARD_WIDTH = $("#board").width();
  var BOARD_HEIGHT = $("#board").height();

  // one-time setup
  let interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL); // execute newFrame every 0.0166 seconds (60 Frames per second)
  $(document).on("keydown", handleKeyDown); // change 'eventType' to the type of event you want to handle
  $(document).on("keyup", handleKeyUp); // change 'eventType' to the type of event you want to handle
  resetGame();
  // $(document).on("mousedown", startGame); // change 'eventType' to the type of event you want to handle

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /* 
  On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
  by calling this function and executing the code inside.
  */
  function newFrame() {
    BOARD_WIDTH = $("#board").width();
    BOARD_HEIGHT = $("#board").height();

    // console.log(pressedKeys);
    // console.log(paddle2.posY);

    calculatePaddleSpeed(paddle1, 1);
    calculatePaddleSpeed(paddle2, 2);

    calculateObjectPos(paddle1);
    calculateObjectPos(paddle2);

    wallCollision(paddle1);
    wallCollision(paddle2);

    moveObject(paddle1);
    moveObject(paddle2);

    calculateBallSpeed(ball);
    calculateObjectPos(ball);
    wallCollision(ball);
    paddleCollision(ball, paddle1);
    paddleCollision(ball, paddle2);
    // console.log(
    //   ball.dectDir.left +
    //     " " +
    //     ball.dectDir.up +
    //     " " +
    //     ball.dectDir.right +
    //     " " +
    //     ball.dectDir.down
    // );
    // console.log(
    //   "p1: " + doCollide(ball, paddle1) + " p2 + " + doCollide(ball, paddle2)
    // );

    moveObject(ball);

    // $("#dir").css(
    //   "transform",
    //   "translate(10px, 10px) rotateZ(" + ball.angle.toString() + "rad)"
    // );

    // console.log(
    //   // frameCount +
    //   //   ": " +
    //   ball.speed +
    //     " | " +
    //     ball.angle +
    //     " | " +
    //     ball.speedX +
    //     " | " +
    //     ball.speedY
    // );
    frameCount++;

    console.log(score1 + " " + score2);
  }

  /* 
  Called in response to events.
  */
  function handleKeyDown(event) {
    if (!gameRunning) {
      gameRunning = true;
      startGame();
    }

    if (event.key === "ArrowUp") {
      pressedKeys.playerTwoUp = true;
    }
    if (event.key === "ArrowDown") {
      pressedKeys.playerTwoDown = true;
    }
    if (event.key === "w") {
      pressedKeys.playerOneUp = true;
    }
    if (event.key === "s") {
      pressedKeys.playerOneDown = true;
    }
  }

  function handleKeyUp(event) {
    if (event.key === "ArrowUp") {
      pressedKeys.playerTwoUp = false;
    }
    if (event.key === "ArrowDown") {
      pressedKeys.playerTwoDown = false;
    }
    if (event.key === "w") {
      pressedKeys.playerOneUp = false;
    }
    if (event.key === "s") {
      pressedKeys.playerOneDown = false;
    }
  }

  function startGame(event) {
    console.log("start!");
    startBall(ball);
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  function startBall(gameItem) {
    gameItem.speed = 5;
    // gameItem.angle =
    //   Math.round(Math.random()) * Math.PI +
    //   (Math.random() - 0.5) * (Math.PI / 4);
    if (lastPointWinner === undefined) {
      gameItem.angle =
        Math.round(Math.random()) * Math.PI +
        (Math.random() - 0.5) * (Math.PI / 4);
    } else {
      gameItem.angle =
        (-1 * lastPointWinner + 2) * Math.PI +
        (Math.random() - 0.5) * (Math.PI / 4);
    }
    // gameItem.angle = Math.random() * Math.PI * 2;
    // gameItem.angle = Math.PI * 0.4 * -1;
    // gameItem.angle = Math.PI * 0.6 * -1;
    // gameItem.angle = Math.PI * 1.4 * -1;
    // gameItem.angle = Math.PI * 1.6 * -1;
    // console.log(gameItem.angle);
    calculateBallSpeed(ball);
  }

  function resetGame() {
    gameRunning = false;
    ball.posX = BOARD_WIDTH / 2 - ball.width / 2;
    ball.posY = BOARD_HEIGHT / 2 - ball.height / 2;
    ball.speed = 0;

    paddle1.posY = BOARD_HEIGHT / 2 - paddle1.height / 2;
    paddle2.posY = BOARD_HEIGHT / 2 - paddle2.height / 2;

    if (score1 >= 11) {
      $("#title").text("Player 1 wins!");
      endGame();
    }

    if (score2 >= 11) {
      $("#title").text("Player 2 wins!");
      endGame();
    }

    // startBall(ball);
  }

  function calculatePaddleSpeed(gameItem, player) {
    gameItem.speedY = 0;
    if (player === 1) {
      if (pressedKeys.playerOneUp) {
        gameItem.speedY -= PADDLE_SPEED;
      }
      if (pressedKeys.playerOneDown) {
        gameItem.speedY += PADDLE_SPEED;
      }
    } else if (player === 2) {
      if (pressedKeys.playerTwoUp) {
        gameItem.speedY -= PADDLE_SPEED;
      }
      if (pressedKeys.playerTwoDown) {
        gameItem.speedY += PADDLE_SPEED;
      }
    }
  }

  function calculateObjectPos(gameItem) {
    gameItem.posX += gameItem.speedX;
    gameItem.posY += gameItem.speedY;
  }

  function moveObject(gameItem) {
    $(gameItem.id).css("left", gameItem.posX);
    $(gameItem.id).css("top", gameItem.posY);
  }

  function wallCollision(gameItem) {
    if (gameItem.type === "paddle") {
      if (gameItem.posX > BOARD_WIDTH - gameItem.width) {
        gameItem.posX = BOARD_WIDTH - gameItem.width;
      }
      if (gameItem.posX < 0) {
        gameItem.posX = 0;
      }
      if (gameItem.posY > BOARD_HEIGHT - gameItem.height) {
        gameItem.posY = BOARD_HEIGHT - gameItem.height;
      }
      if (gameItem.posY < 0) {
        gameItem.posY = 0;
      }
    } else if (gameItem.type === "ball") {
      if (gameItem.posX < 0) {
        lastPointWinner = 1;
        score2++;
        updateScore();
        resetGame();
      }
      if (gameItem.posX > BOARD_WIDTH - gameItem.width) {
        lastPointWinner = 2;
        score1++;
        updateScore();
        resetGame();
      }

      // if (gameItem.posX > BOARD_WIDTH - gameItem.width) {
      //   if (!gameItem.dectDir.right) {
      //     gameItem.speedX *= -1;
      //     convertToLocalSpeed(gameItem);
      //     gameItem.dectDir.right = true;
      //   }
      // } else {
      //   gameItem.dectDir.right = false;
      // }

      // if (gameItem.posX < 0) {
      //   if (!gameItem.dectDir.left) {
      //     gameItem.speedX *= -1;
      //     convertToLocalSpeed(gameItem);
      //     gameItem.dectDir.left = true;
      //   }
      // } else {
      //   gameItem.dectDir.left = false;
      // }

      if (gameItem.posY > BOARD_HEIGHT - gameItem.height) {
        if (!gameItem.dectDir.down) {
          gameItem.speedY *= -1;
          convertToLocalSpeed(gameItem);
          gameItem.dectDir.down = true;
        }
      } else {
        gameItem.dectDir.down = false;
      }

      if (gameItem.posY < 0) {
        if (!gameItem.dectDir.up) {
          gameItem.speedY *= -1;
          convertToLocalSpeed(gameItem);
          gameItem.dectDir.up = true;
        }
      } else {
        gameItem.dectDir.up = false;
      }
    }
  }

  function paddleCollision(gameItem, paddle) {
    var colliding = doCollide(gameItem, paddle);

    if (paddle.bounceDir === "right" && colliding) {
      if (!paddle.dectDir.right) {
        // console.log("right");
        
        gameItem.speedX *= -1;
        convertToLocalSpeed(gameItem);
        gameItem.speed += BALL_HIT_ACCELERATION;

        gameItem.angle += (paddle.speedY / PADDLE_SPEED) * FRICTION;

        paddle.dectDir.right = true;
      }
    } else {
      paddle.dectDir.right = false;
    }

    if (paddle.bounceDir === "left" && colliding) {
      if (!paddle.dectDir.left) {
        // console.log("left");
        
        gameItem.speedX *= -1;
        convertToLocalSpeed(gameItem);
        gameItem.speed += BALL_HIT_ACCELERATION;

        gameItem.angle -= (paddle.speedY / PADDLE_SPEED) * FRICTION;

        paddle.dectDir.left = true;
      }
    } else {
      paddle.dectDir.left = false;
    }

    // if (doCollide(gameItem, paddle)) {
    //   if (paddle.bounceDir === "right") {
    //     if (!gameItem.dectDir.left) {
    //       console.log("right");
    //       gameItem.speedX *= -1;
    //       convertToLocalSpeed(gameItem);
    //       gameItem.dectDir.left = true;
    //     }
    //   }
    //   if (paddle.bounceDir === "left") {
    //     if (!gameItem.dectDir.right) {
    //       console.log("left");
    //       gameItem.speedX *= -1;
    //       convertToLocalSpeed(gameItem);
    //       gameItem.dectDir.right = true;
    //     }
    //   }
    // } else {
    //   if (paddle.bounceDir === "right") {
    //     gameItem.dectDir.right = false;
    //     gameItem.dectDir.left = false;
    //   } else if (paddle.bounceDir === "left") {
    //   }
    // }
  }

  function calculateBallSpeed(gameItem) {
    gameItem.speedX = Math.cos(gameItem.angle) * gameItem.speed;
    gameItem.speedY = Math.sin(gameItem.angle) * gameItem.speed;
  }

  function convertToLocalSpeed(gameItem) {
    gameItem.speed = Math.sqrt(
      gameItem.speedX * gameItem.speedX + gameItem.speedY * gameItem.speedY
    );

    var alpha = Math.atan(gameItem.speedY / gameItem.speedX);
    var quadrant = getSpeedQuadrant(gameItem);

    // console.log(alpha + " q" + quadrant);

    if (quadrant === 1) {
      gameItem.angle = alpha;
    } else if (quadrant === 2) {
      gameItem.angle = Math.PI + alpha;
    } else if (quadrant === 3) {
      gameItem.angle = Math.PI + alpha;
    } else if (quadrant === 4) {
      gameItem.angle = 2 * Math.PI + alpha;
    }
  }

  function getSpeedQuadrant(gameItem) {
    if (gameItem.speedX > 0 && gameItem.speedY > 0) {
      return 1;
    }
    if (gameItem.speedX < 0 && gameItem.speedY > 0) {
      return 2;
    }
    if (gameItem.speedX < 0 && gameItem.speedY < 0) {
      return 3;
    }
    if (gameItem.speedX > 0 && gameItem.speedY < 0) {
      return 4;
    }
  }

  function doCollide(obj1, obj2) {
    if (
      obj1.posX < obj2.posX + obj2.width &&
      obj1.posX + obj1.width > obj2.posX &&
      obj1.posY < obj2.posY + obj2.height &&
      obj1.posY + obj1.height > obj2.posY
    ) {
      return true;
    } else {
      return false;
    }
  }

  function updateScore() {
    var scoreboard = $("#scoreboard");
    scoreboard.find("#player1").text(score1);
    scoreboard.find("#player2").text(score2);
  }

  function endGame() {
    $("#title").css("display", "block");

    // stop the interval timer
    clearInterval(interval);

    // turn off event handlers
    $(document).off();
  }
}
