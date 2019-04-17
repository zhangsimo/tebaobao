// pages/my/feedback.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIphonex: app.globalData.isIphonex,
    wordCount: 0,
    question_desc: "",
    submitDisabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 提交
   */
  submit: function (e) {
    
    var that = this;
    var question_desc = e.detail.value.question_desc;

    if(!question_desc){
      wx.showToast({
        title: '内容不能为空',
        icon: "none"
      });
      return;
    }

    that.setData({
      submitDisabled:true
    });

    wx.showLoading({
      title: '提交中...',
    });
    wx.request({

      url: app.globalData.apiUrl+"feedback/create&token="+wx.getStorageSync("token"),
      method:"POST",
      data: { content: question_desc, version: app.globalData.device+"-"+app.globalData.version},
      success: function(res){

        wx.hideLoading();
        if(res.data.code == 0){

          wx.showToast({
            title: res.data.msg
          });

          wx.navigateBack({
            
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
      },
      complete: function(res){

        
        that.setData({
          submitDisabled: false
        });
      }
    });
    
  },

  countWord: function (e) {

    this.data.question_desc = e.detail.value;
    this.setData(
      {
        wordCount: e.detail.value.length > 500 ? 500 : e.detail.value.length
      }
    );
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