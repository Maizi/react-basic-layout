import reactX from '@reactX';
import { updateUserBasic } from '@actions/user';
import { updateRealTimeCase } from '@actions/case';
// import { customerStatus } from '@actions/customer'
import { updateGlobalData } from '@actions/globalData';
import { updateContentNotice, updateContentFocus } from '@actions/content';
import {
  updatePayItem,
  updateChecoutItem,
  updateClearOrderIdInterval,
} from '@actions/paylist';
import { modalVisibleAction } from '@actions/modal';
// import { checkChatMessage } from '@components/customer/service'
import { updateStatusKey } from '@actions/status';

import { updateMatchActInfo } from '@actions/act';
// import history from '@utils/history';

let lastDateline = 0; // 上次记录时间
let lastArray = [];

// 监听ws更新
export class listenWsCallback {
  clt_keepalive_req() {
    console.log('长连接保持中...');
  }

  comet_msg_user(props, data) {
    props.dispatch(updateUserBasic(data));
  }

  comet_msg_items_h5(props, data) {
    let currentDateline = new Date().getTime();

    if (currentDateline - lastDateline > 2000) {
      lastArray = [];
      lastDateline = currentDateline;
    } else {
      if (lastArray.length > 1) {
        return;
      }

      lastArray = [...lastArray, ...data];
    }

    setTimeout(() => {
      //通过setTimeout使setState同步(不合并)
      props.dispatch(updateRealTimeCase(data));
    });
  }

  // 版本升级推送
  comet_msg_release_close() {
    location.reload();
  }

  // 更新未读通知
  comet_msg_message(props) {
    props.dispatch(
      updateStatusKey({
        updateConfig: true,
        relaodMsg: true,
      })
    );
  }

  comet_msg_global_data(props, data) {
    props.dispatch(updateGlobalData(data));
  }

  // 更新 - 全局类公告
  comet_msg_notice(props, data) {
    let { category, contents } = data,
      params = {};

    params[category] = contents;
    props.dispatch(updateContentNotice(params));
  }

  // 更新 - 推荐位
  comet_msg_focus(props, data) {
    let { category, contents } = data,
      params = {};

    params[category] = contents;
    props.dispatch(updateContentFocus(contents));
  }

  // 皮肤取回状态更新推送
  // {"data":{"asset_status":34,"order_id":"202106081617234555707314","order_type":1,"user_item_id":325404},"type":"asset_order"}
  comet_msg_asset_order(props, data) {
    let wsItemData = {
      user_item_id: data.user_item_id,
      // asset_status: data.asset_status,
      code: data.code,
      type: data.type,
      order_type: data.order_type,
      close_order: data.close_order,
      order_id: data.order_id,
      order_tradable_time: data.order_tradable_time,
      trade_offer_id: 'trade_offer_id' in data ? data.trade_offer_id : '',
    };

    props.dispatch(
      modalVisibleAction({ wsUserItemListNew: true, wsItemData: wsItemData })
    );
  }

  // 充值订单状态返回
  comet_msg_payment_order(props, data) {
    let { order_id, status, arrived_amount } = data,
      formatStatus = +status === 1 ? 2 : 3;
    props.dispatch(
      updatePayItem({
        order_id,
        newAtt: { status: formatStatus, arrived_amount },
      })
    );

    // 状态改变 - 移除dom
    if (document.getElementById(order_id)) {
      props.dispatch(updateClearOrderIdInterval(order_id));
      document.getElementById(order_id).remove();
    }

    // 更新我的收银台订单信息
    let newCheckout = {};
    newCheckout[order_id] = { status: formatStatus, arrived_amount };

    props.dispatch(updateChecoutItem({ newAtt: newCheckout }));

    reactX.emit('otherPayCallback', {
      order_id,
      status,
      arrived_amount,
    });
  }

  // 充值订单 - 快捷支付状态返回
  comet_msg_payease_order(props, data) {
    let { order_id, status, message, arrived_amount } = data; // status 0 - 失败 1 - 成功

    // if (status === 1) {
    //     // 充值成功，更新用户资产数据
    //     props.dispatch(
    //         updateStatusKey({
    //             updateConfig: true
    //         })
    //     );
    // }

    // props.dispatch(
    //   modalVisibleAction({
    //     payStatusVisible: true,
    //     payStatusData: {
    //       status,
    //       orderId: order_id,
    //       message,
    //       amount: arrived_amount,
    //     },
    //   })
    // );

    reactX.emit('paybankCallback', {
      order_id,
      status,
      message,
      arrived_amount,
    });
  }

  // 银行卡绑定 - 回调
  comet_msg_bind_card(props, data) {
    let { status, bank_no } = data; // status 0 - 失败 1 - 成功

    reactX.emit('bindCradCallback', { status, bankNo: bank_no });
  }

  comet_msg_act(props, data) {
    if (data.act_alias === 'login_1') {
      props.dispatch(
        modalVisibleAction({
          loginRewardsVisible: true,
          loginRewardsData: data.act_alias,
        })
      );
    }

    if (data.act_alias === 'register_1' || data.act_alias === 'register_2') {
      props.dispatch(
        modalVisibleAction({
          newUserEnrollVisible: true,
          newUserEnrollData: data.act_alias,
        })
      );
    }
  }

  // 活动类相关推送 - 全民杯观赛活动 - 已开奖推送
  comet_msg_roll_lottery(props, data) {
    props.dispatch(updateMatchActInfo({ rollOpen: data.roll_id }));
  }

  // 网站维护中状态推送
  comet_msg_common_upgrade() {
    // upgrade_status 0-升级维护中, 1-预发布, 2-已发布
    location.reload();
  }
}
