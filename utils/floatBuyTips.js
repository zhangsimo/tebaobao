function show(context){
  var app = getApp();
  wx.request({
    url: app.globalData.apiUrl+"site/float-buy-tips",
    success: function(res){
      
    }
  });
}

module.exports.show = show