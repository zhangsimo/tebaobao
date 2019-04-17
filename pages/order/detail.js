// pages/order/detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isNoNetError: true,
    isIphonex: app.globalData.isIphonex,
    isPayDisable:false,
    isConfirmDisable:false,
    paySuccess: false,
    address: null,
    order:null,
    payParams: null,
    order_id: 0
  },

  loadData: function(){

    var that = this;

    wx.request({
      url: app.globalData.apiUrl+"order/detail&token="+wx.getStorageSync("token"),
      method: "GET",
      data: {id: that.data.order_id},
      success:function(res){

        console.log(res);

        that.setData({
          isNoNetError: true
        });
        
        that.setData({
          isNoNetError:true,
          address: res.data.data.address,
          order: res.data.data.order
        });
      },

      fail: function(res){
        that.setData({
          isNoNetError: false,
        });
      },
      complete:function(res){
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
    this.data.order_id = options.id;
    this.loadData();
  },

  showLogisticInfo: function(e){
    wx.navigateTo({
      url: 'logistic-detail?com='+e.currentTarget.dataset.com+"&num="+e.currentTarget.dataset.num,
    })
  },

  /**
   *  请求支付参数
   */
  pay: function(e){
    var that = this;

    if (that.data.payParams) {
      this.pay(that.data.payParams);
      return;
    }

    if(that.data.isPayDisable){
      return;
    }

    that.setData({
      isPayDisable: true
    });

    wx.showLoading({
      title: "请求支付信息中...",
      icon: "none"
    });

    wx.request({
      url: app.globalData.apiUrl + "order/pay&token=" + wx.getStorageSync("token") + "&order_id=" + that.data.order.id,
      success: function(res){
        wx.hideLoading();
        if(res.data.code == 0){

          that.data.payParams = res.data.data.payParams;
          that.goPay(that.data.payParams);
          
        }
      },

      fail: function(res){
        wx.hideLoading();
        wx.showToast({
          title: '发生错误，请重试',
          icon: "none"
        });

        that.setData({
          isPayDisable: false
        });
      },
      complete: function(res){
        
      }
      
    })
  },

  goPay: function (payParams) {
    var that = this;
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,

      success: function (res) {
        console.log("pay success");
        console.log(res);

        wx.showToast({
          title: '支付成功',
        });
        that.data.order.pay_status = 2;
        that.setData({
          order: that.data.order,
          paySuccess: true
        });
      },
      fail: function (res) {
        console.log("pay fail");
        console.log(res);

        that.setData({
          isPayDisable: false,
          payParams:null
        });
      },
      complete: function (res) {
        console.log("pay complete");
        console.log(res);

        if (res.errMsg == "requestPayment:fail cancel") {
          wx.showToast({
            title: '您取消了支付',
            icon: "none"
          })
          that.setData({
            isPayDisable: false
          });
        }
      }
    });
  },

  /**
   * 确认收货
   */
  confirmReceive: function(e){

    var that = this;
    

    wx.showModal({
      title: '确认收货吗？',
      content: '',
      success: function(res){
        if (res.confirm) {

          wx.showLoading({
            title: '确认收货中..',
            icon: "none"
          });

          that.setData({
            isConfirmDisable: true
          });

          wx.request({
            url: app.globalData.apiUrl + "order/confirm-receive&token=" + wx.getStorageSync("token"),
            method: "POST",
            data: { id: that.data.order_id },

            success: function (res) {
              wx.hideLoading();
              if (res.data.code == 0) {

                that.data.order.shipping_status = 3;
                that.setData({
                  order: that.data.order
                });

              } else {

                wx.showToast({
                  title: res.data.msg,
                  icon: "none"
                })
              }
            },
            fail: function (res) {
              wx.hideLoading();
              that.setData({
                isConfirmDisable: false
              });
            },
            complete: function (res) {
              
            }
          });
        }
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
});