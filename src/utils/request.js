import React from 'react';
import store from '@store/configureStore';
import LoadingIcon from '@components/loading_icon';
import { Toast } from 'antd-mobile';
import { errTips, getCookie, setCookie } from '@utils/common';
import { modalVisibleAction } from '@actions/modal';
import { lStorage } from '@utils/storage';
import axios from 'axios';

const axiosInstance = axios.create({
  timeout: 60000,
});

axiosInstance.interceptors.response.use(
  (res) => {
    // 默认情况下 res.headers.authorization 的值是undefined，headers中没有authorization
    let token = res.headers.authorization; // 注意 axios获取到的response里面headers值 key都是小写，实际后端返回的key值规则是首字母大写
    if (token) {
      lStorage.set('Authorization', token);
      setCookie('Authorization', token);
    }

    return res;
  },
  () => {
    store.dispatch(
      modalVisibleAction({
        exceptionVisible: true,
        exceptionType: 'requestError',
      })
    );
  }
);

export default function request({
  url,
  method = 'get',
  data,
  headers = {},
  successFun,
  errorFun,
  expectionFun,
  isHideMsg,
  hideLoadingToast = false,
  defaultMsg,
  isIgnoreUpdateCheck,
}) {
  const token = lStorage.get('Authorization') || getCookie('Authorization');

  // 存在用户登录信息
  if (token) {
    const gLang = 'zh-CN';

    headers.Authorization = token;
    headers['Accept-language'] = gLang; //  语言配置
  }

  if (!hideLoadingToast) {
    Toast.show({
      icon: <LoadingIcon />,
      maskClickable: false,
      duration: 0,
    });
  }

  axiosInstance({
    method,
    url: `${envConfig.API}${url}`,
    data,
    headers,
  })
    .then((res) => {
      Toast.clear();
      // 错误
      if (!res.data.status) {
        errTips({
          res: res.data,
          defaultMsg,
          duration: 5000,
          reloadDuration: 5000,
          isHideMsg,
          isIgnoreUpdateCheck,
        });

        errorFun && errorFun(res.data);
        return;
      }

      successFun && successFun(res.data);
      // Toast.clear();
    })
    .catch((error) => {
      expectionFun && expectionFun(error);

      // 显示通用弹窗
    });
}
