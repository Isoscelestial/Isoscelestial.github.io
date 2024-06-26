/* global $, sessionStorage, getLevel */

$(document).ready(function () {
  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// INITIALIZATION ///////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // HTML jQuery Objects
  var $board = $("#board");

  // Constant Variables
  var FPS = 5;
  var BOARD_WIDTH = $board.width(); // doesn't actually work because board's descendants are placed outside document flow, which doesn't affect board's size
  var BOARD_HEIGHT = $board.height(); // ditto
  var SQUARE_SIZE = 20;

  // other game variables
  var pacmanTimer; // for starting/stopping the timer that draws new Pacman frames
  var ghostTimer; // for starting/stopping the timer that draws new ghost frames
  var pacman; // an Object to manage Pacman's $element and movement/location data
  var redGhost; // an Object to manage the redGhost's $element and movement/location data
  var level; // a 2D representation of the level with numbers representing walls, pellets, etc...
  var pelletsEaten; // the number of pellets eaten by Pacman

  function startGame() {
    // set initial values for the global variables...
    pacman = {
      id: "#pacman",
      dir: "right",
      x: Number($("#pacman").css("left").split("px")[0]) / SQUARE_SIZE,
      y: Number($("#pacman").css("top").split("px")[0]) / SQUARE_SIZE,
      transform: {
        rotate: "0deg",
        scaleX: 1,
      },
    };
    redGhost = {
      id: "#redGhost",
      dir: "right",
      nextDir: "right",
      x: Number($("#redGhost").css("left").split("px")[0]) / SQUARE_SIZE,
      y: Number($("#redGhost").css("top").split("px")[0]) / SQUARE_SIZE,
      transform: {
        rotate: "0deg",
        scaleX: 1,
      },
      target: {
        x: 0,
        y: 0,
      },
    };
    pelletsEaten = 0;

    // start the timers to draw new frames
    var timeBetweenPacmanFrames = 1000 / FPS; // 5 frames per second
    var timeBetweenGhostFrames = 1000 / (FPS - 1); // 4 frames per second
    pacmanTimer = setInterval(drawNewPacmanFrame, timeBetweenPacmanFrames);
    ghostTimer = setInterval(drawNewGhostFrame, timeBetweenGhostFrames);

    // add movement transition for entities
    $(pacman.id).css(
      "transition",
      `left ${timeBetweenPacmanFrames}ms, top ${timeBetweenPacmanFrames}ms`
    );
    $(pacman.id).css("transition-timing-function", "linear");

    $(redGhost.id).css(
      "transition",
      `left ${timeBetweenGhostFrames}ms, top ${timeBetweenGhostFrames}ms`
    );
    $(redGhost.id).css("transition-timing-function", "linear");

    // turn on event handlers
    // $(document).on("eventType", handleEvent);

    // USE addEventListener INSTEAD OF JQUERY'S ON FUNCTION; WE NEED event.code
    addEventListener("keydown", handleKeyDown);
    // $(document).on("keydown", handleKeyDown);
  }

  function endGame() {
    // stop the timers
    clearInterval(pacmanTimer);
    clearInterval(ghostTimer);

    // turn off event handlers
    $(document).off();
  }

  ////////////////////////////////////////////////////////////////////////////////
  ///////////////////////// CORE LOGIC ///////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  // create maze and objects
  createMaze();

  // start the game
  startGame();

  /*
   * Called once per "tick" of the pacmanTimer. This function should execute the
   * high-level logic for drawing new frames of Pacman:
   *
   * - determine where pacman should move to
   * - if the next location is a wall:
   *   - don't move pacman
   * - otherwise:
   *   - move and redraw pacman
   * - if pacman is in the same location as a pellet:
   *   - "eat" the pellet by removing it from the DOM
   *   - increase the score
   * - if pacman is in the same location as a ghost:
   *   - end the game!
   */
  function drawNewPacmanFrame() {
    // console.log(`pacman: (${pacman.x}, ${pacman.y}) redGhost: (${redGhost.x}, ${redGhost.y})`);
    // console.log([pacman.x, pacman.y], [redGhost.x, redGhost.y]);

    if (level[pacman.y][pacman.x] === 0) {
      $("#r" + pacman.y + "c" + pacman.x)
        .find(".pellet")
        .remove();
      pelletsEaten++;
    }

    if (canMove(pacman)) {
      moveEntity(pacman);
    }

    if (pacman.x === redGhost.x && pacman.y === redGhost.y) {
      endGame();
    }
  }

  /*
   * Called once per "tick" of the ghostTimer which is slightly slower than
   * the pacmanTimer. This function should execute the high-level logic for
   * drawing new frames of the ghosts:
   *
   * - determine where the ghost should move to (it should never be a wall)
   * - move and redraw the ghost
   */
  function drawNewGhostFrame() {
    redGhost.target.x = pacman.x;
    redGhost.target.y = pacman.y;

    
    
    console.log(`now: ${redGhost.dir}, next: ${redGhost.nextDir}`)
    if (canMove(redGhost)) {
      moveEntity(redGhost);
    }

    redGhost.dir = redGhost.nextDir;
    redGhost.nextDir = chooseNextSquare(redGhost);

    // OLD, INEFFECTIVE AI

    // targetVector = {
    //   x: redGhost.target.x - redGhost.x,
    //   y: redGhost.target.y - redGhost.y,
    // };
    //
    // if (Math.abs(targetVector.x) > Math.abs(targetVector.y)) {
    //   redGhost.dir = targetVector.x > 0 ? "right" : "left";
    //   if (canMove(redGhost)) {
    //     moveEntity(redGhost);
    //   } else {
    //     redGhost.dir = targetVector.y > 0 ? "down" : "up";
    //     if (canMove(redGhost)) moveEntity(redGhost);
    //   }
    // } else if (Math.abs(targetVector.x) < Math.abs(targetVector.y)) {
    //   redGhost.dir = targetVector.y > 0 ? "down" : "up";
    //   if (canMove(redGhost)) {
    //     moveEntity(redGhost);
    //   } else {
    //     redGhost.dir = targetVector.x > 0 ? "right" : "left";
    //     if (canMove(redGhost)) moveEntity(redGhost);
    //   }
    // }
    //
    // console.log(`(${targetVector.x}, ${targetVector.y}) ${redGhost.dir}`);
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// HELPER FUNCTIONS ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  function createMaze() {
    level = getLevel("level1");
    var square;

    for (var row = 0; row < level.length; row++) {
      // use var instead of let
      for (var column = 0; column < level[row].length; column++) {
        // use var instead of let
        square = $("<div>").addClass("square");
        square.css("top", row * SQUARE_SIZE);
        square.css("left", column * SQUARE_SIZE);
        square.attr("id", "r" + row + "c" + column);

        modifySquare(square, level[row][column]);

        $board.append(square);
      }
      BOARD_WIDTH = Math.max(column, BOARD_WIDTH);
    }
    BOARD_HEIGHT = Math.max(row, BOARD_HEIGHT);

    $board.width(BOARD_WIDTH * SQUARE_SIZE);
    $board.height(BOARD_HEIGHT * SQUARE_SIZE);
  }

  function modifySquare(square, data) {
    switch (data) {
      case 9:
        break;
      case 0:
        $("<div>").addClass("pellet").appendTo(square);
        break;
      case 1:
        square.addClass("wall");
        break;
      case 7:
        square.addClass("gate");
        break;
      case 2:
        $("<img>")
          .attr("id", "pacman")
          .attr("src", "img/pacman.png")
          .css("top", square.css("top"))
          .css("left", square.css("left"))
          .appendTo(board);
        break;
      case 3:
        $("<img>")
          .attr("id", "redGhost")
          .attr("src", "img/redGhost.png")
          .css("top", square.css("top"))
          .css("left", square.css("left"))
          .appendTo(board);
        break;
      default:
        break;
    }
  }

  function getNextSquare(entity) {
    var checkOffsetX = 0;
    var checkOffsetY = 0;
    switch (entity.dir) {
      case "up":
        checkOffsetY = -1;
        break;
      case "down":
        checkOffsetY = 1;
        break;
      case "left":
        checkOffsetX = -1;
        break;
      case "right":
        checkOffsetX = 1;
        break;

      default:
        break;
    }

    return {
      x: entity.x + checkOffsetX,
      y: entity.y + checkOffsetY,
    };
  }

  function checkSquare(x, y) {
    // Can also accept single parameter of coordinate object

    const solidSquares = [1, 7];

    if (typeof x == "object") {
      return !solidSquares.includes(level[x.y][x.x]);
    } else {
      return !solidSquares.includes(level[y][x]);
      // if ([1, 7].includes(level[y][x])) {
      //   // console.log("wall");
      //   return false;
      // } else {
      //   // console.log("move");
      //   return true;
      // }
    }
  }

  function scanNextSquare(entity) {
    var nextSquare = getNextSquare(entity);
    // nextSquare = { x: 13, y: 7 };
    // console.log(nextSquare);
    var availableDirs = {};
    var directions = ["up", "left", "down", "right"];
    var dirDirections = {
      up: { x: 0, y: -1 },
      left: { x: -1, y: 0 },
      down: { x: 0, y: 1 },
      right: { x: 1, y: 0 },
    };

    // remove unavailable paths at next square
    for (var i = 0; i < directions.length; i++) {
      var dir = directions[i];
      var checkX = nextSquare.x + dirDirections[dir].x;
      var checkY = nextSquare.y + dirDirections[dir].y;
      if (checkSquare(checkX, checkY)) {
        availableDirs[dir] = {
          x: checkX,
          y: checkY,
        };
      }
    }

    // availableDirs.push({
    //   dir: dir,
    //   x: checkX,
    //   y: checkY,
    // });

    // // remove unavailable paths at next square
    // for (const dir in dirDirections) {
    //   var checkX = dirDirections[dir].x;
    //   var checkY = dirDirections[dir].y;
    //   if (!checkSquare(nextSquare.x + checkX, nextSquare.y + checkY)) {
    //     availableDirs.splice(availableDirs.indexOf(dir), 1);
    //   }
    // }
    // // don't backtrack unless it's the only option
    // if (availableDirs.length > 1) {
    //   availableDirs.splice(availableDirs.indexOf(dirOpposites[entity.dir]), 1);
    // }

    // console.log(entity.dir, availableDirs);

    // don't backtrack unless it's the only option
    var dirOpposites = {
      up: "down",
      left: "right",
      down: "up",
      right: "left",
    };
    // console.log(dirOpposites[entity.dir]);
    if (Object.keys(availableDirs).length > 1) {
      delete availableDirs[dirOpposites[entity.dir]];
    }

    // console.log(entity.dir, availableDirs);

    return availableDirs;
  }

  function chooseNextSquare(entity) {
    var availableDirs = scanNextSquare(entity);

    var minDistance = Infinity;
    var minDir = [];

    // for each available direction, find distance to target
    for (var dir in availableDirs) {
      targetVector = {
        x: redGhost.target.x - availableDirs[dir].x,
        y: redGhost.target.y - availableDirs[dir].y,
      };

      var dirDistance = Math.hypot(targetVector.x, targetVector.y);

      // find direction(s) of least distance
      if (dirDistance < minDistance) {
        minDir = [];
        minDir.push(dir);
        minDistance = dirDistance;
      } else if (dirDistance == minDistance) {
        minDir.push(dir);
      }
    }
    console.log(availableDirs, minDir);

    return minDir[0];
  }

  function canMove(entity) {
    return checkSquare(getNextSquare(entity));
    // var checkX = 0;
    // var checkY = 0;
    // switch (entity.dir) {
    //   case "up":
    //     checkY = -1;
    //     break;
    //   case "down":
    //     checkY = 1;
    //     break;
    //   case "left":
    //     checkX = -1;
    //     break;
    //   case "right":
    //     checkX = 1;
    //     break;

    //   default:
    //     break;
    // }

    var nextSquare = getNextSquare(entity);

    return checkSquare(nextSquare);
    return checkSquare(nextSquare.x, nextSquare.y);

    // var checkedSquare = level[nextSquare.y][nextSquare.x];
    // // console.log(
    // //   "Checking: (" + (entity.x + checkY) + ", " + (entity.y + checkY) + ")"
    // // );

    // if ([1, 7].includes(checkedSquare)) {
    //   // console.log("wall");
    //   return false;
    // } else {
    //   // console.log("move");
    //   return true;
    // }
  }

  function moveEntity(entity) {
    switch (entity.dir) {
      case "up":
        entity.y -= 1;
        break;
      case "down":
        entity.y += 1;
        break;
      case "left":
        entity.x -= 1;
        break;
      case "right":
        entity.x += 1;
        break;

      default:
        break;
    }
    $(entity.id).css("left", entity.x * SQUARE_SIZE);
    $(entity.id).css("top", entity.y * SQUARE_SIZE);
  }

  function rotateEntity(entity) {
    switch (entity.dir) {
      case "up":
        entity.transform.rotate = "-90deg";
        break;
      case "down":
        entity.transform.rotate = "90deg";
        break;
      case "left":
        entity.transform.rotate = "0deg";
        entity.transform.scaleX = -1;
        break;
      case "right":
        entity.transform.rotate = "0deg";
        entity.transform.scaleX = 1;
        break;

      default:
        break;
    }
    $(entity.id).css(
      "transform",
      "scaleX(" +
        entity.transform.scaleX +
        ") rotate(" +
        entity.transform.rotate +
        ")"
    ); // transform order: scaleX, rotate
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////// EVENT HELPER FUNCTIONS //////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  function handleKeyDown(event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        pacman.dir = "up";
        // console.log("up");
        break;
      case "ArrowDown":
      case "KeyS":
        pacman.dir = "down";
        // console.log("down");
        break;
      case "ArrowLeft":
      case "KeyA":
        pacman.dir = "left";
        // console.log("left");
        break;
      case "ArrowRight":
      case "KeyD":
        pacman.dir = "right";
        // console.log("right");
        break;

      default:
        break;
    }
    rotateEntity(pacman);
  }
});
