var runLevels = function (window) {
  window.opspark = window.opspark || {};

  var draw = window.opspark.draw;
  var createjs = window.createjs;
  let currentLevel = 0;

  window.opspark.runLevelInGame = function (game) {
    // some useful constants
    var groundY = game.groundY;

    // this data will allow us to define all of the
    // behavior of our game
    var levelData = window.opspark.levelData;

    // set this to true or false depending on if you want to see hitzones
    game.setDebugMode(true);

    // TODOs 5 through 11 go here
    // BEGIN EDITING YOUR CODE HERE

    function createSawblade(x, y) {
      var hitZoneSize = 25;
      var damageFromObstacle = 10;
      var sawBladeHitZone = game.createObstacle(
        hitZoneSize,
        damageFromObstacle
      );

      sawBladeHitZone.x = x;
      sawBladeHitZone.y = groundY - y;

      var obstacleImage = draw.bitmap("img/sawblade.png");
      obstacleImage.x = -hitZoneSize;
      obstacleImage.y = -hitZoneSize;
      sawBladeHitZone.addChild(obstacleImage);

      game.addGameItem(sawBladeHitZone);
    }

    createSawblade(1000, 110);
    createSawblade(500, 10);

    function createEnemy(x, y) {
      var enemy = game.createGameItem("enemy", 25);
      var redSquare = draw.rect(50, 50, "red");
      redSquare.x = -25;
      redSquare.y = -25;
      enemy.addChild(redSquare);
      var enemyHead = draw.rect(30, 30, "red");
      enemyHead.x = -15;
      enemyHead.y = -55;
      enemy.addChild(enemyHead);

      enemy.x = x;
      enemy.y = groundY - y;
      game.addGameItem(enemy);

      enemy.velocityX = -1;
      enemy.rotationalVelocity = -20;

      enemy.onPlayerCollision = function () {
        game.changeIntegrity(-10);
      };

      enemy.onProjectileCollision = function () {
        game.increaseScore(100);
        enemy.fadeOut();
        enemy.shrink();
      };
    }

    createEnemy(400, 50);
    createEnemy(800, 110);
    createEnemy(1200, 50);

    function createReward(x, y) {
      var reward = game.createGameItem("reward", 25);
      var rewardSprite = draw.rect(20, 20, "aqua");
      rewardSprite.x = -10;
      rewardSprite.y = -10;
      reward.addChild(rewardSprite);

      reward.x = x;
      reward.y = groundY - y;
      game.addGameItem(reward);

      reward.velocityX = -1;
      reward.rotationalVelocity = -30;

      reward.onPlayerCollision = function () {
        game.increaseScore(500);
        game.changeIntegrity(30);
      };

      reward.onProjectileCollision = function () {
        game.increaseScore(250);
        enemy.fadeOut();
      };
    }

    createReward(1000, 40);

    function createMarker(x, y) {
      var marker = game.createGameItem("reward", 25);
      var markerSprite = draw.rect(20, 20, "lime");
      markerSprite.x = -10;
      markerSprite.y = -10;
      marker.addChild(markerSprite);

      marker.x = x;
      marker.y = groundY - y;
      game.addGameItem(marker);

      marker.velocityX = -1;
      marker.rotationalVelocity = -30;

      marker.onPlayerCollision = function () {
        startLevel()
      };

      marker.onProjectileCollision = function () {
        startLevel()
      };
    }

    createMarker(1500, 50);

    function startLevel() {
      // TODO 13 goes below here

      //////////////////////////////////////////////
      // DO NOT EDIT CODE BELOW HERE
      //////////////////////////////////////////////
      if (++currentLevel === levelData.length) {
        startLevel = () => {
          console.log("Congratulations!");
        };
      }
    }
    startLevel();
  };
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if (
  typeof process !== "undefined" &&
  typeof process.versions.node !== "undefined"
) {
  // here, export any references you need for tests //
  module.exports = runLevels;
}
