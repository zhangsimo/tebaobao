// created by gpake
(function() {
var mContext = null;
var config = {
    qiniuRegion: '',
    qiniuImageURLPrefix: '',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: '',
    qiniuUploadTokenFunction: null
}

module.exports = {
    init: init,
    upload: upload,
}

// 在整个程序生命周期中，只需要 init 一次即可
// 如果需要变更参数，再调用 init 即可
function init(options) {
    config = {
        qiniuRegion: '',
        qiniuImageURLPrefix: '',
        qiniuUploadToken: '',
        qiniuUploadTokenURL: '',
        qiniuUploadTokenFunction: null
    };
    updateConfigWithOptions(options);
}

function updateConfigWithOptions(options) {
    if (options.region) {
        config.qiniuRegion = options.region;
    } else {
        console.error('qiniu uploader need your bucket region');
    }
    if (options.uptoken) {
        config.qiniuUploadToken = options.uptoken;
    } else if (options.uptokenURL) {
        config.qiniuUploadTokenURL = options.uptokenURL;
    } else if(options.uptokenFunc) {
        config.qiniuUploadTokenFunction = options.uptokenFunc;
    }
    if (options.domain) {
        config.qiniuImageURLPrefix = options.domain;
    }
}

function upload(context,filePath, success, fail, options) {

    mContext = context;

    if (null == filePath) {
        console.error('qiniu uploader need filePath to upload');
        return;
    }
    if (options) {
        init(options);
    }
    if (config.qiniuUploadToken) {
        doUpload(filePath, success, fail, options);
    } else if (config.qiniuUploadTokenURL) {
        getQiniuToken(function() {
            doUpload(filePath, success, fail, options);
        });
    } else if (config.qiniuUploadTokenFunction) {
        config.qiniuUploadToken = config.qiniuUploadTokenFunction();
    } else {
        console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
        return;
    }
}

function doUpload(filePath, success, fail, options) {
    var url = uploadURLFromRegionCode(config.qiniuRegion);
    var fileName = filePath.split('//')[1];
    if (options && options.key) {
        fileName = options.key;
    }
    var formData = {
        'token': config.qiniuUploadToken,
        //'key': fileName
    };
    var uploadTask = wx.uploadFile({
        url: url,
        filePath: filePath,
        name: 'file',
        formData: formData,
        success: function (res) {
            var dataString = res.data
            var dataObject = JSON.parse(dataString);
            //do something
            var imageUrl = config.qiniuImageURLPrefix + dataObject.key;
            dataObject.imageURL = imageUrl;
            console.log(dataObject);

            for(var i=0 ; i< mContext.data.files.length; i++){
              if(mContext.data.files[i].file == filePath){
                mContext.data.files[i].url = imageUrl;
                mContext.data.files[i].progress = 100;
              }
            }
            if (success) {
                success(dataObject);
            }
        },
        fail: function (error) {
            console.log(error);
            if (fail) {
                fail(error);
            }
        }
    });


    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress)
      console.log('已经上传的数据长度', res.totalBytesSent)
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)

      // mContext.data.files
      var files = mContext.data.files;
      for (var i = 0; i < files.length; i++){

        if (files[i].file == filePath){
          files[i].progress = res.progress
        }
      }

      mContext.setData({
        files: mContext.data.files
      });
    });
    
}

function getQiniuToken(callback) {
  wx.request({
    url: config.qiniuUploadTokenURL,
    success: function (res) {
      var token = res.data.data.uptoken;
      config.qiniuImageURLPrefix = res.data.data.cdn
      config.qiniuUploadToken = token;
      if (callback) {
          callback();
      }
    },
    fail: function (error) {
      console.log(error);
    }
  })
}

function uploadURLFromRegionCode(code) {
    var uploadURL = null;
    switch(code) {
        case 'ECN': uploadURL = 'https://up.qbox.me'; break;
        case 'NCN': uploadURL = 'https://up-z1.qbox.me'; break;
        case 'SCN': uploadURL = 'https://up-z2.qbox.me'; break;
        case 'NA': uploadURL = 'https://up-na0.qbox.me'; break;
        default: console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
    }
    return uploadURL;
}

})();