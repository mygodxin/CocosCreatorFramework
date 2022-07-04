import { timer } from "../support/util/Timer";

class GameApp {
    constructor() {
        timer.init();
    }
}

/** 游戏总控 */
export const gameApp = new GameApp();