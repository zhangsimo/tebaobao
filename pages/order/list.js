// pages/order/list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isHideLoadMore: true,
    isNoNetError: true,
    isEmpty: false,
    order_type: 0,
    orders:null,
    title: ""
  },

  loadData: function(){

    var that = this;

    wx.request({
      url: app.globalData.apiUrl + "order/list&token="+wx.getStorageSync("token"),
      data:{order_type: that.data.order_type},
      success: function (res) {
        app.debugConsole(res);

        that.setData({
          isNoNetError: true
        });
        
        if (res.data.code == 0) {

          var isEmpty = false;
          if(res.data.data.orders.length == 0){
            isEmpty = true;
          }

          that.setData({
            orders: res.data.data.orders,
            isEmpty: isEmpty
          });

        }
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        that.setData({
          isNoNetError: false
        });
      },
      complete: function (res) {
        that.setData({
          isLoading: false
        });
      }
    });
  },

  loadMore: function(){

    var that = this;
    that.setData({
      isHideLoadMore: false
    });
    wx.request({
      url: app.globalData.apiUrl + "order/list&token="+wx.getStorageSync("token"),
      data: { order_type: that.data.order_type, lastId: that.data.orders[(that.data.orders.length-1)].id },
      success: function (res) {
        app.debugConsole(res);

        if (res.data.code == 0) {

          that.setData({
            orders: that.data.orders.concat(res.data.data.orders)
          });

        }
        wx.stopPullDownRefresh();
      },
      complete: function (res) {
        that.setData({
          isHideLoadMore: true
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({"order_type": parseInt(options.order_type)});
    // this.data.order_type = parseInt(options.order_type);
    
    var title = "";
    
    switch (this.data.order_type){

      case 1:
        title = "待付款";
        break;
      case 2:
        title = "待发货";
        break;

      case 3:
        title = "待收货";
        break;
      
      case 4:
        title = "全部订单";
        break;
      case 5:
        title = "退款/售后";
        break;
    }

    if (this.data.order_type!=4){
      this.setData({
        title:title
      });
    }
    wx.setNavigationBarTitle({
      title: title,
    });
  },
  

  pay: function(e){
    wx.navigateTo({
      url: 'detail?id='+e.currentTarget.dataset.id,
    });
  },

  cancel:function(e){

    var that = this;

    wx.showLoading({
      title: '取消中...',
      icon: "none"
    });

    wx.request({
      url: app.globalData.apiUrl+"order/cancel&token="+wx.getStorageSync("token"),
      method:"POST",
      data: { order_id: e.currentTarget.dataset.id},
      success: function(res){
      
        console.log(res);
        wx.hideLoading();
        if(res.data.code == 0){
          var orders = that.data.orders;

          for (var i = 0; i < orders.length; i++){
            if (parseInt(orders[i].id) == parseInt(e.currentTarget.dataset.id)){
              orders[i].order_status = 1;
              break;
            }
          }

          that.setData({
            orders: orders
          });

        }else{

          wx.showToast({
            title: res.data.msg,
            icon: "none"
          });
        }
      },
      fail: function(res){
        wx.hideLoading();
        wx.showToast({
          title: '网络发生错误，请重试',
          icon: "none"
        })
      },
      complete: function(res){
        
      }
    })
  },

  confirmReceive: function(e){
    wx.navigateTo({
      url: 'detail?id=' + e.currentTarget.dataset.id,
    });
  },

  /**
   * 售后
   */
  afterSale: function(e){
    
    wx.navigateTo({
      url: 'after-sale?id=' + e.currentTarget.dataset.id,
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
    this.loadData();
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
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },


  showOrderDetail: function(e){

    var id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: 'detail?id='+id,
    });
  }
})