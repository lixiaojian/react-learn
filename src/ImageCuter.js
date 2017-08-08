import React from 'react';

import ReactDOM from 'react-dom';

import './imageCuter.less';

class ImageCuter extends React.Component{
    constructor(props){
        super(props);
        this.fileChange = this.fileChange.bind(this);
        this.getFileSize = this.getFileSize.bind(this);
        this.drawImg = this.drawImg.bind(this);
        this.getPixelRatio = this.getPixelRatio.bind(this);
        this.state = {
            //选中的图片
            file:null,
            //原图
            oriImg:{},
            //显示图的尺寸
            img:{
                width:0,
                height:0
            },
            //显示图的缩放倍数
            scale:1,
            //显示canvas的宽度
            canvasWidth:600,
            //显示canvas的高度
            canvasHeight:400,
            //原图的canvas上下文
            oriCtx:null
        }
    }

    //获取屏幕分辨率倍数
    getPixelRatio(context) {
        let backingStore = context.backingStorePixelRatio ||
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    };
    //选择文件
    fileChange(ev){
        let fileInput = ev.target;
        if(window.FileReader){
            if (fileInput.files && fileInput.files[0]) {
                var reader = new FileReader();
                reader.onloadend = (e) => {
                    var url = e.target.result;
                    this.setState({file:url});
                    this.getFileSize(()=>{
                        this.drawImg();
                    });
                }
                reader.readAsDataURL(fileInput.files[0]);
            }
        }else{
            fileInput.select();
            if (top != self) {
                window.parent.document.body.focus()
            } else {
                fileInput.blur();
            }
            imgUrl = document.selection.createRange().text;
        }
    }
    //获取原图片的宽高
    getFileSize(cb){
        let img = document.createElement('img');
        img.setAttribute('id','img_cut_size_fake');
        img.src = this.state.file;
        let _this = this;
        img.onload = function () {
            let width = img.offsetWidth;
            let height = img.offsetHeight;
            //设置缩放倍数
            let widthScale = _this.state.canvasWidth / width;
            let heightScale = _this.state.canvasHeight /height;
            //缩放倍数取宽高中缩放系数小的一个 并保留2位小数
            let scale = widthScale>heightScale?heightScale:widthScale;
            //这里的乘1是为了把字符串转数字
            _this.setState({oriImg:{img,width,height},scale});
            //获取宽高后，从html中移除原图
            img.parentElement.removeChild(img);
            cb && cb();
        }
        document.body.appendChild(img);
    }
    //画原图片
    drawImg(){
        let oriCtx = this.state.oriCtx;
        let oriImg = this.state.oriImg;
        //画之前先清屏
        oriCtx.clearRect(0,0,this.state.canvasWidth,this.state.canvasHeight);
        let drawImgWidth = oriImg.width * this.state.scale;
        let drawImgHeight = oriImg.height * this.state.scale;
        oriCtx.drawImage(oriImg.img,0,0,drawImgWidth,drawImgHeight);
    }
    componentDidMount(){
        //画原图的canvas
        let canvas = this.refs.orgImgCanvas;
        let oriCtx = canvas.getContext("2d");

        //以下代码处理高清屏canvas模糊
        let pixelRatio = this.getPixelRatio(oriCtx);
        canvas.width = this.state.canvasWidth * pixelRatio;
        canvas.height = this.state.canvasHeight * pixelRatio;
        this.setState({oriCtx});
        oriCtx.scale(pixelRatio, pixelRatio);
    }
    render(){
        return(
            <div className="img-cut-box">
                <div className="clearfix">
                    <div className="img-cut-box" style={{width:'600px',height:'400px'}}>
                        <div className="img-around around-top"></div>
                        <div className="img-around around-left"></div>
                        <div className="around-center" style={{visibility: 'hidden'}}>
                            <div className="scale-area" style={{visibility: 'hidden'}}></div>
                        </div>
                        <div className="img-around around-right"></div>
                        <div className="img-around around-bottom"></div>
                        <canvas ref="orgImgCanvas" className="orig-img" style={{width:this.state.canvasWidth+'px',height:this.state.canvasHeight+'px'}}></canvas>
                    </div>
                    <div className="img-preview-box">
                        <img className="preview-img" />
                    </div>
                </div>
                <form style={{textAlign: 'center', paddingTop: '20px'}}>
                    <span className="choose-img-btn-box" style={{width: '132px', height: '32px'}}>
                        <input type="file" name="upload" onChange={ev=>this.fileChange(ev)} className="choose-img-input" style={{width: '132px', height: '32px'}} />
                        <a href="javascript:void(0);" className="file-btn">选择图片</a>
                    </span>
                    <input type="hidden" name="x" value="0" />
                    <input type="hidden" name="y" value="0" />
                    <input type="hidden" name="w" value="120" />
                    <input type="hidden" name="h" value="80" />
                    <input type="hidden" name="iw" value="0" />
                    <a href="javascript:void(0);" className="file-btn img-upload-link">上传</a>
                </form>
            </div>
        )
    }
}

ReactDOM.render(<ImageCuter/>,document.getElementById('app'));
