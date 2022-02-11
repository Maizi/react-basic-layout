// import React from "react";
// React.ReactX = new ReactX();
class ReactX {
  constructor() {
    //事件名
    this.eventName = {
      addMoneyTips: [],
      isCouponDidMount: [],
      addBindCardDone: [],
      getMoneyInfo: [],
      sendGetMoneyInfoData: [],
      bindPhoneEvent: [],
      bindPayPwEvent: [],
      bindCardCheck: [],
      getBindCardCheckData: [],
      addBindCardInitDone: [], // 添加银行卡加载完成
      getSkinModalEvent: [], // 取回皮肤弹窗触发事件
      getRollJoinStatus: [], // roll房参加状态
      resolveDone: [], // 分解完成
      exchangeDone: [], // 出售完成
      resolveBtnClose: false, // 分解弹窗关闭
      exchangeBtnClose: false, // 置换弹窗关闭

      ticketDestoryDone: false, // 秘宝销毁完成，用于通知组件重新加载列表

      isGoodsMlodalShow: false, //查证当前是否显示了获取物品弹框 场景：开启盲盒获得物品打开获的物品弹框后 通知开箱窗口闭合

      reloadRollList: false, // 主播ROLL创建成功，通知列表自动刷新

      paybankCallback: {}, //银行卡支付状态回调
      bindCradCallback: {}, //绑定银行卡回调

      otherPayCallback: {}, //三方支付回调
      getNewItem: false, // 获得新物品气泡提示

      joinRollSuccess: false,
    };
  }
  emit = (name, data) => {
    const cbList = this.eventName[name];
    cbList &&
      cbList.length &&
      cbList.forEach((item) => {
        item && item(data);
      });
  };
  listen = (name, cb) => {
    const { eventName } = this;
    if (!(eventName[name] && eventName[name].length)) {
      eventName[name] = [];
    }
    eventName[name].push(cb);
  };
  remove(name, cb) {
    if (cb) {
      let cbs = this.eventName[name];
      cbs = cbs.filter((item) => item !== cb);
      this.eventName[name] = cbs;
    } else {
      this.eventName[name] = null;
      delete this.eventName[name];
    }
  }
}

export default new ReactX();
