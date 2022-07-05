import { _decorator, Component, Node, AudioSource, game, assetManager, resources, instantiate, director, Prefab } from 'cc';
import { gameApp } from './core/GameApp';
import { audioMgr } from './manager/AudioManager';
import { timer } from './support/util/Timer';
const { ccclass, property } = _decorator;

/** 游戏主入口 */
@ccclass('Main')
export class Main extends Component {
    onLoad(): void {
        //初始化音频管理器
        const audioSource = this.node.getComponent(AudioSource);
        if (!audioSource) throw new Error('please add an AudioSource to the scene!');
        game.addPersistRootNode(this.node);
        audioMgr.init(audioSource);
        //初始化计时器
        timer.init();

        // loader.load('resources/bg.png',(res)=>{
        //     console.log('cha')
        // })
        // resources.load('bg',(err,res)=>{
        //     console.log('下载结果',err,res);
        // });
        // resources.load('Test',(err,res)=>{
        //     const node = instantiate(res as Prefab);
        //     director.getScene().getChildByName('Canvas').addChild(node);
        // })
    }

    start(): void {
        //游戏启动
        gameApp.launch();
    }
}

