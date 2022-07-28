//参考fgui中的GList实现 

import { Component, instantiate, Layout, Node, NodePool, Prefab, Rect, ScrollView, Size, UITransform, _decorator } from "cc";
const { ccclass, property } = _decorator;

interface ItemInfo {
    width: number;
    height: number;
    obj?: Node;
    updateFlag: number;
}

export enum ListSelectionMode {
    Single,
    Multiple,
    Multiple_SingleClick,
    None
}

export type ListItemRenderer = (index: number, item: Node) => void;

export const ListEvent = {
    CLICK_ITEM: "CLICK_ITEM"
}

var s_n: number = 0;
/** 列表 */
@ccclass
export class GList extends Component {
    public itemRenderer: ListItemRenderer;
    public itemProvider: (index: number) => Node;

    public scrollItemToViewOnClick: boolean = true;
    public foldInvisibleItems: boolean = false;

    private _layout: Layout;
    private _lineCount: number = 0;
    private _columnCount: number = 0;
    private _lineGap: number = 0;
    private _columnGap: number = 0;
    @property(Prefab)
    public defaultItem: Prefab = undefined;
    private _selectionMode: ListSelectionMode;

    private _pool: NodePool;
    public _scrollPane?: ScrollView;
    public content: Node;
    private _uiTransform: UITransform;

    //Virtual List support
    private _virtual?: boolean;
    private _loop?: boolean;
    private _numItems: number = 0;
    private _realNumItems: number = 0;
    private _firstIndex: number = 0; //the top left index
    private _curLineItemCount: number = 0; //item count in one line
    private _curLineItemCount2: number = 0; //只用在页面模式，表示垂直方向的项目数
    private _itemSize?: Size;
    private _virtualListChanged: number = 0; //1-content changed, 2-size changed
    private _virtualItems?: Array<ItemInfo>;
    private _eventLocked?: boolean;
    private itemInfoVer: number = 0; //用来标志item是否在本次处理中已经被重用了

    protected onLoad() {
        this._scrollPane = this.getComponent(ScrollView);
        this.content = this._scrollPane.content;
        this._uiTransform = this._scrollPane.view;
        this._pool = new NodePool();
        this._layout = this.content.getComponent(Layout)
        //获取layout布局并禁用掉
        this._layout.enabled = false;
        this._selectionMode = ListSelectionMode.Single;
        this._columnGap = this._layout.spacingX;
        this._lineGap = this._layout.spacingY;
    }

    protected onEnable() {
        this.registerEvents();
    }
    protected onDisable() {
        this.removeEvents();
    }

