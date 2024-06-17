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
  var Walker = function (selector, startX, startY) {
    this.selector = selector;
    
    this.pos = { x: null, y: null };
    this.pos.x = startX !== undefined ? startX : 0;
    this.pos.y = startY !== undefined ? startY : 0;

    this.speed = { x: null, y: null };
    this.speed.x = 0;
    this.speed.y = 0;
    
    this.force = { x: null, y: null };
    this.force.x = 0;
    this.force.y = 0;
  };

  var controlMaps = {
    "#walker": {
      left: KEY.LEFT,
      up: KEY.UP,
      right: KEY.RIGHT,
      down: KEY.DOWN,
    },
    "#walker2": {
      left: KEY.A,
      up: KEY.W,
      right: KEY.D,
      down: KEY.S,
    },
  };

  Walker.prototype.setVelocity = function () {
    this.speed.x = 0;
    this.speed.y = 0;

    if (pressedKeys.includes(controlMaps[this.selector].left)) {
      this.speed.x -= 5;
    }
    if (pressedKeys.includes(controlMaps[this.selector].up)) {
      this.speed.y -= 5;
    }
    if (pressedKeys.includes(controlMaps[this.selector].right)) {
      this.speed.x += 5;
    }
    if (pressedKeys.includes(controlMaps[this.selector].down)) {
      this.speed.y += 5;
    }
  };

  Walker.prototype.reposition = function () {
    this.pos.x += this.speed.x;
    this.pos.y += this.speed.y;
  };

  Walker.prototype.redraw = function () {
    $(this.selector).css("left", this.pos.x);
    $(this.selector).css("top", this.pos.y);
  };

  Walker.prototype.wallCollision = function () {
    while (this.pos.x > $("#board").width() - $(this.selector).width()) {
      this.pos.x -= 1;
    }
    while (this.pos.y > $("#board").height() - $(this.selector).height()) {
      this.pos.y -= 1;
    }
    while (this.pos.x < 0) {
      this.pos.x += 1;
    }
    while (this.pos.y < 0) {
      this.pos.y += 1;
    }
  };

  const walkers = [];

  var walker = new Walker(
    "#walker",
    $("#board").width() - 100,
    $("#board").height() / 2
  );
  var walker2 = new Walker("#walker2", 100, $("#board").height() / 2);

  walkers.push(walker);
  walkers.push(walker2);

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
    for (var i = 0; i < walkers.length; i++) {
      walkers[i].setVelocity();
      walkers[i].reposition();
      walkers[i].wallCollision();
      walkers[i].redraw();
    }
  }

  /* 
  Called in response to events.
  */
  // set speed depending on direction
  function handleKeyDown(event) {
    if (!pressedKeys.includes(event.which)) {
      pressedKeys.push(event.which);
    }
  }

  // reset speed to 0
  function handleKeyUp(event) {
    pressedKeys.splice(pressedKeys.indexOf(event.which), 1);
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  function endGame() {
    // stop the interval timer
    clearInterval(interval);

    // turn off event handlers
    $(document).off();
  }
}
