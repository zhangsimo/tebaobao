// pages/category/goodsList.js
var app = getApp();
var categoryId = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    goods: [],
    isHideLoadMore: true,
    isNoNetError: true,
    chooseGoods:[]
  },

  loadData: function () {
    this.loadMore();
  },

  loadMore: function () {
    app.debugConsole("loadMore");
    var that = this;
    that.setData({
      isHideLoadMore: false
    });
    wx.request({
      url: app.globalData.apiUrl + "live&act=goods-list&token="+wx.getStorageSync('token'),
      data: {count: that.data.goods.length },
      success: function (res) {
        app.debugConsole(res);

        that.setData({
          isNoNetError: true
        });

        if (res.data.code == 0) {

          that.setData({
            goods: that.data.goods.concat(res.data.data.goods)
          });

        }
        wx.stopPullDownRefresh();
      },
      complete: function (res) {
        that.setData({
          isHideLoadMore: true,
          isLoading: false
        });
      }
    });
  },

  choose: function(e){
    var goodsId = e.currentTarget.dataset.id;

    var hasGoods = false;
    var index = 0;
    for (var i = 0; i < this.data.chooseGoods.length;i++){
      if(this.data.chooseGoods[i]==goodsId){
        hasGoods = true;
        index = i;
        break;
      }
    }

    if(hasGoods){
      this.data.chooseGoods.splice(index);
      this.setData({
        chooseGoods: this.data.chooseGoods
      });
    }else{
      this.data.chooseGoods.push(goodsId);
      this.setData({
        chooseGoods: this.data.chooseGoods
      });
    }

    for(var i=0; i< this.data.goods.length; i++){
      var hasChoosen = false;
      for(var j=0; j<this.data.chooseGoods.length;j++){
        if(this.data.goods[i].id == this.data.chooseGoods[j]){
          hasChoosen = true;
        }
      }

      this.data.goods[i].hasChoosen = hasChoosen;
    }

    this.setData({
      goods: this.data.goods
    });
  },

  submit: function(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var chooseGoods = [];

    for(var i=0;i<this.data.chooseGoods.length;i++){
      for(var j=0;j<this.data.goods.length;j++){
        if(this.data.chooseGoods[i]==this.data.goods[j].id){
          chooseGoods.push(this.data.goods[j]);
        }
      }
    }
    prevPage.data.goodsIds = this.data.chooseGoods;
    prevPage.data.chooseGoods = chooseGoods;
    wx.navigateBack({
      
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.loadMore();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})