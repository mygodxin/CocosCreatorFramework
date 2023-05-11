//参考fgui中的GList实现 

import { Component, instantiate, Layout, Node, NodePool, Prefab, Rect, ScrollView, Size, UITransform, _decorator, Pool, Vec2, NodeEventType, error, Vec3, Enum } from "cc";
const { ccclass, property } = _decorator;

enum ListLayoutType {
    SingleColumn,
    SingleRow,
    FlowHorizontal,
    FlowVertical,
    Pagination
}

class ItemInfo {
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
export type ListItemProvider = (index: number) => Node;

export const ListEvent = {
    CLICK_ITEM: "CLICK_ITEM"
}

var s_n: number = 0;
/** 列表 */
@ccclass
export class GList extends Component {
    /** 列表刷新回调 */
    public itemRenderer: ListItemRenderer;
    /** 列表项 */
    public itemProvider: ListItemProvider;
    private _virtual: boolean;
    private _loop: boolean;
    private _pool: Pool<Node>;
    private _numItems: number;
    private _realNumItems: number;
    private _itemSize: Size = new Size();
    private _children: Node[];
    public get children(): Node[] {
        return this._children;
    }
    public data: any;
    _firstIndex: number; //the top left index
    _curLineItemCount: number; //item count in one line
    _curLineItemCount2: number; //只用在页面模式，表示垂直方向的项目数
    _autoResizeItem: boolean;
    @property({ type: Number, tooltip: '行距' })
    public lineGap: number = 0;
    @property({ type: Number, tooltip: '列距' })
    public columnGap: number = 0;
    private _lineCount: number;
    private _columnCount: number;
    @property({ type: Enum(ListLayoutType), tooltip: '行距' })
    public layout: ListLayoutType;
    public scrollRect: ScrollView;
    @property({ type: Node, tooltip: '默认Item' })
    public defaultItem: Node;

    private _virtualItems: ItemInfo[];

    protected onLoad() {
        this.scrollRect = this.getComponent(ScrollView);
        // this.content = this._scrollPane.content;
        // this._uiTransform = this._scrollPane.view;
        // this._pool = new NodePool();
        // this._layout = this.content.getComponent(Layout)
        // //获取layout布局并禁用掉
        // this._layout.enabled = false;
        // this._selectionMode = ListSelectionMode.Single;
        // this._columnGap = this._layout.spacingX;
        // this._lineGap = this._layout.spacingY;

        // scrollRect = GetComponent<ScrollRect>();
        if (this.scrollRect == null) {
            throw new Error("[GList]scrollRect is null");
        }
        if (this.defaultItem == null) {
            throw new Error("[GList]defaultItem is null");
        }

        //监听滚动
        this.scrollRect.node.on(ScrollView.EventType.SCROLLING, this.OnScroll, this);

        this.defaultItem.active = false;
        var itemRect = this.defaultItem.getComponent(UITransform).contentSize;
        this._itemSize.set(itemRect.width, itemRect.height);
        //Debug.Log("item宽=" + itemRect.width + ",高=" + itemRect.height);
        this._pool = new Pool(() => {
            return instantiate(this.defaultItem)
        }, 2);
        this._children = [];
    }
    private OnScroll(): void {
        if (this.layout == ListLayoutType.SingleColumn || this.layout == ListLayoutType.FlowHorizontal) {
            this.handleScroll1();
        }
        else if (this.layout == ListLayoutType.SingleRow || this.layout == ListLayoutType.FlowVertical) {
            this.handleScroll2();
        }
        else {
            this.handleScroll3();
        }
    }
    private handleScroll1(): void {
        if (this._realNumItems <= 0) return;

        var itemHeight = this._itemSize.y;
        var contentY = this.scrollRect.content.position.y;
        var index = Math.floor(contentY / (itemHeight + this.lineGap));
        index = index < 0 ? 0 : index;
        var startY = -index * itemHeight - this.lineGap * index;
        var curIndex = 0;
        var curX = 0, curY = startY;
        //Debug.Log("contentY=" + contentY + ",index=" + index);
        //没到最后一行时多加一列防止滚动穿帮
        var maxY = Math.max(curY - this.scrollRect.getComponent(UITransform).contentSize.height - itemHeight, -this.scrollRect.content.getComponent(UITransform).height);

        while (index * this._curLineItemCount + curIndex < this._realNumItems && (curY > maxY)) {
            var item = this._virtualItems[curIndex];

            if (item.obj == null) {
                var obj = this.addItemFromPool();
                item.obj = obj;
                var size = obj.getComponent(UITransform).contentSize;
                item.width = size.width;
                item.height = size.height;
            }

            item.obj.setPosition(curX, curY);
            item.obj.scale = Vec3.ONE;

            this.itemRenderer(index * this._curLineItemCount + curIndex, item.obj);

            curX += item.width + this.columnGap;
            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                curX = 0;
                curY -= item.height + this.lineGap;
            }

            curIndex++;
        }
    }

