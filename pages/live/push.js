//index.js
//获取应用实例

const app = getApp();
const host = app.globalData.host;
var that;

var webim = require('../../utils/webim_wx.js');
var webimhandler = require('../../utils/webim_handler.js');

var messages = [];

// 用户信息
var accountInfo = {
  userID: '',			// 用户ID
  userName: '',		// 用户昵称
  userAvatar: '',		// 用户头像URL
  userSig: '',		// IM登录凭证
  sdkAppID: '',		// IM应用ID
  accountType: '',	// 账号集成类型
  accountMode: 0,		//帐号模式，0-表示独立模式，1-表示托管模式		
};

// 房间信息
var roomInfo = {
  roomID: '',			// 视频位房间ID
  roomName: '',		// 房间名称
  mixedPlayURL: '', 	// 混流地址
  isCreator: false,	// 是否为创建者
  pushers: [],		// 当前用户信息
  isLoginIM: false,	// 是否登录IM
  isJoinGroup: false,	// 是否加入群
  isDestory: false	// 是否已解散
};
/**
 * [loginIM 登录IM]
 * @param {options}
 *   data: {
 *   	roomID: 房间ID
 *   }
 *   success: 成功回调
 *   fail: 失败回调
 */
function loginIM(options) {
  console.log('options', options);
  roomInfo.isDestory = false;
  roomInfo.roomID = options.data.roomID;
  // 初始化设置参数
  webimhandler.init({
    accountMode: accountInfo.accountMode,
    accountType: accountInfo.accountType,
    sdkAppID: accountInfo.sdkAppID,
    avChatRoomId: options.roomID,
    selType: webim.SESSION_TYPE.GROUP,
    selToID: options.roomID,
    selSess: null //当前聊天会话
  });
  //当前用户身份
  var loginInfo = {
    'sdkAppID': accountInfo.sdkAppID, //用户所属应用id,必填
    'appIDAt3rd': accountInfo.sdkAppID, //用户所属应用id，必填
    'accountType': accountInfo.accountType, //用户所属应用帐号类型，必填
    'identifier': accountInfo.userID, //当前用户ID,必须是否字符串类型，选填
    'identifierNick': accountInfo.userName, //当前用户昵称，选填
    'userSig': accountInfo.userSig, //当前用户身份凭证，必须是字符串类型，选填
    'headurl': accountInfo.userAvatar
  };
  //监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
  var onGroupSystemNotifys = {
    // 群被解散(全员接收)
    "5": function (notify) {
      roomInfo.isDestory = true;
      webimhandler.logout();

      wx.showModal({
        title: '直播已经结束',
        content: '',
        success: function (res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
    },
    "11": webimhandler.onRevokeGroupNotify, //群已被回收(全员接收)
    // 用户自定义通知(默认全员接收)
    "255": function (notify) {
      console.log('收到系统通知：', notify.UserDefinedField);
      // var content = JSON.parse(notify.UserDefinedField);
      // if (content && content.cmd == 'notifyPusherChange') {

      // }
      var content = notify.UserDefinedField; //群自定义消息数据
      var msg = webimhandler.stringToCustomMsg(content);
      console.log("msg.cmd: " + msg.cmd);
      switch (msg.cmd) {

        case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_AUDIENCE_LEAVE_ROOM:

          console.log(msg.name + "离开房间", "");

          break;
        case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_AUDIENCE_ENTER_ROOM:
          console.log(msg.name + "进入房间", "");
          var countInfo = JSON.parse(msg.msg);
          var count = parseInt(countInfo.nowUserCount) + 2017 + parseInt(Math.random() * 200);

          break;

        case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_REFRESH_PRODUCT_LIST:
          wx.request({
            url: app.globalData.apiUrl + "live/act=goods?id=" + that.data.live_id + "&token=" + wx.getStorageSync("token"),

            success: function (res) {

              if (res.data.code == 0) {
                that.setData({
                  goods: res.data.data.goods,
                  showSkuLayout: false
                });
              }
            }
          });

          break;

        case webimhandler.CUSTOM_MSG_CMD.SYSTEM_MSG_RECOMMEND_GOODS:
          wx.request({
            url: app.globalData.apiUrl + "live/act=recommend-goods?id=" + that.data.live_id + "&token=" + wx.getStorageSync("token"),

            success: function (res) {

              if (res.data.code == 0) {
                that.setData({
                  recommendGoods: res.data.data.goods,
                  showSkuLayout: false
                });
              }
            }
          });

          break;

        default:
          break;
      }
    }
  };

  //监听连接状态回调变化事件
  var onConnNotify = function (resp) {
    switch (resp.ErrorCode) {
      case webim.CONNECTION_STATUS.ON:
        //webim.Log.warn('连接状态正常...');
        break;
      case webim.CONNECTION_STATUS.OFF:
        webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
        break;
      default:
        webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
        break;
    }
  };

  //监听事件
  var listeners = {
    "onConnNotify": webimhandler.onConnNotify, //选填
    "onBigGroupMsgNotify": function (msg) {
      webimhandler.onBigGroupMsgNotify(msg, function (msgs) {
        // receiveMsg(msgs);
        console.log(msgs);
        showMsg(msgs);
      })
    }, //监听新消息(大群)事件，必填
    "onMsgNotify": webimhandler.onMsgNotify, //监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
    "onGroupSystemNotifys": onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，必填
    "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify,
    // 'onKickedEventCall': self.onKickedEventCall // 踢人操作
  };

  //其他对象，选填
  var others = {
    'isAccessFormalEnv': true, //是否访问正式环境，默认访问正式，选填
    'isLogOn': false //是否开启控制台打印日志,默认开启，选填
  };

  if (accountInfo.accountMode == 1) { //托管模式
    webimhandler.sdkLogin(loginInfo, listeners, others, 0, afterLoginIM, options);
  } else { //独立模式
    //sdk登录
    webimhandler.sdkLogin(loginInfo, listeners, others, roomInfo.roomID, afterLoginIM, options);
  }
}

//显示普通消息
function showMsg(msg) {

  var msg = webimhandler.stringToCustomMsg(msg.content);
  switch (msg.cmd) {

    case webim.GROUP_MSG_SUB_TYPE.COMMON: //群普通消息


      messages.push({ username: msg.name, content: msg.msg, avatar: msg.image });
      if (messages.length > 10) {

        messages.shift();
      }
      break;
  }

  that.setData({
    messages: messages
  });
}

function afterLoginIM(options) {
  if (options.errCode) {
    // webim登录失败
    console.log('webim登录失败:', options);
    options.callback.fail && options.callback.fail({
      errCode: -2,
      errMsg: '登录失败'
    });
    return;
  }
  // webim登录成功
  console.log('2.webim登录成功');
  roomInfo.isLoginIM = true;
  webimhandler.applyJoinBigGroup(roomInfo.roomID, afterJoinBigGroup, {
    success: options.callback.success,
    fail: options.callback.fail
  });
}
function afterJoinBigGroup(options) {
  if (options.errCode) {
    console.log('webim进群失败: ', options);
    options.callback.fail && options.callback.fail({
      errCode: -2,
      errMsg: '登录失败'
    });
    return;
  }
  roomInfo.isJoinGroup = true;
  console.log('进入IM房间成功: ', roomInfo.roomID);
}

/**
 * [receiveMsg 接收消息处理]
 * @param {options}
 *
 * @return event.onRecvRoomTextMsg 
 *   roomID: 房间ID
 *   userID: 用户ID
 *   nickName: 用户昵称
 *   headPic: 用户头像
 *   textMsg: 文本消息
 *   time: 消息时间
 */
function receiveMsg(msg) {
  if (!msg.content) { return; }
  console.log('IM消息: ', msg);
  if (msg.fromAccountNick == '@TIM#SYSTEM') {
    msg.fromAccountNick = '';
    msg.content = msg.content.split(';');
    msg.content = msg.content[0];
    msg.time = '';
  } else {
    var time = new Date();
    var h = time.getHours() + '', m = time.getMinutes() + '', s = time.getSeconds() + '';
    h.length == 1 ? (h = '0' + h) : '';
    m.length == 1 ? (m = '0' + m) : '';
    s.length == 1 ? (s = '0' + s) : '';
    time = h + ':' + m + ':' + s;
    msg.time = time;
    var contentObj, newContent;
    newContent = msg.content.split('}}');
    contentObj = JSON.parse(newContent[0] + '}}');
    if (contentObj.cmd == 'CustomTextMsg') {
      msg.nickName = contentObj.data.nickName;
      msg.headPic = contentObj.data.headPic;
      var content = '';
      for (var i = 1; i < newContent.length; i++) {
        if (i == newContent.length - 1)
          content += newContent[i];
        else content += newContent[i] + '}}';
      }
      msg.content = content;
    }
  }
  event.onRecvRoomTextMsg({
    roomID: roomInfo.roomID,
    userID: msg.fromAccountNick,
    nickName: msg.nickName,
    headPic: msg.headPic,
    textMsg: msg.content,
    time: msg.time
  });
};



//------------end im ----------

const pushModeMap = {
  '标清': 'SD',
  '高清': 'HD',
  '超清': 'FHD',
};

Page({
  data: {
    cover: null,
    pushURL: null,
    pushMode: 'HD',
    pushModeText: '高清',
    active: true,
    magic: true,
    pushState: 'stop', // stop pushing pause pending
    liveState: {'stop':"直播状态：未开始","pushing":"直播中...", "pause":"暂停", "pending":"等待中", "retry":"尝试重新推流中..."},
    showStartBtn: true,
    countDown:0,
    cameraPosition:"front",
    direction: 1,//拍摄方向，默认竖屏
    messageInputValue: '',
    messageToView:0
  },

  messageInput: function (e) {
    this.data.messageInputValue = e.detail.value;
  },

  sendMessage: function (e) {
    var that = this;
    if (that.data.messageInputValue == null || that.data.messageInputValue == "") {
      console.log("send messageInputValue empty");

      wx.showToast({
        title: '输入为空'
      });
      return;
    }
    that.data.messages = that.data.messages && that.data.messages.concat([{ username: "我", content: that.data.messageInputValue }]);
    webimhandler.mySendMsg(that.data.messageInputValue);
    that.setData({
      messageInputValue: null,
      messages: that.data.messages,
      hideLiveChat: "",
      hideMessageBar: "hide",
      messageToView: "msg_" + (that.data.messages.length - 1)
    });
  },


  onLoad: function (option) {

    that = this;

    this.liveTitle = option.title;
    this.id = option.id;
    console.log(option.direction);
    this.setData({
      direction: parseInt(option.direction)
    });
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.pushContext = wx.createLivePusherContext();
    this.getPushURL();
  },

  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
    });
  },

  onShareAppMessage() {

    var that = this;
    return {
      title: that.liveTitle,
      imageUrl: that.data.cover,
      path: `/pages/live/live?id=${this.id}`,
      success: (res) => {
        
      }
    };
  },

  onViewTap() {
    this.setData({ active: !this.data.active });
  },

  onModeTap() {
    const list = ['标清', '高清', '超清'];
    wx.showActionSheet({
      itemList: list,
      success: (res) => {
        this.setData({ pushMode: pushModeMap[list[res.tapIndex]], pushModeText: list[res.tapIndex] });
      },
    })
  },

  onMagicTap() {
    this.setData({ magic: !this.data.magic });
  },

  onCloseTap() {
    //wx.navigateBack();
    var that = this;
    const list = ['结束直播,生成回放','删除直播'];
    wx.showActionSheet({
      itemList: list,
      success: (res) => {
        switch (res.tapIndex){
          // case 0:
          //   wx.showLoading({
          //     title: '暂停直播中...',
          //     icon: ''
          //   });

          //   wx.request({
          //     url: app.globalData.apiUrl+"live/pause?id="+this.id+"&token="+wx.getStorageSync("token"),
          //     method: "POST",
          //     success: function(res){
          //       if(res.data.code==0){
          //         wx.navigateBack();
          //       }else{
          //         wx.showModal({
          //           title: '提示',
          //           content:res.data.msg,
          //         });
          //       }
          //     },
          //     fail: function(res){
          //       wx.showToast({
          //         title: "请求失败，请重试",
          //         icon: 'none'
          //       });
          //     },
          //     complete: function(res){
          //       wx.hideLoading();
          //     }
          //   });
          // break;
          
          case 0:
            wx.showLoading({
              title: '正在结束直播，生成回放',
              icon: ''
            });

            wx.request({
              url: app.globalData.apiUrl + "live&act=close&id=" + that.id + "&token=" + wx.getStorageSync("token"),
              method: "POST",
              success: function (res) {

                wx.hideLoading();

                if (res.data.code == 0) {
                  wx.navigateBack();
                } else {
                  wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateBack();
                      }
                    }
                  });
                }
              },
              fail: function (res) {
                wx.hideLoading();
                wx.showToast({
                  title: "请求失败，请重试",
                  icon: 'none'
                });
              },
              complete: function (res) {
                
              }
            });
          break;

          case 1:

            wx.showModal({
              title: '删除直播',
              content: '',
              success: function (res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '删除直播中...',
                    icon: ''
                  });

                  wx.request({
                    url: app.globalData.apiUrl + "live&act=liveDelete&id=" + that.id + "&token=" + wx.getStorageSync("token"),
                    method: "POST",
                    success: function (res) {

                      wx.hideLoading();

                      if (res.data.code == 0) {
                        wx.navigateBack();
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: res.data.msg
                        });
                      }
                    },
                    fail: function (res) {
                      wx.hideLoading();
                      wx.showToast({
                        title: "请求失败，请重试",
                        icon: 'none'
                      });
                    },
                    complete: function (res) {
                      
                    }
                  });
                } else if (res.cancel) {
                  
                }
              }
            });

            
          break;

          default:
          break;
        }
      },
    });
  },

  onSwitchCamera() {
    this.pushContext.switchCamera();
    // console.log("switch camera");
    // if (this.data.cameraPosition=="front"){
    //   this.setData({
    //     cameraPosition: "back"
    //   });
    // }else{
    //   this.setData({
    //     cameraPosition: "front"
    //   });
    // }
  },

  startPush() {
    this.setData({ pushState: 'pending' });
    this.pushContext.start({
      success: () => {
        // app.sendWsMsg && app.sendWsMsg({ type: 'live-status-change' });
        // console.log('send', app.sendWsMsg);
        this.setData({ pushState: 'pushing' });
      },
      fail: () => {
        wx.showToast({ title: '推流开始失败' });
        this.setData({ pushState: 'stop' });
      },
    });
  },

  statechange(e) {
    switch (e.detail.code) {

      case 1101:
        wx.showToast({
          title: '网络状况不佳：上行带宽太小，上传数据受阻',
          icon: "none"
        });

      break;
      case -1307:
        // wx.showModal({
        //   content: '网络断连，且经多次重连抢救无效，更多重试请自行重启推流',
        // });

        wx.showToast({
          title: '亲，网络太差， 尝试重新推流中...',
          icon: "none"
        });

        this.setData({
          pushState: "retry"
        });
        
        //重新推流
        this.startPush();

        break;
      case 3004:
        wx.showModal({ title: '远程服务器主动断开连接'});
        break;
      default:
        break;
    }
    console.log('live-player code:', e.detail.code);

    // wx.showToast({
    //   title: 'live-player code:'+e.detail.code,
    //   icon: "none"
    // });
  },

  getPushURL: function () {

    var that = this;
    wx.request({
      url: app.globalData.apiUrl + 'live&act=getPushUrl&id='+this.id+'&token=' + wx.getStorageSync("token"),
      dataType: 'json',
      success: (res) => {
        // 注意这里必须在setData的回调后才能开始推流
        this.push_url = res.data.data.push_url;
        this.setData({
          showStartBtn:true,
          cover: res.data.data.cover
        });
        this.setData({ pushURL: res.data.data.prepare_push_url }, () => {
          this.pushContext.start();
        });

        that.group_id = res.data.data.group_id;

        accountInfo = res.data.data.accountInfo;
        loginIM({
          data: {
            roomID: res.data.data.group_id
          },
          success: function (ret) {
            // 创建房间成功之后操作
          },
          fail: function (ret) {
            console.log(ret);
          }
        });
        
      },
      fail: () => {
        wx.showModal({
          title: '推流失败',
          content: '发生错误，无法获取推流地址',
          showCancel: false,
        });
      },
    });
  },

  onUnload() {
    this.pushContext.stop();
  },

  preparePush(){
    //倒计时
    this.setData({
      showStartBtn:false,
      countDown: 9
    });

    var that = this;

    var interval = setInterval(function () {
      if (that.data.countDown - 1 > 0) {
        that.setData({
          countDown: (that.data.countDown - 1)
        });
      } else {
        that.setData({
          countDown: 0
        });
        

        that.setData({ pushURL: that.push_url }, () => {
          that.startPush();
        });
        clearInterval(interval);
      }
    },1000);
  }
})
