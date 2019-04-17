// pages/live/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mobile:'',
    password:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  mobileInput: function(e){
    this.data.mobile = e.detail.value;
  },
  passwordInput: function(e){
    this.data.password = e.detail.value;
  },

  login: function(e){
    console.log(e);
    var mobile = this.data.mobile;
    var password = this.data.password;

    if(mobile!=''&&password!=''){
      wx.showLoading({
        title: '登录中...',
      });
      wx.request({
        url: app.globalData.apiUrl + "shop/act=login",
        method: "post",
        data: {mobile: mobile, password: password},
        success: function(res){

          wx.hideLoading();
          if(res.data.code==0){
            wx.setStorageSync("shop_token", res.data.data.token);

            wx.redirectTo({
              url: 'list',
            });
          }else{
            
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration:1500//停留显示2秒
            });

          }
        },

        fail: function(res){
          wx.hideLoading();
        },
        complete: function(res){
          
        }
      });
     
    }else{
      wx.showToast({
        title: '请输入手机号和密码',
        icon: "none"
      });
    }
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