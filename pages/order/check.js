// pages/order/check.js
var app = getApp();
var cartIds;
var aId;
var payParams;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkData: null,
    isLoading: true,
    isUserAuth:true,
    isNoNetError: true,
    isIphonex: app.globalData.isIphonex,
    isSubmitDisable: false,
    isCanPay: false,
    options: null,

    //立即购买用的变量
    goods_id: null,
    count: 0,
    sku: null
  },
  

  loadData: function(){
    var that = this;
    payParams = null;
    aId = null;
    console.log(that.data.options);
    that.data.goods_id = that.data.options.goods_id;
    if (that.data.goods_id) {
      that.data.count = that.data.options.count;
      that.data.sku = that.data.options.sku;
      //立即购买结算
      wx.request({
        url: app.globalData.apiUrl + "order/buy-now-check&token=" + wx.getStorageSync("token"),
        method: "POST",
        data: { 
          goods_id: that.data.goods_id, 
          count: that.data.count, 
          sku: that.data.sku
        },
        success: function (res) {
          that.setData({
            isNoNetError: true
          });

          if (res.data.code == 0) {
            that.setData({
              checkData: res.data.data
            });

            aId = res.data.data.address.aId;
          }
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
      })


    } else {

      //购物车结算
      cartIds = JSON.parse(that.data.options.cartId);
      wx.request({
        url: app.globalData.apiUrl + "order/check&token=" + wx.getStorageSync("token"),
        method: "POST",
        data: { cartId: cartIds },
        success: function (res) {
          that.setData({
            isNoNetError: true
          });
          if (res.data.code == 0) {
            that.setData({
              checkData: res.data.data
            });

            aId = res.data.data.address.aId;
          }
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

    }//end if
  },

  chooseAddress: function(e){
    var that = this;
    var checkData = this.data.checkData;
    if(!checkData){
      wx.showToast({
        title: '载入结算数据中，请稍后',
        icon: "none"
      });
      return;
    }
    wx.navigateTo({
      url: '../address/address',
    })   
  },

  /**
   * 提交订单
   */
  check: function(res){

    if(payParams){
      this.pay(payParams);
      return ;
    }

    var that = this;

    if (!aId) {
      wx.showToast({
        title: '请选择收货地址',
        icon: "none"
      });

      return;
    }

    that.setData({
      isSubmitDisable: true
    });

    wx.showLoading({
      title: "提交中...",
    });

    if(that.data.goods_id){
      wx.request({
        url: app.globalData.apiUrl + "order/baobaoxiu-buy-now-create&token=" + wx.getStorageSync("token"),
        method: "POST",
        data: {aId: aId,goods_id: that.data.goods_id, count: that.data.count, sku: that.data.sku},
        success: function(res){
          wx.hideLoading();
          
          if (res.data.code == 0) {
            console.log(res.data.data);
            payParams = res.data.data.payParams;

            that.pay(payParams);
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail:function(res){
          wx.hideLoading();
          that.setData({
            isSubmitDisable: false
          });
        },
        complete: function(res){
          
        }
      });
    }else{
      wx.request({
        url: app.globalData.apiUrl +"order/baobaoxiu-create&token="+wx.getStorageSync("token"),
        method:"POST",
        data: { cartIds: cartIds,aId: aId},
        success: function(res){
          wx.hideLoading();
          if(res.data.code == 0){
            
            payParams = res.data.data.payParams;

            that.pay(payParams);
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: "none"
            });
          }
        },
        fail: function(res){
          wx.hideLoading();
          that.setData({
            isSubmitDisable: false
          });
        },
        complete: function(res){
          
        }
      });
    }
  },

  // 记录用户在观看直播的过程中下单的次数
  userBuyNowCount: function () {
    var that = this;
    wx.request({
      url: app.globalData.liveUrl + 'goods/live-product-order-save',
      method: 'post',
      data: {
        room_id: that.data.options.roomId,
        nick_name: that.data.options.nickName,
        group_id: that.data.options.groupId
      },
      success: function (res) {
      },
      fail: function () {
        console.log('userAddShopcartCount fail', res);
      }
    })
  },

  pay: function(payParams){
    var that = this;
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
      success: function (res) {
        that.userBuyNowCount();
        wx.showToast({
          title: '支付成功',
        });
        wx.switchTab({
          url: '../../pages/my/my',
        });
      },
      fail: function (res) {
      },
      complete: function (res) {

        if (res.errMsg == "requestPayment:fail cancel") {
          that.setData({
            isSubmitDisable: false,
            isCanPay: true
          });
        }
      }
    });
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    this.data.options = options;
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