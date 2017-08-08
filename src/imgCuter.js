    /**
 * @ignore
 * Created by xiaojianli@pptv.com on 2016/1/19.
 * 图片剪切插件
 */
;(function(){
    var doc = document;

    /**
     * <h2>图片剪切插件</h2>
     * 对外暴露为：PDIKit.ImgCuter<br>
     *    &nbsp;&nbsp;&nbsp;&nbsp;初始化示例:
     *    <pre>
     *    var imgCuter = new PDIKit.ImgCuter({
     *          parentElement:document.getElementById('imgCuterBox'),
     *          origImgUrl:'1.jpg'
     *     });
     *    </pre>
     * @class PDIKit.ImgCuter
     * @cfg {String} parentElement
     * 需要初始化组件的父节点
     * @cfg {Number} proportion
     * 裁剪区域的长宽比例 4/3  0.75  默认是1/1
     * @cfg {Number} cutOriWidth
     * 裁剪区域的原始宽度 默认120
     * @cfg {Number} imgDefaultHeight
     * 裁剪区域的默认高度
     * @cfg {Number} maxHeightProportion
     * 图片的最大高度与屏幕的比例
     * @cfg {Boolean} showPeiview
     * 是否显示预览图 默认不显示
     * @cfg {Object} uploadMethod
     * 执行上传的方法
     * @cfg {String} btnWidth
     * 选择图片按钮的宽度
     * @cfg {String} btnHeight
     * 选择图片按钮的高度
     *
     */
    var ImgCuter = function(opt){
        this.parentElement = opt.parentElement;
        this.proportion=opt.proportion || 1;
        this.cutOriWidth = opt.cutOriWidth || 120;
        this.imgDefaultHeight = opt.imgDefaultHeight;
        this.maxHeightProportion = opt.maxHeightProportion;
        this.origImgUrl = opt.origImgUrl || null;
        this.showPriview = opt.showPriview || false;
        this.uploadMethod = opt.uploadMethod || function(){};
        this.btnWidth = opt.btnWidth || null;
        this.btnHeight = opt.btnHeight || null;
        this.afterRender = opt.afterRender || null;
        //预览图的缩放比例
        this.scaleSize = 1 ;
        //原图的显示宽度
        this.iwh = 0;
        //图片的真实宽度
        this.imgRealWidth='';
        //图片的真实高度
        this.imgRealHeight='';
        //上一次移动的宽度(用来判断裁剪区域是放大还是缩小)
        this.lastWidth=0;
        //插件下的所有dom节点
        this.dom={};
        this.self = {};
        //显示图片区域的宽
        this.cutBoxWidth=0;
        //显示图片区域的高
        this.cutBoxHeight =0;
        /**
         *
         * @type {{
         * x: number 裁剪起始点的x坐标
         * y: number 裁剪起始点的y坐标
         * w: number 裁剪的宽度
         * h: number 裁剪的高度
         * iw: number  原图片的宽度
         * }}
         */
        this.data = {
            x:0,
            y:0,
            w:this.cutOriWidth,
            h:this.cutOriWidth/this.proportion,
            iw:0
        }

        this.init();
    };
    /**
     * @method
     *  内部调用的方法  用于初始化插件的骨架
     * @private
     * @param {Function}cb  回调方法
     */
    var initComps = function(cb){
        //doc.createElement()
        //创建一个父容器
        var cutBox = doc.createElement('div');
        cutBox.className='img-cut-box';
        var imgBox = doc.createElement('div');
        imgBox.className='clearfix';

        //创建一个原图的裁剪区域
        var imgCutBox = doc.createElement('div');
        this.dom.imgCutBox = imgCutBox;
        imgCutBox.className = 'img-cut-box';

        //裁剪区域的上部分
        var aroundTop = doc.createElement('div');
        aroundTop.className='img-around around-top';
        this.dom.aroundTop=aroundTop;
        imgCutBox.appendChild(aroundTop);
        //裁剪区域的左边区域
        var aroundLeft = doc.createElement('div');
        aroundLeft.className='img-around around-left';
        this.dom.aroundLeft=aroundLeft;
        imgCutBox.appendChild(aroundLeft);
        //裁剪区域的中心区域
        var aroundCenter = doc.createElement('div');
        aroundCenter.className='around-center';
        aroundCenter.style.visibility = 'hidden';
        this.dom.aroundCenter=aroundCenter;
        //缩放区域
        var scaleArea = doc.createElement('div');
        this.dom.scaleArea=scaleArea;
        scaleArea.className = 'scale-area';
        scaleArea.style.visibility = 'hidden';
        aroundCenter.appendChild(scaleArea);
        imgCutBox.appendChild(aroundCenter);
        //裁剪区域的右边区域
        var aroundRight = doc.createElement('div');
        aroundRight.className='img-around around-right';
        this.dom.aroundRight=aroundRight;
        imgCutBox.appendChild(aroundRight);
        //裁剪区域的下边区域
        var aroundBottom = doc.createElement('div');
        aroundBottom.className='img-around around-bottom';
        this.dom.aroundBottom=aroundBottom;
        imgCutBox.appendChild(aroundBottom);
        //原图
        var origImg = doc.createElement('img');
        //firefox下没有src属性,取不到宽度值
        origImg.src='';
        origImg.style.width = '100%';
        origImg.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)';
        //origImg.style.height = origImg.style.width / this.proportion + 'px';
        if(this.maxHeightProportion){
            //让裁剪区域最多可为屏幕的一半
            var clientHeight = document.documentElement.clientHeight||document.body.clientHeight;
            origImg.style.maxHeight = clientHeight*this.maxHeightProportion +'px';
        };

        origImg.className = 'orig-img';
        this.dom.origImg = origImg;
        //这个图片用来计算原图的宽高
        var origImgForSize = doc.getElementById('img_cut_size_fake');
        if(!origImgForSize){
            origImgForSize = doc.createElement('img')
            origImgForSize.id='img_cut_size_fake';
            doc.body.appendChild(origImgForSize);
        };
        this.dom.origImgForSize =origImgForSize;
        imgCutBox.appendChild(origImg);
        imgBox.appendChild(imgCutBox);
        //如果有预览区域就显示预览区域
        if(this.showPriview){
            //创建预览区域
            var priviewBox = doc.createElement('div');
            priviewBox.className = 'img-preview-box';
            this.dom.previewBox = priviewBox;
            //创建一个预览图片
            var priviewImg = doc.createElement('img');
            this.dom.priviewImg = priviewImg;
            priviewImg.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)';
            priviewImg.className = 'preview-img';

            priviewBox.appendChild(priviewImg);
            imgBox.appendChild(priviewBox);
        }
        if(this.origImgUrl){
            if(this.showPriview){
                priviewImg.src = this.origImgUrl;
            };
            origImg.src=this.origImgUrl;
        }
        //创建一个表单
        var form = doc.createElement('form');
        form.style.textAlign = 'center';
        form.style.paddingTop = '20px';
        this.dom.form = form;
        //文件表单
        _createInput.call(this,'file','upload',form);
        //x坐标的input
        _createInput.call(this,'hidden','x',form,this.data.x);
        //y坐标的input
        _createInput.call(this,'hidden','y',form,this.data.y);
        //裁剪宽度的input
        _createInput.call(this,'hidden','w',form,this.data.w);
        //裁剪高度的input
        _createInput.call(this,'hidden','h',form,this.data.h);
        //原图显示宽度的input
        _createInput.call(this,'hidden','iw',form,this.data.iw);
        //上传按钮
        var link = doc.createElement('a');
        link.innerHTML='上传';
        link.href='javascript:void(0);';
        link.className = 'file-btn img-upload-link';
        form.appendChild(link);
        this.dom.uploadLink = link;
        cutBox.appendChild(imgBox);
        cutBox.appendChild(form);
        this.parentElement.appendChild(cutBox);
        //让图片的初始宽度等于父容器宽度
        //origImg.style.width = imgCutBox.offsetWidth + 'px';
        if(!origImg.offsetWidth && this.imgDefaultHeight){
            origImg.style.height = this.imgDefaultHeight + 'px';
        }else{
            origImg.style.height = origImg.offsetWidth / this.proportion +'px';
        }
        //如果填了按钮的宽度就直接用
        if(this.btnWidth){
            this.dom.inputBox.style.width = this.dom.uploadInput.style.width = this.btnWidth;
            this.dom.inputBox.style.height = this.dom.uploadInput.style.height = this.btnHeight;
        }else{
            _copyWidthAndHeight(this.dom.inputBox,this.dom.chooseFileLink);
            _copyWidthAndHeight(this.dom.uploadInput,this.dom.chooseFileLink);
        };
        this.cutBoxWidth = imgCutBox.offsetWidth;
        this.cutBoxHeight = imgCutBox.offsetHeight || this.imgDefaultHeight;
    };
    //创建input
    function _createInput(type,name,form,val){
        if('file' == type){
            var inputBox = doc.createElement('span');
            //inputBox.style.display = 'inline-block';
            //inputBox.style.position = 'relative';
            this.dom.inputBox = inputBox;
            var input = doc.createElement('input');
            input.type=type;
            //input.name=name;
            input.setAttribute('name', name);
            //input.style.position = 'absolute';
            // input.style.top = 0;
            // input.style.left = 0;
            // input.style.zIndex = 10;
            // input.style.opacity = 0;
            // input.style.filter = 'alpha(opacity=0)';
            // input.style.cursor = 'pointer';
            input.className = 'choose-img-input';
            this.dom[name+'Input'] = input;
            inputBox.appendChild(input);
            var link = doc.createElement('a');
            link.href='javascript:void(0);';
            link.innerHTML='选择图片';
            link.className = 'file-btn';
            this.dom.chooseFileLink = link;
            inputBox.appendChild(link);
            inputBox.className = 'choose-img-btn-box';
            form.appendChild(inputBox);
        }else{
            var input = doc.createElement('input');
            input.type=type;
            //input.name=name;
            input.setAttribute('name', name);
            input.value = val;
            this.dom[name+'Input'] = input;
            form.appendChild(input);
        }
    };
    //复制元素的宽高
    function _copyWidthAndHeight(box,input){
        if(box && input){
            box.style.width = input.offsetWidth+1 +'px';
            box.style.height = input.offsetHeight +'px';
        }
    };
    //设置预览区域的宽
    function _setPreviewImgSize(){
        if(this.showPriview){
            this.dom.priviewImg.width = this.dom.origImg.width / this.scaleSize;
            this.dom.priviewImg.height = this.dom.origImg.height / this.scaleSize;
        };
    };
    //设置裁剪区域四边区域的大小和位置 top:裁剪区域的top值  left:裁剪区域的left值
    function _setAroundSizeAndPosition(top, left) {
        var dom = this.dom;
        dom.aroundTop.style.height = top + 'px';
        dom.aroundBottom.style.height = dom.origImg.height - top - dom.aroundCenter.offsetHeight + 'px';
        dom.aroundLeft.style.top = dom.aroundRight.style.top = dom.aroundCenter.style.top = top + 'px';
        dom.aroundLeft.style.width = dom.aroundCenter.style.left = left + 'px';
        dom.aroundRight.style.width = dom.origImg.width - left - dom.aroundCenter.offsetWidth + 'px';
        dom.aroundLeft.style.height = dom.aroundRight.style.height = dom.aroundCenter.offsetHeight + 'px';

        //设置预览区域图片的位置
        if(this.showPriview){
            dom.priviewImg.style.top = -top/this.scaleSize -4  + 'px';
            dom.priviewImg.style.left = -left/this.scaleSize -4  + 'px';
        }
    }
    //设置裁剪区域的大小
    function _setCutAreaSize(l, t) {
        if(this.lastWidth === l){
            return;
        };
        var div = this.dom.aroundCenter;
        var simg = this.dom.origImg;
        var sf = this.dom.scaleArea;

        var left = div.offsetLeft;
        var top = div.offsetTop;
        var width = div.clientWidth;
        var height = div.clientHeight;
        //设置选区的宽高 加4是为了加边框
        this.data.w = this.dom.wInput.value = width + 4;
        this.data.h = this.dom.hInput.value = height + 4;
        //防止选区超出边框 加4是加边框的宽度
        if((left+width +5) > simg.width || (top+height+5) > simg.height){
            //如果继续放大就阻止
            if(this.lastWidth < l){
                return;
            }
        }
        this.lastWidth = l;
        div.style.width = (l + 1) + 'px';
        div.style.height = (t + 1) + 'px';
        _setAroundSizeAndPosition.call(this,div.offsetTop, div.offsetLeft);
        var w = div.offsetWidth;
        this.scaleSize = w / this.cutOriWidth;
        _setPreviewImgSize.call(this);
    };
    //初始化所有参数
    function _initLayout(isLowIE){
        var _this = this;
        var imgCutBox = this.dom.imgCutBox;
        var aroundCenter = this.dom.aroundCenter;
        var priviewBox = this.dom.previewBox;
        var origImg = this.dom.origImg;
        var scaleArea = this.dom.scaleArea;
        var checkLoadTimer = null;

        origImg.onload = function(){
            //定时用来保证原图已加载完成
            checkLoadTimer = setInterval(function () {
                if(_this.imgRealWidth){
                    clearInterval(checkLoadTimer);
                    checkLoadTimer = null;
                    _afterImgLoad.call(_this,imgCutBox,aroundCenter,priviewBox,origImg,scaleArea);
                }
            },20);
        }
        if(isLowIE){
            _afterImgLoad.call(_this,imgCutBox,aroundCenter,priviewBox,origImg,scaleArea);
        }
    };
    function _afterImgLoad(imgCutBox,aroundCenter,priviewBox,origImg,scaleArea){
        var _this = this;
        scaleArea.style.visibility = 'visible';
        aroundCenter.style.visibility = 'visible';
        imgCutBox.style.width = _this.cutBoxWidth + 'px';
        imgCutBox.style.height = _this.cutBoxHeight + 'px';
        //图片容器的宽高
        var boxWidth = imgCutBox.offsetWidth;
        var boxHeight = imgCutBox.offsetHeight;
        //原图的宽高比
        var dimg = _this.imgRealWidth/_this.imgRealHeight;

        //容器的宽高比
        var dbox = boxWidth/boxHeight;
        if(dimg<dbox){
            var w = boxHeight * dimg;
            imgCutBox.style.width = parseInt(w) +'px';
            boxWidth = w;
        }else{
            var h = boxWidth / dimg;
            imgCutBox.style.height = parseInt(h) +'px';
            boxHeight = h;
        };
        _this.iwh = imgCutBox.offsetWidth;
        origImg.style.width = imgCutBox.offsetWidth + 'px';
        origImg.style.height = imgCutBox.offsetHeight + 'px';
        _this.data.iw = _this.dom.iwInput.value = imgCutBox.offsetWidth;
        var top = (boxHeight-_this.cutOriWidth/_this.proportion)/2;
        var left = (boxWidth-_this.cutOriWidth)/2;
        aroundCenter.style.left = left +'px';
        aroundCenter.style.top = top + 'px';
        _this.data.x=left;
        _this.dom.xInput.value = left;
        _this.data.y = top;
        _this.dom.yInput.value = top;
        if(_this.showPriview){
            //预览区域的高度
            priviewBox.style.height = priviewBox.offsetWidth / _this.proportion +'px';
            priviewBox.style.border = '1px dashed #999';
        };
        //裁剪区域的宽高
        aroundCenter.style.width = _this.cutOriWidth + 'px';
        aroundCenter.style.height = _this.cutOriWidth / _this.proportion +'px';
        _setPreviewImgSize.call(_this);
        _setAroundSizeAndPosition.call(_this,aroundCenter.offsetTop, aroundCenter.offsetLeft);
    };
    function _fixedEvent(e) {
        if (!e) e = window.event;
        if (!e.target) e.target = e.srcElement;
        if (!e.stopPropagation) {
            e.stopPropagation = function() {
                e.cancelBubble = true;
            };
        }

        if (!e.preventDefault) {
            e.preventDefault = function() {
                e.returnValue = false;
                return false;
            };
        }
    };
    /**
     * @method
     *  内部调用的方法  用于初始化事件
     * @private
     * @param {Function}cb  回调方法
     */
    var initEvent = function(){
        var _this = this;
        var dom = _this.dom;
        var self = _this.self;
        var origImg = dom.origImg;
        var priviewBox = dom.previewBox;
        var imgCutBox = dom.imgCutBox;
        var aroundCenter = dom.aroundCenter;
        var scaleArea = dom.scaleArea;
        var uploadInput = dom.uploadInput;
        var priviewImg = dom.priviewImg;
        var uploadLink = dom.uploadLink;
        var origImgForSize = dom.origImgForSize;
        //属性的初始化
        //_initLayout.call(_this);
        aroundCenter.onmousedown = function(e){
            e = e || window.event;
            _fixedEvent(e);
            e.preventDefault();
            e.stopPropagation();
            self.x = e.clientX - this.offsetLeft;
            self.y = e.clientY + doc.documentElement.scrollTop - this.offsetTop;

            doc.onmousemove = function (e) {
                var e = e || window.event;
                var t = e.clientY + doc.documentElement.scrollTop - self.y;
                var l = e.clientX - self.x;
                t = Math.max(t, 0);
                l = Math.max(l, 0);
                t = Math.min(t, origImg.height - aroundCenter.offsetHeight);
                l = Math.min(l, origImg.width - aroundCenter.offsetWidth);
                _setAroundSizeAndPosition.call(_this,t, l);
                _this.data.x = _this.dom.xInput.value =  aroundCenter.offsetLeft;
                _this.data.y = _this.dom.yInput.value = aroundCenter.offsetTop;
            }
        };
        scaleArea.onmouseup = doc.onmouseup = function () {
            doc.onmousemove = '';
        };
        scaleArea.onmousedown = function (e) {
            e = e || window.event;
            _fixedEvent(e);
            e.preventDefault();
            e.stopPropagation();

            self.x = e.clientX - this.offsetLeft;
            self.y = e.clientY + doc.documentElement.scrollTop - this.offsetTop;
            doc.onmousemove = function (e){
                e = e || event;
                var t = e.clientY + doc.documentElement.scrollTop - self.y;
                var width = e.clientX - self.x;
                width = Math.max(t, width);
                width = width > _this.iwh ? _this.iwh : width;
                _setCutAreaSize.call(_this,width+20, width/_this.proportion + 20);
            }
        };
        uploadInput.onchange = function(e){
            var ev = e || window.event;
            var input = ev.target || ev.srcElement;
            //处理chrome不支持读取本地文件
            if(window.FileReader){
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        var url = e.target.result;
                        origImg.src = url;
                        if(_this.showPriview){
                            priviewImg.src = url;
                        };
                        origImgForSize.style.display = 'block';
                        origImgForSize.src = url;
                        origImgForSize.onload = function () {
                            _this.imgRealWidth = origImgForSize.offsetWidth;
                            _this.imgRealHeight = origImgForSize.offsetHeight;
                            origImgForSize.style.display = 'none';
                        };
                        _initLayout.call(_this);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            }else{
                input.select();
                if (top != self) {
                    window.parent.document.body.focus()
                } else {
                    input.blur();
                }
                var imgSrc = document.selection.createRange().text;
                origImg.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = imgSrc;
                origImgForSize.style.display = 'block';
                origImgForSize.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = imgSrc;
                _this.imgRealWidth = origImgForSize.offsetWidth;
                _this.imgRealHeight = origImgForSize.offsetHeight;
                origImgForSize.style.display = 'none';
                //alert(origImgForSize.offsetWidth+'----'+origImgForSize.offsetHeight);
                if(_this.showPriview){
                    priviewImg.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = imgSrc;
                }
                origImg.style.opacity = 1;
                _initLayout.call(_this,true);
            }
        };
        uploadLink.onclick = function(e){
            e = e || window.event;
            try {
                e.preventDefault();
            } catch (o) {
                e.returnValue = false;
            };
            _this.uploadMethod && _this.uploadMethod.call(_this,_this.dom.form,_this.data,this);
        };
    };

    ImgCuter.prototype={
        constructor:ImgCuter,
        init:function(){
            var _this = this;
            initComps.call(this);
            initEvent.call(this);
            setTimeout(function(){
                _this.afterRender && _this.afterRender.call(_this);
            },0)
        },
        /**
         * @method
         * 改变图片
         * @param {String}
         *      新图片的地址
         */
        changImg:function(url) {
            var _this = this;
            _this.dom.origImg.src = url;
            if (_this.showPriview) {
                _this.dom.priviewImg.src = url;
            };
            _initLayout.call(_this);
        },
        /**
         * @method
         * 获取图片的裁剪参数
         * @returns {Object}
         *      x: number 裁剪起始点的x坐标
         *      y: number 裁剪起始点的y坐标
         *      w: number 裁剪的宽度
         *      h: number 裁剪的高度
         *      iw: number  图片显示的宽度
         */
        getData:function(){
            return this.data;
        },
        destory:function () {
            var parent = this.parentElement;
            var nodes = parent.childNodes;
            if(nodes.length>0){
                parent.removeChild(nodes[0]);
            }
            var img = this.dom.origImgForSize;
            if(img){
                var p = img.parentNode
                if(p){
                    p.removeChild(img);
                }
            };
            this.dom = null;
        }
    };
    window.PDIKit = window.PDIKit || {};
    window.PDIKit.ImgCuter = window.PDIKit.ImgCuter || ImgCuter;
}());