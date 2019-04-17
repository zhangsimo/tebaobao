// pages/order/refund.js
//仅退款页面
const app = getApp();

// 初始化七牛相关参数
function initQiniu() {
  
  var qiniuUploader = require("../../utils/qiniuUploader");

  var options = {
    region: 'ECN', // 华北区
    uptokenURL: app.globalData.apiUrl+'site/upload-token'
  };
  qiniuUploader.init(options);

  return qiniuUploader;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
    order_id: null,
    intro:"",
    total_price:'',
    goodsStatus: null,
    goodsStatusIndex: 0,
    resons: null,
    resonIndex:0,
    wordCount:0,
    reson_desc: "",
    files: [],
    submit_disabled: false
  },

  loadData: function(){
    var that = this;

    wx.request({
      url: app.globalData.apiUrl + "order/refund&token=" + wx.getStorageSync("token"),
      method: "GET",
      data: { id: that.order_id },
      success: function (res) {

        console.log(res);

        that.setData({
          isNoNetError: true
        });

        that.setData({
          isNoNetError: true,
          intro: res.data.data.intro,
          total_price: res.data.data.total_price,
          goodsStatus:res.data.data.goodsStatus,
          resons: res.data.data.resons
        });
      },

      fail: function (res) {
        that.setData({
          isNoNetError: false,
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false
        });

        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    this.order_id = options.id;
    this.request_type = options.request_type;
    this.setData({
      order_id: options.id
    });

    this.loadData();
  },

  bindGoodsStatusChange: function(e){
    this.setData({
      goodsStatusIndex: e.detail.value
    });
  },

  bindResonChange: function(e){
    
    this.setData({
      resonIndex: e.detail.value
    });
  },

  /**
   * 提交申请
   */
  submit: function(e){

    var that = this;
    var images = [];

    // console.log(that.data.files);
    // return;

    for(var i=0;i<that.data.files.length; i++){
      images[i] = that.data.files[i].url;
    }

    that.setData({
      
      submit_disabled: true
      
    });

    wx.request({
      url: app.globalData.apiUrl+"aftersale/create&token="+wx.getStorageSync("token"),
      method: "POST",
      data: { 
        order_id: that.data.order_id,
        goods_status: that.data.goodsStatus[that.data.goodsStatusIndex],
        reson: that.data.resons[that.data.resonIndex],
        reson_desc: that.data.reson_desc,
        images: images,
        request_type: that.request_type
      },
      success: function(res){
        console.log(res);

        if(res.data.code==0){
          wx.navigateBack({
            
          });
        }else{
          wx.showToast({
            title: res.data.data.msg,
            icon: 'none'
          });
        }
      },
      fail: function(res){
        
      },
      complete: function(res){
        that.setData({

          submit_disabled: false

        });
      }
    });
  },

  countWord: function(e){

    this.data.reson_desc = e.detail.value;
    this.setData(
      {
        wordCount: e.detail.value.length>300? 300: e.detail.value.length
      }
    );
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res.tempFilePaths);
        var tempArray = [];
        for (var i = 0; i < res.tempFilePaths.length; i++){
          tempArray.push({file: res.tempFilePaths[i], progress: 0, url: null});
        }

        that.setData({
          files: that.data.files.concat(tempArray)
        });

        for(var j=0; j< res.tempFilePaths.length; j++){

            var filePath = res.tempFilePaths[j];
            // 交给七牛上传
            var qiniuUploader = initQiniu();
            qiniuUploader.upload(that, filePath, (res) => {

            }, (error) => {
              console.error('error: ' + JSON.stringify(error));
            });
        }
      }
    });
  },
  previewImage: function (e) {

    var tempArray = [];

    for (var i = 0; i < this.data.files.length; i++){
      tempArray[i] = this.data.files[i].file;
    }
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: tempArray // 需要预览的图片http链接列表
    });
  },

  /**
   * 删除图片
   */
  deleteImage: function(e){
      
      var index = e.currentTarget.dataset.index;
      this.data.files.splice(index, 1);

      this.setData({
        files: this.data.files
      });

      return false;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})