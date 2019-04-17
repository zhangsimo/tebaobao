// pages/live/new.js
const app = getApp();
// 初始化七牛相关参数
function initQiniu() {

  var qiniuUploader = require("../../utils/qiniuUploader");

  var options = {
    region: 'ECN', // 华东区
    uptokenURL: app.globalData.apiUrl + 'site/upload-token'
  };
  qiniuUploader.init(options);

  return qiniuUploader;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    files: [],
    categories:null,
    categoryIndex:0,
    goodsIds: [],
    chooseGoods:[],
    liveDirections: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCategories();
    var obj = [{
      value: 1,
      name: '竖屏',
      checked: 'true'
    },{
      value: 0,
      name: '横屏'
    }];
    this.setData({
      liveDirections: obj
    })
  },

  radioChange: function(e) {
    this.setData({
      direction: e.detail.value
    })
  },

  getCategories:function (){
    var that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app.globalData.apiUrl + 'live&act=categories',
      success: function (res) {
        that.setData({
          categories:res.data.data
        });
      },
      fail: function(res){
        
      },
      complete: function(res){
        wx.hideNavigationBarLoading();
      }
    });
  },

  titleInput: function(e){
    this.data.title = e.detail.value;
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      count: 1,
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempArray = [];
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          tempArray.push({ file: res.tempFilePaths[i], progress: 0, url: null });
        }

        that.setData({
          files: tempArray
        });

        for (var j = 0; j < res.tempFilePaths.length; j++) {

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

  goodsList: function(e){
    wx.navigateTo({
      url: 'goodsList',
    });
  },

  submit: function (e) {
    var that = this;

    if(that.data.title == ''){
      wx.showToast({
        title: '请输入标题',
        icon:'none'
      });
      return;
    }

    if (that.data.files.length==0){
      wx.showToast({
        title: '请上传封面',
        icon:'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '创建直播中',
    });
    var url = that.data.files[0].url.slice(4);
    wx.request({
      url: app.globalData.apiUrl + "live&act=create&token="+wx.getStorageSync('token')+'&shop_token='+wx.getStorageSync('shop_token'),
      method: "POST",
      data: {
        cover: "http://static.tebaobao.com/" + url, 
        title: that.data.title, 
        categoryId: that.data.categories[that.data.categoryIndex].id, 
        product: that.data.goodsIds,
        direction: that.data.direction
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.navigateBack({
          });
        }
      },
      fail: function (res) {

      },
      complete: function (res) {
        wx.hideLoading();
      }

    });
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
    this.setData({
      chooseGoods: this.data.chooseGoods
    });
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