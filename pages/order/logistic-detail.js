// pages/order/logistic-detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isNoNetError: true,
    com: "",
    nu: "",
    status:"",
    express_name: "",
    data:null
  },

  loadData:function(res){
    var that = this;
    wx.request({
      url: app.globalData.apiUrl +"order/logistic-detail&token="+wx.getStorageSync("token"),
      method:"POST",
      data: {com: that.data.com, nu: that.data.nu},
      success:function(res){
        console.log(res);

        that.setData({
          isNoNetError: true
        });

        if(res.data.code == 0){
          that.setData({
            express_name: res.data.data.express_name,
            status: res.data.data.status, 
            data: res.data.data.logistic_data
          });
        }
      },
      fail: function(res){
        that.setData({
          isNoNetError: true
        });
      },
      complete: function(res){
        that.setData({
          isLoading:false
        });

        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      com: options.com,
      nu: options.num
    });

    this.loadData();

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