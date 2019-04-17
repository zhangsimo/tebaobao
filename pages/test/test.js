// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  orderSign: function (e) {
    var fId = e.detail.formId;
    var fObj = e.detail.value;
    var l = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=';
    var d = {
      touser: "",
      template_id: '',//这个是1、申请的模板消息id，  
      page: '/pages/home/home',
      form_id: fId,
      data: {//测试完发现竟然value或者data都能成功收到模板消息发送成功通知，是bug还是故意？？【鄙视、鄙视、鄙视...】 下面的keyword*是你1、设置的模板消息的关键词变量  

        "keyword1": {
          "value": "顺丰快递",
          "color": "#4a4a4a"
        },
        "keyword2": {
          "value": "2018-5-15 13:05",
          "color": "#9b9b9b"
        },
        "keyword3": {
          "value": "2018-5-15 13:01",
          "color": "#9b9b9b"
        },
        "keyword4": {
          "value": "气质背心吊带",
          "color": "#9b9b9b"
        }
      },
      color: '#ccc',
      emphasis_keyword: 'keyword1.DATA'
    }
    wx.request({
      url: l,
      data: d,
      method: 'POST',
      success: function (res) {
        console.log("push msg");
        console.log(res);
      },
      fail: function (err) {
        // fail  
        console.log("push err")
        console.log(err);
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