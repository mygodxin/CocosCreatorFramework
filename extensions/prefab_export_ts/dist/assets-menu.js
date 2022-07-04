"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onDBMenu = exports.onAssetMenu = exports.onCreateMenu = void 0;
function onCreateMenu(assetInfo) {
    return [
        {
            label: 'onCreateMenu',
            click() {
                if (!assetInfo) {
                    console.log('get create command from header menu');
                }
                else {
                    console.log('get create command, the detail of diretory asset is:');
                    console.log(assetInfo);
                }
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onAssetMenu(assetInfo) {
    return [
        {
            label: 'onAssetMenu',
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
}
exports.onAssetMenu = onAssetMenu;
;
function onDBMenu(assetInfo) {
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
}
exports.onDBMenu = onDBMenu;
;
function onPanelMenu(assetInfo) {
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
}
exports.onPanelMenu = onPanelMenu;
;