    private handleScroll2(): void {
        if (this._realNumItems <= 0) return;

        var itemWidth = this._itemSize.x;
        var contentX = this.scrollRect.content.position.x;
        var index = Math.floor(contentX / (itemWidth + this.columnGap));
        index = index < 0 ? 0 : index;
        var startX = -index * itemWidth - this.columnGap * index;
        var curIndex = 0;
        var curX = startX, curY = 0;
        //Debug.Log("contentY=" + contentY + ",index=" + index);
        //没到最后一行时多加一列防止滚动穿帮
        var maxX = Math.max(curX - this.scrollRect.getComponent(UITransform).width - itemWidth, -this.scrollRect.content.getComponent(UITransform).width);

        while (curIndex < this._realNumItems && (curX > maxX)) {
            var item = this._virtualItems[curIndex];

            if (item.obj == null) {
                var obj = this.addItemFromPool();
                item.obj = obj;
            }

            item.obj.setPosition(curX, curY);
            item.obj.scale = Vec3.ONE;

            this.itemRenderer(index * this._curLineItemCount + curIndex, item.obj);

            curY -= item.height + this.lineGap;

            if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
                curY = 0;
                curX += item.width + this.columnGap;
            }
            curIndex++;
        }
    }

    private handleScroll3(): void {

    }

    public setVirtual(loop: boolean = false) {
        if (!this._virtual) {
            if (loop) {

            }

            this._virtual = true;
            this._loop = loop;
            this._virtualItems = [];
            //RemoveChildrenToPool();

            if (this._itemSize.x == 0 || this._itemSize.y == 0) {
                var obj = this._pool.alloc();
                if (obj == null) {
                    error("FairyGUI: Virtual List must have a default list item resource.");
                    this._itemSize = new Size(100, 100);
                }
                else {
                    this._itemSize = obj.getComponent(UITransform).contentSize;
                    this._itemSize.x = Math.ceil(this._itemSize.x);
                    this._itemSize.y = Math.ceil(this._itemSize.y);
                    this._pool.free(obj);
                }
            }
        }
    }
    public get numItems(): number {
        if (this._virtual)
            return this._numItems;
        else
            return this._children.length;
    }
    public set numItems(value: number) {
        if (this._virtual) {
            if (this.itemRenderer == null)
                throw new error("please set itemRenderer");
            this._numItems = value;

            if (this._loop)
                this._realNumItems = this._numItems * 6;//设置6倍数量，用于循环滚动
            else
                this._realNumItems = this._numItems;

            //_virtualItems的设计是只增不减的
            var oldCount = this._virtualItems.length;
            if (this._realNumItems > oldCount) {
                for (var i = oldCount; i < this._realNumItems; i++) {
                    var ii = new ItemInfo();
                    ii.width = this._itemSize.width;
                    ii.height = this._itemSize.height;

                    this._virtualItems.push(ii);
                }
            }
            else {
                // for (var i = this._realNumItems; i < oldCount; i++)
                //     this._virtualItems[i].selected = false;
            }
            this.refreshContentSize();
            //立即刷新
            this.OnScroll();
        }
        else {
            var cnt = this._children.length;
            if (value > cnt) {
                for (var i = cnt; i < value; i++) {
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
                for (var i = 0; i < value; i++)
                    this.itemRenderer(i, this._children[i]);
            }
        }
        this.refreshContentSize();
    }

    private refreshContentSize(): void {
        //计算横向item数量
        var viewRect = this.scrollRect.getComponent(UITransform);
        var viewWidth = viewRect.width;
        var viewHeight = viewRect.height;
        var contentWidth = this.scrollRect.content.getComponent(UITransform).width;
        var contentHeight = this.scrollRect.content.getComponent(UITransform).height;
        if (this.layout == ListLayoutType.SingleColumn || this.layout == ListLayoutType.SingleRow)
            this._curLineItemCount = 1;
        else if (this.layout == ListLayoutType.FlowHorizontal) {
            if (this._columnCount > 0)
                this._curLineItemCount = this._columnCount;
            else {
                this._curLineItemCount = Math.floor((viewWidth + this.columnGap) / (this._itemSize.x + this.columnGap));
                if (this._curLineItemCount <= 0)
                    this._curLineItemCount = 1;
            }
        }
        else if (this.layout == ListLayoutType.FlowVertical) {
            if (this._lineCount > 0)
                this._curLineItemCount = this._lineCount;
            else {
                this._curLineItemCount = Math.floor((viewHeight + this.lineGap) / (this._itemSize.y + this.lineGap));
                if (this._curLineItemCount <= 0)
                    this._curLineItemCount = 1;
            }
        }
        else //pagination
        {
            if (this._columnCount > 0)
                this._curLineItemCount = this._columnCount;
            else {
                this._curLineItemCount = Math.floor((viewWidth + this.columnGap) / (this._itemSize.x + this.columnGap));
                if (this._curLineItemCount <= 0)
                    this._curLineItemCount = 1;
            }

            if (this._lineCount > 0)
                this._curLineItemCount2 = this._lineCount;
            else {
                this._curLineItemCount2 = Math.floor((viewHeight + this.lineGap) / (this._itemSize.y + this.lineGap));
                if (this._curLineItemCount2 <= 0)
                    this._curLineItemCount2 = 1;
            }
        }

        var ch = 0, cw = 0;
        if (this._realNumItems > 0) {
            var len = Math.ceil(this._realNumItems / this._curLineItemCount) * this._curLineItemCount;
            var len2 = Math.min(this._curLineItemCount, this._realNumItems);
            if (this.layout == ListLayoutType.SingleColumn || this.layout == ListLayoutType.FlowHorizontal) {
                for (var i = 0; i < len; i += this._curLineItemCount)
                    ch += this._virtualItems[i].height + this.lineGap;
                if (ch > 0)
                    ch -= this.lineGap;

                if (this._autoResizeItem)
                    cw = viewWidth;
                else {
                    for (var i = 0; i < len2; i++)
                        cw += this._virtualItems[i].width + this.columnGap;
                    if (cw > 0)
                        cw -= this.columnGap;
                }
            }
            else if (this.layout == ListLayoutType.SingleRow || this.layout == ListLayoutType.FlowVertical) {
                for (var i = 0; i < len; i += this._curLineItemCount)
                    cw += this._virtualItems[i].width + this.columnGap;
                if (cw > 0)
                    cw -= this.columnGap;

                if (this._autoResizeItem)
                    ch = viewHeight;
                else {
                    for (var i = 0; i < len2; i++)
                        ch += this._virtualItems[i].height + this.lineGap;
                    if (ch > 0)
                        ch -= this.lineGap;
                }
            }
            else {
                var pageCount = Math.ceil(len / (this._curLineItemCount * this._curLineItemCount2));
                cw = pageCount * viewWidth;
                ch = viewHeight;
            }
        }

        this.scrollRect.content.getComponent(UITransform).setContentSize(new Size(cw, ch));
        //Debug.Log("滚动视图宽高cw=" + cw + ",ch=" + ch);
        //Debug.Log("查看滚动视图宽高cw=" + scrollRect.content.rect.width + ",ch=" + scrollRect.content.rect.height);
    }

    public addItemFromPool(item: Node = null): Node {
        var obj = this._pool.alloc();
        obj.parent = this.scrollRect.content;
        obj.active =  true;
        this._children.push(obj);
        return obj;
    }
    public removeChildrenToPool(beginIndex: number, endIndex: number): void {
        if (endIndex < 0 || endIndex >= this._children.length)
            endIndex = this._children.length - 1;

        for (var i = beginIndex; i <= endIndex; ++i) {
            this._pool.free(this._children[i]);
            this._children.splice(i, 1);
        }
    }
}