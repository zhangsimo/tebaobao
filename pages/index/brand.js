// brand.js
const app = getApp();
var goodsId = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brandData: [],
    goods: [],
    pageSize: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    goodsId = options.id;
    this.loadData(goodsId, this.data.pageSize);
  },

  loadData: function(goodsId, pageSize) {
    var that = this;
    wx.request({
      url: app.globalData.indexUrl + "homeVip/brand&act=brand_view",
      data: {
        brand_id: goodsId,
        page: pageSize
      },
      success: function(res) {
        if (res.data.status.succeed === 1) {
          that.setData({
            goods: that.data.goods.concat(res.data.data.goods),
            brandData: that.data.brandData.concat(res.data.data)
          });
        }
      },
      fail: function(res) {
        
      }
    })
  },

  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    this.setData({
      pageSize: --this.data.pageSize
    });
    this.loadData(goodsId, this.data.pageSize);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      pageSize: ++this.data.pageSize
    });
    this.loadData(goodsId, this.data.pageSize);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})