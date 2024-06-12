var background = function (window) {
  "use strict";

  window.opspark = window.opspark || {};
  var draw = window.opspark.draw;
  var createjs = window.createjs;

  const img = new Image();
  img.onload = function () {
    // alert(this.width + "x" + this.height);
  };
  img.src = "img/cave-bg.jpeg";

  /*
   * Create a background view for our game application
   */
  window.opspark.makeBackground = function (app, ground) {
    /* Error Checking - DO NOT DELETE */
    if (!app) {
      throw new Error("Invalid app argument");
    }
    if (!ground || typeof ground.y == "undefined") {
      throw new Error("Invalid ground argument");
    }

    // useful variables
    var canvasWidth = app.canvas.width;
    var canvasHeight = app.canvas.height;
    var groundY = ground.y;

    // container which will be returned
    var background;

    //////////////////////////////////////////////////////////////////
    // ANIMATION VARIABLES HERE //////////////////////////////////////
    //////////////////////////////////////////////////////////////////
    // TODO (several):

    var tree;
    var buildings = [];

    // called at the start of game and whenever the page is resized
    // add objects for display in background. draws each image added to the background once
    function render() {
      background.removeAllChildren();

      // TODO 1:
      // this currently fills the background with an obnoxious yellow;
      // you should modify both the height and color to suit your game
      var backgroundFill = draw.rect(canvasWidth, groundY, "#444548");
      background.addChild(backgroundFill);

      var backgroundImage = draw.bitmap("img/cave-bg.jpeg");
      backgroundImage.x = 0;
      backgroundImage.y = 0;

      var backgroundScaleConstant = canvasWidth / img.width;
      backgroundImage.scaleX = backgroundScaleConstant;
      backgroundImage.scaleY = backgroundScaleConstant;
      background.addChild(backgroundImage);

      var groundFill = draw.rect(
        canvasWidth,
        canvasHeight - groundY,
        // "#222325cc"
        "#222222bb"
      );
      groundFill.y = groundY;
      background.addChild(groundFill);

      // TODO 2: - Add a moon and starfield
      var moon = draw.bitmap("img/readme/moon.png");
      moon.x = canvasWidth - 400;
      moon.y = 100;
      moon.scaleX = 2.0;
      moon.scaleY = 2.0;
      background.addChild(moon);

      for (let i = 0; i < 100; i++) {
        var circle = draw.circle(2, "#999");
        circle.x = canvasWidth * Math.random();
        circle.y = canvasHeight * Math.random();
        background.addChild(circle);
      }
      // TODO 4: Part 1 - Add buildings!     Q: This is before TODO 4 for a reason! Why?
      for (var i = 0; i < 100; i++) {
        var buildingHeight = Math.random() * 350;
        var buildingColor =
          "rgb(" +
          String(Math.floor(Math.random() * 128)) + ", " +
          String(Math.floor(Math.random() * 128)) + ", " +
          String(Math.floor(Math.random() * 128)) + ")";
        console.log(buildingColor);
        var building = draw.rect(75, buildingHeight, buildingColor, "black", 1);
        building.x = (100 + (Math.random() * 100)) * i;
        building.y = groundY - buildingHeight;
        background.addChild(building);
        buildings.push(building);
      }

      // TODO 3: Part 1 - Add a tree
      tree = draw.bitmap("img/tree.png");
      tree.x = 0 + 550;
      tree.y = groundY - 190;
      background.addChild(tree);
    } // end of render function - DO NOT DELETE

    // Perform background animation
    // called on each timer "tick" - 60 times per second
    function update() {
      // useful variables
      var canvasWidth = app.canvas.width;
      var canvasHeight = app.canvas.height;
      var groundY = ground.y;

      // TODO 3: Part 2 - Move the tree!
      tree.x -= 5;
      if (tree.x < -200) {
        tree.x = canvasWidth;
      }

      // TODO 4: Part 2 - Parallax
      for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];
        building.x -= 3;
        var divisor = canvasWidth + 200
        building.x = ((((building.x + 200) % divisor) + divisor) % divisor) - 200;
        // console.log(i + " | " + canvasWidth + " | " + building.x);

        // if (building.x < -200) {
        //   building.x = canvasWidth;
        // }
      }


    } // end of update function - DO NOT DELETE

    /* Make a createjs Container for the background and let it know about the render and upate functions*/
    background = new createjs.Container();
    background.resize = render;
    background.update = update;

    /* make the background able to respond to resizing and timer updates*/
    app.addResizeable(background);
    app.addUpdateable(background);

    /* render and return the background */
    render();
    return background;
  };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if (
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined"
) {
  // here, export any references you need for tests //
  module.exports = background;
}