    private registerEvents() {
        this._scrollPane.node.on(ScrollView.EventType.SCROLL_BEGAN, this.onScrollBegin, this);
        this._scrollPane.node.on(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        this._scrollPane.node.on(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
    }
    private removeEvents() {
        this._scrollPane.node.off(ScrollView.EventType.SCROLL_BEGAN, this.onScrollBegin, this);
        this._scrollPane.node.off(ScrollView.EventType.SCROLLING, this.onScrolling, this);
        this._scrollPane.node.off(ScrollView.EventType.SCROLL_ENDED, this.onScrollEnd, this);
    }

    private onScrollBegin(): void {
    }
    private onScrolling(evt: Event): void {
        this.handleScroll(false);
    }
    private onScrollEnd(): void {
    }

    public dispose(): void {
        this._pool.clear();
    }

    public get layout(): Layout {
        return this._layout;
    }

    public set layout(value: Layout) {
        if (this._layout != value) {
            this._layout = value;
            // this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        }
    }

    public get lineCount(): number {
        return this._lineCount;
    }

    public set lineCount(value: number) {
        if (this._lineCount != value) {
            this._lineCount = value;
            // this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        }
    }

    public get columnCount(): number {
        return this._columnCount;
    }

    public set columnCount(value: number) {
        if (this._columnCount != value) {
            this._columnCount = value;
            // this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        }
    }

    public get lineGap(): number {
        return this._lineGap;
    }

    public set lineGap(value: number) {
        if (this._lineGap != value) {
            this._lineGap = value;
            // this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        }
    }

    public get columnGap(): number {
        return this._columnGap;
    }

    public set columnGap(value: number) {
        if (this._columnGap != value) {
            this._columnGap = value;
            // this.setBoundsChangedFlag();
            if (this._virtual)
                this.setVirtualListChangedFlag(true);
        }
    }

    public get virtualItemSize(): Size {
        return this._itemSize;
    }

    public set virtualItemSize(value: Size) {
        if (this._virtual) {
            if (this._itemSize == null)
                this._itemSize = new Size(0, 0);
            this._itemSize.width = value.width;
            this._itemSize.height = value.height;
            this.setVirtualListChangedFlag(true);
        }
    }

    public get selectionMode(): ListSelectionMode {
        return this._selectionMode;
    }

    public set selectionMode(value: ListSelectionMode) {
        this._selectionMode = value;
    }

    public get itemPool(): NodePool {
        return this._pool;
    }

    public getFromPool(node?: Node): Node {
        var obj: Node = this._pool.get(node) || instantiate(this.defaultItem);
        if (obj)
            obj.active = true;
        return obj;
    }

    public returnToPool(obj: Node): void {
        this._pool.put(obj);
    }

    public addChild(child: Node) {
        this.addChildAt(child);
    }

    public addChildAt(child: Node, index?: number): Node {
        this.content.addChild(child);
        if (index != undefined)
            child.setSiblingIndex(index);
        child.on(ListEvent.CLICK_ITEM, this.onClickItem, this);
        return child;
    }

    public getChildAt(index: number) {
        return this.content.children[index];
    }

    public addItem(node: Node): Node {
        if (!node)
            node = instantiate(this.defaultItem);
        this.content.addChild(node);
        return node;
    }

    public addItemFromPool(node?: Node): Node {
        const obj = this.getFromPool(node);
        this.content.addChild(obj);
        return obj;
    }

    public removeChildAt(index: number): Node {
        var child: Node = this.content.children[index];
        this.content.removeChild(child);
        return child;
    }

    public removeChildToPoolAt(index: number): void {
        var child: Node = this.removeChildAt(index);
        this.returnToPool(child);
    }

    public removeChildToPool(child: Node): void {
        this.content.removeChild(child);
        this.returnToPool(child);
    }

    public removeChildrenToPool(beginIndex?: number, endIndex?: number): void {
        if (beginIndex == undefined) beginIndex = 0;
        if (endIndex == undefined) endIndex = -1;
        if (endIndex < 0 || endIndex >= this.content.children.length)
            endIndex = this.content.children.length - 1;

        for (var i: number = beginIndex; i <= endIndex; ++i)
            this.removeChildToPoolAt(beginIndex);
    }

    private onClickItem(item: Node): void {
        if (this._scrollPane && this._scrollPane.isScrolling())
            return;

        this._scrollPane.node.emit(ListEvent.CLICK_ITEM, item);
    }

    public resizeToFit(itemCount: number = Number.POSITIVE_INFINITY, minSize: number = 0): void {
        // this.ensureBoundsCorrect();

        var curCount: number = this.numItems;
        if (itemCount > curCount)
            itemCount = curCount;
        const uiTran = this.content.getComponent(UITransform);
        if (this._virtual) {
            var lineCount: number = Math.ceil(itemCount / this._curLineItemCount);
            if (this._layout.type == Layout.Type.HORIZONTAL)
                uiTran.height = lineCount * this._itemSize.height + Math.max(0, lineCount - 1) * this._lineGap;
            else
                uiTran.width = lineCount * this._itemSize.width + Math.max(0, lineCount - 1) * this._columnGap;
        }
        else if (itemCount == 0) {
            if (this._layout.type == Layout.Type.HORIZONTAL)
                uiTran.height = minSize;
            else
                uiTran.height = minSize;
        }
        else {
            var i: number = itemCount - 1;
            var obj: Node = null;
            while (i >= 0) {
                obj = this.content.children[i];
                if (!this.foldInvisibleItems || obj.active)
                    break;
                i--;
            }
            if (i < 0) {
                if (this._layout.type == Layout.Type.HORIZONTAL)
                    uiTran.height = minSize;
                else
                    uiTran.width = minSize;
            }
            else {
                var size: number = 0;
                if (this._layout.type == Layout.Type.HORIZONTAL) {
                    size = obj.getPosition().y + obj.getComponent(UITransform).height;
                    if (size < minSize)
                        size = minSize;
                    uiTran.height = size;
                }
                else {
                    size = obj.getPosition().x + obj.getComponent(UITransform).height;
                    if (size < minSize)
                        size = minSize;
                    uiTran.width = size;
                }
            }
        }
    }

    public getMaxItemWidth(): number {
        var cnt: number = this.content.children.length;
        var max: number = 0;
        for (var i: number = 0; i < cnt; i++) {
            var child: Node = this.content.children[i];
            if (child.getComponent(UITransform).width > max)
                max = child.getComponent(UITransform).width;
        }
        return max;
    }

    public scrollToView(index: number, ani?: boolean, setFirst?: boolean): void {
        if (this._virtual) {
            if (this._numItems == 0)
                return;

            this.checkVirtualList();

            if (index >= this._virtualItems.length)
                throw "Invalid child index: " + index + ">" + this._virtualItems.length;

            if (this._loop)
                index = Math.floor(this._firstIndex / this._numItems) * this._numItems + index;

            var rect: Rect;
            var ii: ItemInfo = this._virtualItems[index];
            var pos: number = 0;
            var i: number;
            if (this._layout.type == Layout.Type.HORIZONTAL) {
                for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount)
                    pos += this._virtualItems[i].height + this._lineGap;
                rect = new Rect(0, pos, this._itemSize.width, ii.height);
            }
            else if (this._layout.type == Layout.Type.VERTICAL) {
                for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount)
                    pos += this._virtualItems[i].width + this._columnGap;
                rect = new Rect(pos, 0, ii.width, this._itemSize.height);
            }
            else {
                var page: number = index / (this._curLineItemCount * this._curLineItemCount2);
                rect = new Rect(page * this._scrollPane.view.width + (index % this._curLineItemCount) * (ii.width + this._columnGap),
                    (index / this._curLineItemCount) % this._curLineItemCount2 * (ii.height + this._lineGap),
                    ii.width, ii.height);
            }

            // if (this._scrollPane)
            //     this._scrollPane.scrollToView(rect, ani, setFirst);
            // this._scrollPane.scrollTo()
        }
        else {
            var obj: Node = this.getChildAt(index);
            if (obj) {
                // if (this._scrollPane)
                //     this._scrollPane.scrollToView(obj, ani, setFirst);
                // else if (this.parent && this.parent.scrollPane)
                //     this.parent.scrollPane.scrollToView(obj, ani, setFirst);
            }
        }
    }

    private getItemPos(index: number) {
        switch (this._layout.type) {
            case Layout.Type.HORIZONTAL:
                switch (this._layout.horizontalDirection) {
                    case Layout.HorizontalDirection.LEFT_TO_RIGHT:
                        break;
                    case Layout.HorizontalDirection.RIGHT_TO_LEFT:
                        break;
                }
                break;
            case Layout.Type.VERTICAL:
                switch (this._layout.verticalDirection) {
                    case Layout.VerticalDirection.TOP_TO_BOTTOM:
                        break;
                    case Layout.VerticalDirection.BOTTOM_TO_TOP:
                        break;
                }
                break;
            case Layout.Type.GRID:
                switch (this._layout.startAxis) {
                    case Layout.AxisDirection.HORIZONTAL:
                        break;
                    case Layout.AxisDirection.VERTICAL:
                        break;
                }
                break;
        }
    }

    public childIndexToItemIndex(index: number): number {
        if (!this._virtual)
            return index;

        if (this._layout.type == Layout.Type.GRID) {
            for (var i: number = this._firstIndex; i < this._realNumItems; i++) {
                if (this._virtualItems[i].obj) {
                    index--;
                    if (index < 0)
                        return i;
                }
            }

            return index;
        }
        else {
            index += this._firstIndex;
            if (this._loop && this._numItems > 0)
                index = index % this._numItems;

            return index;
        }
    }

    public itemIndexToChildIndex(index: number): number {
        if (!this._virtual)
            return index;

        if (this._layout.type == Layout.Type.GRID) {
            return this._virtualItems[index].obj.getSiblingIndex();
        }
        else {
            if (this._loop && this._numItems > 0) {
                var j: number = this._firstIndex % this._numItems;
                if (index >= j)
                    index = index - j;
                else
                    index = this._numItems - j + index;
            }
            else
                index -= this._firstIndex;

            return index;
        }
    }

    public setVirtual(): void {
        this._setVirtual(false);
    }

    /// <summary>
    /// Set the list to be virtual list, and has loop behavior.
    /// </summary>
    public setVirtualAndLoop(): void {
        this._setVirtual(true);
    }

    /// <summary>
    /// Set the list to be virtual list.
    /// </summary>
    private _setVirtual(loop: boolean): void {
        if (!this._virtual) {
            this._virtual = true;
            this._loop = loop;
            this._virtualItems = new Array<ItemInfo>();
            this.removeChildrenToPool();

            if (this._itemSize == null) {
                this._itemSize = new Size(0, 0);
                var obj: Node = this.getFromPool(null);
                if (!obj) {
                    throw "Virtual List must have a default list item resource.";
                }
                else {
                    this._itemSize.width = obj.getComponent(UITransform).width;
                    this._itemSize.height = obj.getComponent(UITransform).height;
                }
                this.returnToPool(obj);
            }

            this.setVirtualListChangedFlag(true);
        }
    }

    /// <summary>
    /// Set the list item count. 
    /// If the list is not virtual, specified number of items will be created. 
    /// If the list is virtual, only items in view will be created.
    /// </summary>
    public get numItems(): number {
        if (this._virtual)
            return this._numItems;
        else
            return this.content.children.length;
    }

    public set numItems(value: number) {
        if (this._virtual) {
            if (this.itemRenderer == null)
                throw "Set itemRenderer first!";

            this._numItems = value;
            if (this._loop)
                this._realNumItems = this._numItems * 6;//设置6倍数量，用于循环滚动
            else
                this._realNumItems = this._numItems;

            //_virtualItems的设计是只增不减的
            var oldCount: number = this._virtualItems.length;
            if (this._realNumItems > oldCount) {
                for (i = oldCount; i < this._realNumItems; i++) {
                    var ii: ItemInfo = {
                        width: this._itemSize.width,
                        height: this._itemSize.height,
                        updateFlag: 0
                    };

                    this._virtualItems.push(ii);
                }
            }

            if (this._virtualListChanged != 0)
                this._scrollPane.unschedule(this._refreshVirtualList);

            //立即刷新
            this._refreshVirtualList();
        }
        else {
            var cnt: number = this.content.children.length;
            if (value > cnt) {
                for (var i: number = cnt; i < value; i++) {
                    if (this.itemProvider == null)
                        this.addItemFromPool();
                    else
                        this.addItemFromPool(this.itemProvider(i));
                }
            }
            else {
                this.removeChildrenToPool(value, cnt);
            }
            if (this.itemRenderer != null) {
                for (i = 0; i < value; i++)
                    this.itemRenderer(i, this.content.children[i]);
            }
        }
    }

    public refreshVirtualList(): void {
        this.setVirtualListChangedFlag(false);
    }

    private checkVirtualList(): void {
        if (this._virtualListChanged != 0) {
            this._refreshVirtualList();
            this._scrollPane.unschedule(this._refreshVirtualList);
        }
    }

    private setVirtualListChangedFlag(layoutChanged: boolean): void {
        if (layoutChanged)
            this._virtualListChanged = 2;
        else if (this._virtualListChanged == 0)
            this._virtualListChanged = 1;

        this._scrollPane.scheduleOnce(this._refreshVirtualList);
    }

    private _refreshVirtualList(dt?: number): void {
        if (!isNaN(dt)) {
            return;
        }
        const scrollUITran = this._scrollPane.getComponent(UITransform);
        var layoutChanged: boolean = this._virtualListChanged == 2;
        this._virtualListChanged = 0;
        this._eventLocked = true;

        if (layoutChanged) {
            if (this._layout.type == Layout.Type.VERTICAL)
                this._curLineItemCount = 1;
            else //pagination
            {
                if (this._columnCount > 0)
                    this._curLineItemCount = this._columnCount;
                else {
                    this._curLineItemCount = Math.floor((scrollUITran.width + this._columnGap) / (this._itemSize.width + this._columnGap));
                    if (this._curLineItemCount <= 0)
                        this._curLineItemCount = 1;
                }

                if (this._lineCount > 0)
                    this._curLineItemCount2 = this._lineCount;
                else {
                    this._curLineItemCount2 = Math.floor((scrollUITran.height + this._lineGap) / (this._itemSize.height + this._lineGap));
                    if (this._curLineItemCount2 <= 0)
                        this._curLineItemCount2 = 1;
                }
            }
        }

        this._eventLocked = false;

        this.handleScroll(true);
    }

    private getIndexOnPos1(forceUpdate: boolean): number {
        if (this._realNumItems < this._curLineItemCount) {
            s_n = 0;
            return 0;
        }

        var i: number;
        var pos2: number;
        var pos3: number;

        if (this.content.children.length > 0 && !forceUpdate) {
            pos2 = this.content.children[0].getPosition().y + this.content.children[0].getComponent(UITransform).height / 2;
            if (pos2 > s_n) {
                for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                    pos2 -= (this._virtualItems[i].height + this._lineGap);
                    if (pos2 <= s_n) {
                        s_n = pos2;
                        return i;
                    }
                }

                s_n = 0;
                return 0;
            }
            else {
                for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                    pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
                    if (pos3 > s_n) {
                        s_n = pos2;
                        return i;
                    }
                    pos2 = pos3;
                }

                s_n = pos2;
                return this._realNumItems - this._curLineItemCount;
            }
        }
        else {
            pos2 = 0;
            for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
                if (pos3 > s_n) {
                    s_n = pos2;
                    return i;
                }
                pos2 = pos3;
            }

            s_n = pos2;
            return this._realNumItems - this._curLineItemCount;
        }
    }

    private getIndexOnPos2(forceUpdate: boolean): number {
        if (this._realNumItems < this._curLineItemCount) {
            return 0;
        }

        var i: number;
        var pos2: number;
        var pos3: number;

        if (this.content.children.length > 0 && !forceUpdate) {
            pos2 = this.content.children[0].getPosition().x;
            if (pos2 > 0) {
                for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
                    pos2 -= (this._virtualItems[i].width + this._columnGap);
                    if (pos2 <= 0) {
                        return i;
                    }
                }

                return 0;
            }
            else {
                for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
                    pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
                    if (pos3 > 0) {
                        return i;
                    }
                    pos2 = pos3;
                }

                return this._realNumItems - this._curLineItemCount;
            }
        }
        else {
            pos2 = 0;
            for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
                pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
                if (pos3 > 0) {
                    return i;
                }
                pos2 = pos3;
            }

