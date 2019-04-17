// pages/order/after-sale.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isNoNetError: true,
    isIphonex: app.globalData.isIphonex,
    order_id:null,
    goods:null
  },

  loadData: function () {

    var that = this;

    wx.request({
      url: app.globalData.apiUrl + "order/after-sale&token=" + wx.getStorageSync("token"),
      method: "GET",
      data: { id: that.order_id },
      success: function (res) {

        console.log(res);

        that.setData({
          isNoNetError: true
        });

        that.setData({
          isNoNetError: true,
          goods: res.data.data.goods
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

    this.setData({
      order_id: options.id
    });

    this.order_id = options.id;

    this.loadData();
  },

  /**
   * 跳转到退款页面
   */
  refund: function(e){
    wx.redirectTo({
      url: 'refund?id='+this.order_id+'&request_type='+e.currentTarget.dataset.rqtype,
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