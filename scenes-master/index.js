import {
    start
} from "./start.js";
import {
    main
} from "./main.js";
import {
    gameover
} from "./gameover.js";

console.log("10");

var config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 620,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        parent: "game",
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },

    scene: [start, main, gameover]
}

var game = new Phaser.Game(config);