            return this._realNumItems - this._curLineItemCount;
        }
    }

    private getIndexOnPos3(forceUpdate: boolean): number {
        if (this._realNumItems < this._curLineItemCount) {
            return 0;
        }

        var viewWidth: number = this.content.getComponent(UITransform).width;
        var page: number = Math.floor(0 / viewWidth);
        var startIndex: number = page * (this._curLineItemCount * this._curLineItemCount2);
        var pos2: number = page * viewWidth;
        var i: number;
        var pos3: number;
        for (i = 0; i < this._curLineItemCount; i++) {
            pos3 = pos2 + this._virtualItems[startIndex + i].width + this._columnGap;
            if (pos3 > 0) {
                return startIndex + i;
            }
            pos2 = pos3;
        }

        return startIndex + this._curLineItemCount - 1;
    }

    private handleScroll(forceUpdate: boolean): void {
        if (this._eventLocked)
            return;

        if (this._layout.type == Layout.Type.VERTICAL) {
            var enterCounter: number = 0;
            while (this.handleScroll1(forceUpdate)) {
                enterCounter++;
                forceUpdate = false;
                if (enterCounter > 20) {
                    console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                    break;
                }
            }
        }
        else if (this._layout.type == Layout.Type.HORIZONTAL) {
            enterCounter = 0;
            while (this.handleScroll2(forceUpdate)) {
                enterCounter++;
                forceUpdate = false;
                if (enterCounter > 20) {
                    console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
                    break;
                }
            }
        }
        else {
            this.handleScroll3(forceUpdate);
        }
    }

    //垂直滚动
    private handleScroll1(forceUpdate: boolean): boolean {
        var pos: number = this.content.getPosition().y - this._scrollPane.view.height / 2;

        var max: number = pos + this._scrollPane.view.height;
        var end: boolean = max == this._scrollPane.content.getComponent(UITransform).height;//这个标志表示当前需要滚动到最末，无论内容变化大小

        //寻找当前位置的第一条项目
        s_n = pos;
        var newFirstIndex: number = this.getIndexOnPos1(forceUpdate);
        if (newFirstIndex == this._firstIndex && !forceUpdate) {
            return false;
        }
        console.log('当前第一个是', newFirstIndex)

        var oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;
        var curIndex: number = newFirstIndex;
        var forward: boolean = oldFirstIndex > newFirstIndex;
        var childCount: number = this.content.children.length;
        var lastIndex: number = oldFirstIndex + childCount - 1;
        var reuseIndex: number = forward ? lastIndex : oldFirstIndex;
        var curX: number = 0;
        var curY: number = pos - this._itemSize.height / 2;
        var needRender: boolean;
        var ii: ItemInfo, ii2: ItemInfo;
        var i: number, j: number;
        var node: Node;

        this.itemInfoVer++;

        while (curIndex < this._realNumItems && (end || curY > -max)) {
            ii = this._virtualItems[curIndex];

            if (!ii.obj || forceUpdate) {
                if (this.itemProvider != null) {
                    node = this.itemProvider(curIndex % this._numItems);
                    if (node == null)
                        node = instantiate(this.defaultItem);
                }
                if (ii.obj) {
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (!ii.obj) {
                //搜索最适合的重用item，保证每次刷新需要新建或者重新render的item最少
                if (forward) {
                    for (j = reuseIndex; j >= oldFirstIndex; j--) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (j = reuseIndex; j <= lastIndex; j++) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    ii.obj.setSiblingIndex(forward ? curIndex - newFirstIndex : this.content.children.length);
                }
                else {
                    ii.obj = this.getFromPool(node);
                    if (forward)
                        this.addChildAt(ii.obj, curIndex - newFirstIndex);
                    else
                        this.addChild(ii.obj);
                }

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                this.itemRenderer(curIndex % this._numItems, ii.obj);

                ii.width = Math.ceil(ii.obj.getComponent(UITransform).width);
                ii.height = Math.ceil(ii.obj.getComponent(UITransform).height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(curX, curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
                max += ii.height;

            curX += ii.width + this._columnGap;

            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                curX = 0;
                curY -= ii.height + this._lineGap;
            }
            curIndex++;
        }
        this.content.getComponent(UITransform).setContentSize(this._itemSize.width, Math.abs(curY));

        for (i = 0; i < childCount; i++) {
            ii = this._virtualItems[oldFirstIndex + i];
            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
                this.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }

        childCount = this.content.children.length;
        for (i = 0; i < childCount; i++) {
            let obj: Node = this._virtualItems[newFirstIndex + i].obj;
            if (this.content.children[i] != obj)
                obj.setSiblingIndex(i);
        }

        if (curIndex > 0 && this.content.children.length > 0 && this.content.getPosition().y <= 0 && this.getChildAt(0).getPosition().y > -this.content.getPosition().y)//最后一页没填满！
            return true;
        else
            return false;
    }

    //水平滚动
    private handleScroll2(forceUpdate: boolean): boolean {
        var pos: number = this._scrollPane.content.getPosition().x;
        var max: number = pos + this._scrollPane.view.width;
        var end: boolean = pos == this._scrollPane.content.getComponent(UITransform).width;//这个标志表示当前需要滚动到最末，无论内容变化大小

        //寻找当前位置的第一条项目
        var newFirstIndex: number = this.getIndexOnPos2(forceUpdate);
        if (newFirstIndex == this._firstIndex && !forceUpdate) {
            return false;
        }

        var oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;
        var curIndex: number = newFirstIndex;
        var forward: boolean = oldFirstIndex > newFirstIndex;
        var childCount: number = this.content.children.length;
        var lastIndex: number = oldFirstIndex + childCount - 1;
        var reuseIndex: number = forward ? lastIndex : oldFirstIndex;
        var curX: number = pos, curY: number = 0;
        var needRender: boolean;
        var ii: ItemInfo, ii2: ItemInfo;
        var i: number, j: number;

        this.itemInfoVer++;

        while (curIndex < this._realNumItems && (end || curX < max)) {
            ii = this._virtualItems[curIndex];

            if (!ii.obj || forceUpdate) {
                if (ii.obj) {
                    this.removeChildToPool(ii.obj);
                    ii.obj = null;
                }
            }

            if (!ii.obj) {
                if (forward) {
                    for (j = reuseIndex; j >= oldFirstIndex; j--) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex--;
                            break;
                        }
                    }
                }
                else {
                    for (j = reuseIndex; j <= lastIndex; j++) {
                        ii2 = this._virtualItems[j];
                        if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                            ii.obj = ii2.obj;
                            ii2.obj = null;
                            if (j == reuseIndex)
                                reuseIndex++;
                            break;
                        }
                    }
                }

                if (ii.obj) {
                    ii.obj.setSiblingIndex(forward ? curIndex - newFirstIndex : this.content.children.length);
                }
                else {
                    ii.obj = this.getFromPool();
                    if (forward)
                        this.addChildAt(ii.obj, curIndex - newFirstIndex);
                    else
                        this.addChild(ii.obj);
                }

                needRender = true;
            }
            else
                needRender = forceUpdate;

            if (needRender) {
                this.itemRenderer(curIndex % this._numItems, ii.obj);

                ii.width = Math.ceil(ii.obj.getComponent(UITransform).width);
                ii.height = Math.ceil(ii.obj.getComponent(UITransform).height);
            }

            ii.updateFlag = this.itemInfoVer;
            ii.obj.setPosition(curX, curY);
            if (curIndex == newFirstIndex) //要显示多一条才不会穿帮
                max += ii.width;

            curY += ii.height + this._lineGap;

            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                curY = 0;
                curX += ii.width + this._columnGap;
            }
            curIndex++;
        }

        for (i = 0; i < childCount; i++) {
            ii = this._virtualItems[oldFirstIndex + i];
            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
                this.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }

        childCount = this.content.children.length;
        for (i = 0; i < childCount; i++) {
            let obj: Node = this._virtualItems[newFirstIndex + i].obj;
            if (this.content.children[i] != obj)
                obj.setSiblingIndex(i);
        }

        if (curIndex > 0 && this.content.children.length > 0 && this.content.getPosition().x <= 0 && this.getChildAt(0).getPosition().x > - this.content.getPosition().x)//最后一页没填满！
            return true;
        else
            return false;
    }

    private handleScroll3(forceUpdate: boolean): void {
        var pos: number = this._scrollPane.content.getPosition().x;

        //寻找当前位置的第一条项目
        var newFirstIndex: number = this.getIndexOnPos3(forceUpdate);
        if (newFirstIndex == this._firstIndex && !forceUpdate)
            return;

        var oldFirstIndex: number = this._firstIndex;
        this._firstIndex = newFirstIndex;

        //分页模式不支持不等高，所以渲染满一页就好了

        var reuseIndex: number = oldFirstIndex;
        var virtualItemCount: number = this._virtualItems.length;
        var pageSize: number = this._curLineItemCount * this._curLineItemCount2;
        var startCol: number = newFirstIndex % this._curLineItemCount;
        var viewWidth: number = this._scrollPane.view.width;
        var page: number = Math.floor(newFirstIndex / pageSize);
        var startIndex: number = page * pageSize;
        var lastIndex: number = startIndex + pageSize * 2; //测试两页
        var needRender: boolean;
        var i: number;
        var ii: ItemInfo, ii2: ItemInfo;
        var col: number;

        this.itemInfoVer++;

        //先标记这次要用到的项目
        for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            col = i % this._curLineItemCount;
            if (i - startIndex < pageSize) {
                if (col < startCol)
                    continue;
            }
            else {
                if (col > startCol)
                    continue;
            }

            ii = this._virtualItems[i];
            ii.updateFlag = this.itemInfoVer;
        }

        var lastObj: Node = null;
        var insertIndex: number = 0;
        for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            ii = this._virtualItems[i];
            if (ii.updateFlag != this.itemInfoVer)
                continue;

            if (!ii.obj) {
                //寻找看有没有可重用的
                while (reuseIndex < virtualItemCount) {
                    ii2 = this._virtualItems[reuseIndex];
                    if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
                        ii.obj = ii2.obj;
                        ii2.obj = null;
                        break;
                    }
                    reuseIndex++;
                }

                if (insertIndex == -1)
                    insertIndex = lastObj.getSiblingIndex() + 1;

                if (!ii.obj) {
                    ii.obj = this._pool.get(this.itemProvider);
                    this.addChildAt(ii.obj, insertIndex);
                }
                else {
                    ii.obj.setSiblingIndex(insertIndex);//this.setChildIndexBefore(ii.obj, insertIndex);
                }
                insertIndex++;

                needRender = true;
            }
            else {
                needRender = forceUpdate;
                insertIndex = -1;
                lastObj = ii.obj;
            }

            if (needRender) {
                this.itemRenderer(i % this._numItems, ii.obj);
                ii.width = Math.ceil(ii.obj.getComponent(UITransform).width);
                ii.height = Math.ceil(ii.obj.getComponent(UITransform).height);
            }
        }

        //排列item
        var borderX: number = (startIndex / pageSize) * viewWidth;
        var xx: number = borderX;
        var yy: number = 0;
        var lineHeight: number = 0;
        for (i = startIndex; i < lastIndex; i++) {
            if (i >= this._realNumItems)
                continue;

            ii = this._virtualItems[i];
            if (ii.updateFlag == this.itemInfoVer)
                ii.obj.setPosition(xx, yy);

            if (ii.height > lineHeight)
                lineHeight = ii.height;
            if (i % this._curLineItemCount == this._curLineItemCount - 1) {
                xx = borderX;
                yy += lineHeight + this._lineGap;
                lineHeight = 0;

                if (i == startIndex + pageSize - 1) {
                    borderX += viewWidth;
                    xx = borderX;
                    yy = 0;
                }
            }
            else
                xx += ii.width + this._columnGap;
        }

        //释放未使用的
        for (i = reuseIndex; i < virtualItemCount; i++) {
            ii = this._virtualItems[i];
            if (ii.updateFlag != this.itemInfoVer && ii.obj) {
                this.removeChildToPool(ii.obj);
                ii.obj = null;
            }
        }
    }
}