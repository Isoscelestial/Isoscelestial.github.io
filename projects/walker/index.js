/* global $, sessionStorage */

$(document).ready(runProgram); // wait for the HTML / CSS elements of the page to fully load, then execute runProgram()

function runProgram() {
  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// SETUP /////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // abstracted key codes
  var KEY = {
    ENTER: 13,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    W: 87,
    D: 68,
    S: 83,
  };

  // list of currently pressed keys
  var pressedKeys = [];

  // Constant Variables
  var FRAME_RATE = 60;
  var FRAMES_PER_SECOND_INTERVAL = 1000 / FRAME_RATE;

  // Game Item Objects
  var Walker = function() {
    this.posX = 0;
    this.posY = 0;
    this.speedX = 0;
    this.speedY = 0;
    // this.pos.x = 0;
    // this.pos.y = 0;
    // this.speed.x = 0;
    // this.speed.y = 0;
    // this.force.x = 0;
    // this.force.y = 0;
  }

  var walker = new Walker();
  var walker2 = new Walker();

  // one-time setup
  var interval = setInterval(newFrame, FRAMES_PER_SECOND_INTERVAL); // execute newFrame every 0.0166 seconds (60 Frames per second)
  // addEventListener("keydown", handleKeyDown);
  // addEventListener("keyup", handleKeyUp);
  $(document).on("keydown", handleKeyDown); // change 'eventType' to the type of event you want to handle
  $(document).on("keyup", handleKeyUp); // change 'eventType' to the type of event you want to handle

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  /* 
  On each "tick" of the timer, a new frame is dynamically drawn using JavaScript
  by calling this function and executing the code inside.
  */
  function newFrame() {
    setVelocity();
    repositionGameItem();
    wallCollision();
    redrawGameItem();
    console.log(pressedKeys);
  }

  /* 
  Called in response to events.
  */
  // set speed depending on direction
  function handleKeyDown(event) {
    if (!pressedKeys.includes(event.which)) {
      pressedKeys.push(event.which);
    }

    // if (event.which === KEY.ENTER) {
    //   console.log("enter pressed");
    // } else if (event.which === KEY.LEFT) {
    //   walker.speedX -= 5;
    // } else if (event.which === KEY.UP) {
    //   walker.speedY -= 5;
    // } else if (event.which === KEY.RIGHT) {
    //   walker.speedX += 5;
    // } else if (event.which === KEY.DOWN) {
    //   walker.speedY += 5;
    // }
  }

  // reset speed to 0
  function handleKeyUp(event) {
    pressedKeys.splice(pressedKeys.indexOf(event.which), 1);

    // if (event.which === KEY.ENTER) {
    //   console.log("enter pressed");
    // } else if (event.which === KEY.LEFT) {
    //   walker.speedX += 5;
    // } else if (event.which === KEY.UP) {
    //   walker.speedY += 5;
    // } else if (event.which === KEY.RIGHT) {
    //   walker.speedX -= 5;
    // } else if (event.which === KEY.DOWN) {
    //   walker.speedY -= 5;
    // }
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // set velocity of walker
  function setVelocity() {
    walker.speedX = 0;
    walker.speedY = 0;

    walker2.speedX = 0;
    walker2.speedY = 0;

    if (pressedKeys.includes(KEY.LEFT)) {
      walker.speedX -= 5;
    }
    if (pressedKeys.includes(KEY.UP)) {
      walker.speedY -= 5;
    }
    if (pressedKeys.includes(KEY.RIGHT)) {
      walker.speedX += 5;
    }
    if (pressedKeys.includes(KEY.DOWN)) {
      walker.speedY += 5;
    }

    if (pressedKeys.includes(KEY.A)) {
      walker2.speedX -= 5;
    }
    if (pressedKeys.includes(KEY.W)) {
      walker2.speedY -= 5;
    }
    if (pressedKeys.includes(KEY.D)) {
      walker2.speedX += 5;
    }
    if (pressedKeys.includes(KEY.S)) {
      walker2.speedY += 5;
    }
  }

  // change walker's internal position by its speed
  function repositionGameItem() {
    walker.posX += walker.speedX;
    walker.posY += walker.speedY;

    walker2.posX += walker2.speedX;
    walker2.posY += walker2.speedY;
  }

  // draw frame
  function redrawGameItem() {
    $("#walker").css("left", walker.posX);
    $("#walker").css("top", walker.posY);

    $("#walker2").css("left", walker2.posX);
    $("#walker2").css("top", walker2.posY);
  }

  // go backwards if outside bounds
  function wallCollision() {
    if (walker.posX > $("#board").width() - $("#walker").width()) {
      walker.posX -= walker.speedX;
    }
    if (walker.posY > $("#board").height() - $("#walker").height()) {
      walker.posY -= walker.speedY;
    }
    if (walker.posX < 0) {
      walker.posX -= walker.speedX;
    }
    if (walker.posY < 0) {
      walker.posY -= walker.speedY;
    }

    if (walker2.posX > $("#board").width() - $("#walker2").width()) {
      walker2.posX -= walker2.speedX;
    }
    if (walker2.posY > $("#board").height() - $("#walker2").height()) {
      walker2.posY -= walker2.speedY;
    }
    if (walker2.posX < 0) {
      walker2.posX -= walker2.speedX;
    }
    if (walker2.posY < 0) {
      walker2.posY -= walker2.speedY;
    }
  }

  function endGame() {
    // stop the interval timer
    clearInterval(interval);

    // turn off event handlers
    $(document).off();
  }
}
