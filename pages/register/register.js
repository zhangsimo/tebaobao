// pages/register/register.js
var interval = null //倒计时函数
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneDialog: false,
    time: '获取验证码',
    currentTime: 60,
    isClick: false,
    phoneNumber: '',
    codeNumber: '',
    showAuthModal: false 
  },

  // 输入手机号注册
  isPhoneNumber: function() {
    this.setData({
      phoneDialog: true
    })
  },

  // 输入验证码
  codeNumber: function(event) {
    this.setData({ codeNumber: event.detail.value})
  },

  // 输入手机号
  phoneNumber: function (event) {
    this.setData({ phoneNumber: event.detail.value })
  },

  getCode: function() {
    var that = this;
    var number = /^1\d{10}$/;
    if (!number.test(this.data.phoneNumber)) {
      wx.showToast({
        icon: 'none',
        title: '手机号码有误,请重新输入',
        duration: 2000
      });
      return;
    }
    this.setData({
      isClick: true
    });
    var currentTime = that.data.currentTime;
    interval = setInterval(function () {
      currentTime--;//减
      that.setData({
        time: currentTime + '秒后获取'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '获取验证码',
          currentTime: 60,
          isClick: false
        })
      }
    }, 1000);
    
    wx.request({
      url: app.globalData.indexUrl + 'sms_new&token=' + wx.getStorageSync("token"),
      data: {
        phone: that.data.phoneNumber,
        type: 'login'
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status.succeed == 1) {
          wx.showToast({
            icon: 'none',
            title: res.data.status.error_desc,
            duration: 2000
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: res.data.status.error_desc,
            duration: 2000
          })
        }
      },
      fail: function(res) {
        console.log('fail', res)
      },
      complete: function() {
      }
    })
  },

  // 微信授权注册
  getPhoneNumber: function (e) {
    var that = this;
    wx.showLoading({
      title: '获取中...',
      icon: "none"
    });
    wx.login({
      success: res => {
        wx.request({
          url: app.globalData.apiUrl + 'wechat/baobaoxiu_getphonenumber',
          data: {
            'encryptedData': encodeURIComponent(e.detail.encryptedData),
            'iv': encodeURIComponent(e.detail.iv),
            'code': res.code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            if (res.data.code === 0) {
              wx.setStorageSync('phone', res.data.data);
              that.setData({
                showAuthModal: true
              })
            }
          },
          fail: function (err) {
            console.log(err);
          },
          complete: function (res) {
            wx.hideLoading();
          }
        })
      }
    })
  },

  completeHiddenDialog: function() {
    var number = /^1\d{10}$/;
    var code = /^\d{6}$/;
    var that = this;
    if (this.data.phoneNumber === '' || !number.test(this.data.phoneNumber)) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确的手机号码',
        duration: 2000
      });
      return;
    }
    if (this.data.codeNumber === '' || !code.test(Number(this.data.codeNumber))) {
      wx.showToast({
        icon: 'none',
        title: '请输入验证码',
        duration: 2000
      });
      return;
    }
    
    wx.request({
      url: app.globalData.indexUrl + 'sms_check&token=' + wx.getStorageSync("token"),
      data: {
        phone: that.data.phoneNumber,
        code: that.data.codeNumber
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status.succeed === 1) {
          wx.setStorageSync('phone', that.data.phoneNumber);
          wx.navigateBack({ changed: true });
        } else {
          wx.showToast({
            icon: 'none',
            title: res.data.status.error_desc,
            duration: 2000
          });
        }
      },
      fail: function(res) {
      },
      complete: function(res) {
        that.setData({
          phoneDialog: false,
          time: '获取验证码'
        })
      }
    })
  },

  cancelHiddenDialog: function() {
    this.setData({
      phoneDialog: false,
      time: '获取验证码'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "登陆"
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