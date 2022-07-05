import { Asset, AudioClip, AudioSource } from "cc";
import { stat } from "fs";
import { loader } from "../support/res/Loader";
import { storage } from "../support/storage/Storage";

/** 音频类型 */
export enum AudioType {
    /** 音乐 */
    music,
    /** 音效 */
    sound,
}

class AudioManager {
    private readonly storageUrl: string = 'audio';     //saveLocal路径
    private readonly packUrl: string = 'audio';     //音频包路径
    private readonly musicUrl: string = 'music';    //音乐路径
    private readonly soundUrl: string = 'sound';    //音效路径
    private readonly soundVolume: number = 1;   //音效音量
    private audioSource: AudioSource;   //当前音频播放组件
    private cacheMap: Record<string, AudioClip> = {};   //缓存
    private audioSwitch: Record<AudioType, boolean>;     //音频开关

    /**
     * 初始化音频组件
     * @param audioSource 
     */
    init(audioSource: AudioSource): void {
        this.audioSource = audioSource;
    }

    /**
     * 播放音乐
     * @param name 
     * @param loop 
     */
    playMusic(name: string, loop: boolean = true): void {
        const path: string = `${this.musicUrl}/${name}`;
        let cacheClip = this.cacheMap[path];
        if (cacheClip) {
            if (this.audioSource.clip !== cacheClip) {
                this.audioSource.clip = cacheClip;
            }
            this.audioSource.loop = loop;
            this.audioSource.play();
        } else {
            loader.load(`${this.packUrl}/${path}`, (res: Asset) => {
                const clip = res as AudioClip;;
                this.audioSource[path] = clip;
                this.audioSource.clip = cacheClip;
                this.audioSource.loop = loop;
                this.audioSource.play();
            });
        }
    }

    /**
     * 播放音效
     * @param name 
     */
    playSound(name: string): void {
        const path: string = `${this.soundUrl}/${name}`;
        let cacheClip = this.cacheMap[path];
        if (cacheClip)
            this.audioSource.playOneShot(cacheClip, this.soundVolume);
        else {
            loader.load(`${this.packUrl}/${path}`, (res: Asset) => {
                const clip = res as AudioClip;;
                this.audioSource[path] = clip;
                this.audioSource.playOneShot(clip, this.soundVolume);
            });
        }
    }

    /**
     * 设置音频开关
     * @param state 
     * @param type 不填为一键静音
     */
    setAudioSwitch(state: boolean, type?: AudioType) {
        if (!this.audioSwitch) this.audioSwitch = storage.readLocal(this.storageUrl) || { 0: true, 1: true };

        if (type)
            this.audioSwitch[type] = state;
        else {
            for (let key in AudioType) {
                if (isNaN(Number(key))) {
                    this.audioSwitch[key] = state;
                }
            }
        }
    }

    /**
     * 返回音频开关
     * @param type 
     * @returns 
     */
    getAudioSwitch(type?: AudioType) {
        if (!this.audioSwitch) this.audioSwitch = storage.readLocal(this.storageUrl) || { 0: 1, 1: 1 };

        if (type)
            return this.audioSwitch[type];
        else
            return this.audioSwitch;
    }
}
/** 音频管理 */
export const audioMgr = new AudioManager();