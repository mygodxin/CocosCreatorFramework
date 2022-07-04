import { AssetInfo } from "../@types/packages/asset-db/@types/public";

export function onCreateMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'onCreateMenu',
            click() {
                if (!assetInfo) {
                    console.log('get create command from header menu');
                } else {
                    console.log('get create command, the detail of diretory asset is:');
                    console.log(assetInfo);
                }
            },
        },
    ];
};

export function onAssetMenu(assetInfo: AssetInfo) {
    return [
        {
            label: '发布代码',
            submenu: [
                {
                    label: 'onAssetMenu1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'onAssetMenu2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
};

export function onDBMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'onDBMenu',
            submenu: [
                {
                    label: 'onDBMenu1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'onDBMenu2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
};

export function onPanelMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'onPanelMenu',
            submenu: [
                {
                    label: 'onPanelMenu1',
                    enabled: assetInfo.isDirectory,
                    click() {
                        console.log('get it');
                        console.log(assetInfo);
                    },
                },
                {
                    label: 'onPanelMenu2',
                    enabled: !assetInfo.isDirectory,
                    click() {
                        console.log('yes, you clicked');
                        console.log(assetInfo);
                    },
                },
            ],
        },
    ];
};