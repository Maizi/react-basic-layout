import store from '@store/configureStore';
import SKIN_RARITY from '@constants/skinRarity';
import SKIN_RARITY_BG from '@constants/skinRarityBg';
import SKIN_EXTERIOR from '@constants/skinExterior';
import { Toast } from 'antd-mobile';
import history from '@utils/history';
import { modalVisibleAction } from '@actions/modal';
import { lStorage } from '@utils/storage';
import { RARITY_COMMON_IMAGES } from '@constants/composeUrl';
import { updateUserBasic } from '@actions/user';
import { updateNotification } from '@actions/notification';

export var auth = {
  loggedIn() {
    if (lStorage.get('funplay_user_data') || getCookie('funplay_user_data')) {
      let userData = JSON.parse(
        lStorage.get('funplay_user_data') || getCookie('funplay_user_data')
      );
      return (
        'uuid' in userData && userData.uuid
        // 'uuid' in store.getState().user.basic && store.getState().user.basic.uuid
      );
    } else {
      return false;
    }
  },
  getToken() {
    return lStorage.get('token');
  },
  logout(callback) {
    lStorage.remove('funplay_user_data');
    lStorage.remove('Authorization');
    clearCookie('Authorization');
    clearCookie('funplay_user_data');
    store.dispatch(updateUserBasic(null));
    store.dispatch(updateNotification({ unreadMsg: [0, 0] }));

    // delete localStorage.token
    callback && callback();
  },
  currencyActive() {
    // 是否启用代币
    return true;
  },
};

function ab2str(buf) {
  return decodeURIComponent(
    escape(String.fromCharCode.apply(null, new Uint8Array(buf)))
  );
}

// 字符串转为ArrayBuffer对象，参数为字符串
// function str2ab(str) {
//   	let buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
//   	let bufView = new Uint16Array(buf);
//   	for (var i = 0, strLen = str.length; i < strLen; i++) {
//     	bufView[i] = str.charCodeAt(i);
//   	}
//   	return buf;
// }

// 发送消息编码
function encodeMsg(seqNo, msgCode, obj) {
  let body = JSON.stringify(obj),
    l = 12 + body.length,
    buf = new ArrayBuffer(l),
    dv = new DataView(buf);

  dv.setUint32(0, 0x1234abcd, false);
  dv.setUint16(4, l, false);
  dv.setUint16(6, seqNo, false);
  dv.setUint32(8, msgCode, false);
  for (var i = 0; i < body.length; i++) {
    //console.log("char", body.charAt(i), "buf", buf)
    dv.setInt8(12 + i, body.charCodeAt(i));
  }
  return buf;
}

// 防抖
export function debounce(fn, wait) {
  var timeout = null;
  return function () {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  };
}

// 节流
export function throttle(func, wait) {
  let previous = 0;
  return function () {
    let now = Date.now();
    let context = this;
    let args = arguments;
    if (now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  };
}

// 获取url地址参数
export function getUrlParams(key, url = location.search) {
  return new URLSearchParams(url).get(key) || '';
}

// 接受消息解码
export function decodeSocketMsg(buf) {
  let dv = new DataView(buf);
  if (buf.byteLength < 12) {
    return;
  }
  let magicHeader = dv.getUint32(0, false);
  if (magicHeader != 0x1234abcd) {
    return;
  }
  let l = dv.getUint16(4, false);
  if (l != buf.byteLength) {
    return;
  }
  var data = {};
  data.seqNo = dv.getUint16(6, false);
  data.msgCode = dv.getUint32(8, false);
  //console.log('ab2str(buf.slice(12))', ab2str(buf.slice(12)))
  data.body = ab2str(buf.slice(12)) ? JSON.parse(ab2str(buf.slice(12))) : {};
  return data;
}

// websocket 发送消息
export function wsSendMsg(req, msgCode) {
  return encodeMsg(0, msgCode, req);
}

// 补零
export function padLeft(str, length = 2) {
  return ('' + str).length >= length ? str : padLeft('0' + str, length);
}

// 小数补零
export function padLeftFloat(number, len) {
  var origin = parseFloat(number);

  if (isNaN(origin)) {
    return 0;
  }
  var str = number.toString();
  var decimal = str.indexOf('.');
  if (decimal < 0) {
    decimal = str.length;
    str += '.';
  }
  while (str.length <= decimal + len) {
    str += '0';
  }
  return str;
}

// 获取品质背景
export function getSkinRarityBg(rarity, model_category, open_type, imgUrl) {
  if (
    model_category == '1' ||
    model_category == '2' ||
    (open_type && +open_type === 2)
  ) {
    rarity = 'contraband';
  }

  // 秘宝
  if (open_type && open_type === 3)
    return {
      backgroundImage: imgUrl
        ? `url(${imgUrl})`
        : `url(${RARITY_COMMON_IMAGES.ticket})`,
    };

  rarity = rarity || 'contraband';

  let hex = `#${getRarityBgColor(rarity)}`;

  return { background: `linear-gradient(0deg, ${hex}, #191830)` };
}

// 分离物品名
export function getCaseName(name) {
  return name.replace(/ /g, '').split('|');
}

// 获取磨损度
export function getExterior(key, standard) {
  let keys = parseInt(key);
  if (isNaN(keys)) {
    return key;
  }

  for (let i = 0, iMax = SKIN_EXTERIOR.length; i < iMax; i++) {
    if (+SKIN_EXTERIOR[i].key === +keys) {
      return standard === 'standard'
        ? SKIN_EXTERIOR[i]['cn']
        : SKIN_EXTERIOR[i]['cn-short'];
    }
  }

  return key;
}

// 根据key值获取对应的内容 - 返回匹配到的第一个值
export function getItemByKey(type, options) {
  return options.filter((item) => item.key == type)[0]
    ? options.filter((item) => item.key == type)[0].value
    : type;
}

// 判断当前时间戳是否为今天
function isToday(timeline) {
  return new Date(timeline * 1000).toDateString() === new Date().toDateString();
}

// object 遍历累加对应值
export function getSumofObject(obj, filterVal) {
  let value = 0,
    perVal = 0,
    sysVal = 0;
  if (obj) {
    Object.keys(obj).map((item) => {
      filterVal != item && (perVal += obj[item]);
    });
    Object.keys(obj).map((item) => {
      filterVal == item && (sysVal += obj[item]);
    });
  }
  value = perVal + sysVal;
  const sumParams = { value: value, perVal: perVal, sysVal: sysVal };
  return sumParams;
}

// 优惠券过期时间格式化
export function getExpireFormat(expire) {
  // 获取格式
  let results = '';
  if (+expire === 0) {
    // 永久
    results = '永久';
  } else {
    let time = new Date().getTime() / 1000;

    if (time < expire) {
      let seconds = expire - time,
        mins = parseInt(seconds / 60),
        hours = parseInt(mins / 60),
        days = parseInt(hours / 24),
        mons = parseInt(days / 30);

      if (mons > 0) {
        results = `${mons}个月后过期`;
      } else if (days > 0) {
        results = `${days}天后过期`;
      } else if (hours > 0) {
        results = `${hours}小时后过期`;
      } else if (mins > 0) {
        results = `${mins}分钟后过期`;
      } else if (seconds > 0) {
        results = '1分钟内过期';
      }
    }
  }

  return results;
}

// 时间戳转年月日
function datelineFormate(dateline, type) {
  let dates = new Date(
      dateline.toString().length > 10 ? dateline : dateline * 1000
    ),
    year = dates.getFullYear(),
    month = dates.getMonth() + 1,
    date = dates.getDate(),
    hour = dates.getHours(),
    minute = dates.getMinutes(),
    second = dates.getSeconds();

  month = month < 10 ? '0' + month : month;
  date = date < 10 ? '0' + date : date;
  hour = hour < 10 ? '0' + hour : hour;
  minute = minute < 10 ? '0' + minute : minute;
  second = second < 10 ? '0' + second : second;

  switch (type) {
    case 'y.m.d':
      return year + '.' + month + '.' + date;
    case 'y.m.d.h.m':
      return year + '.' + month + '.' + date + ' ' + hour + ':' + minute;
    case 'day':
      return year + '-' + month + '-' + date;
    case 'ch-day':
      return year + '年' + month + '月' + date + '日';
    case 'm.d':
      return month + '.' + date;
    case 'm-d':
      return month + '-' + date;
    case 'm|d':
      return dates.getMonth() + 1 + '月' + date + '日';
    case 'mdhm':
      return month + '-' + date + ' ' + hour + ':' + minute;
    case 'y-m-d h:m':
      return year + '-' + month + '-' + date + ' ' + hour + ':' + minute;
    case 'hm':
      return hour + ':' + minute;
    case 'm/d':
      return month + '/' + date;
    case 'hms':
      return hour + ':' + minute + ':' + second;
    case 'week': //返回星期几
      switch (new Date(year + '/' + month + '/' + date).getDay()) {
        case 0:
          return '星期天';
        case 1:
          return '星期一';
        case 2:
          return '星期二';
        case 3:
          return '星期三';
        case 4:
          return '星期四';
        case 5:
          return '星期五';
        case 6:
          return '星期六';
        default:
          return '';
      }
    default:
      return (
        year +
        '-' +
        month +
        '-' +
        date +
        '   ' +
        hour +
        ':' +
        minute +
        ':' +
        second
      );
  }
}

export function colorRgba(sHex, alpha = 1) {
  if (!sHex) {
    throw Error('颜色 不能为空');
  }
  // 十六进制颜色值的正则表达式
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  /* 16进制颜色转为RGB格式 */
  let sColor = sHex.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //  处理六位的颜色值
    var sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    // return sColorChange.join(',')
    // 或
    return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')';
  } else {
    return sColor;
  }
}

// 获取品质颜色
export function getRarityColor(model_rarity, category) {
  // 手套跟刀 - 金色
  if ([1, 2].includes(+category)) {
    return 'd5c118';
  }

  for (let i = 0, len = SKIN_RARITY.length; i < len; i++) {
    if (SKIN_RARITY[i].key === model_rarity) {
      return SKIN_RARITY[i].color;
    }
  }
  return 'ddd';
}

// 获取背景品质颜色
export function getRarityBgColor(model_rarity, category) {
  // 手套跟刀 - 金色
  if ([1, 2].includes(+category)) {
    return '332b20';
  }

  for (let i = 0, len = SKIN_RARITY_BG.length; i < len; i++) {
    if (SKIN_RARITY_BG[i].key === model_rarity) {
      return SKIN_RARITY_BG[i].color;
    }
  }
  return 'ddd';
}

/**
 *
 * @param hex 例如:"#23ff45"
 * @param opacity 透明度
 * @returns {string}
 */
export function hexToRgba(hex, opacity) {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
}

export function getBorderColor(
  model_rarity,
  model_category,
  dir,
  open_type,
  imgUrl
) {
  // 0 - 普通 | 1 - 多倍 | 2 - 附属
  if (open_type && +open_type === 2) {
    return { [`border${dir || 'Bottom'}Color`]: '#d5c118' };
  }

  // 秘宝 四期秘宝调整下边框
  if (open_type && open_type === 3) {
    return imgUrl
      ? { borderBottomColor: '#ea2262' }
      : { [`border${dir || 'Bottom'}Color`]: '#5957DD' };
  }

  if (!model_rarity) {
    //return {}
    return { [`border${dir || 'Bottom'}Color`]: '#d5c118' };
  }

  if ([1, 2].includes(+model_category)) {
    return { [`border${dir || 'Bottom'}Color`]: '#d5c118' };
  }

  for (let i = 0, len = SKIN_RARITY.length; i < len; i++) {
    if (SKIN_RARITY[i].key === model_rarity) {
      return { [`border${dir || 'Bottom'}Color`]: '#' + SKIN_RARITY[i].color };
    }
  }

  // 返回默认颜色
  return { [`border${dir || 'Bottom'}Color`]: '#575A6A' };
}

/**
 * @param Object res 			接口返回值
 * @param Number duration 		message持续时间
 * @param Number reloadDuration 等待xx时间刷新
 * @param String defaultMsg 		备用msg
 * @param Boolean isHideMsg 	是否展示msg
 */
let isErrcode10000 = false; // 去重多次弹窗问题
export const errTips = ({
  res,
  /*duration, defaultMsg, */ isHideMsg,
  isIgnoreUpdateCheck = false,
}) => {
  // 接口需要用户登录权限
  if (res.code === 10000) {
    if (!isErrcode10000) {
      isErrcode10000 = true;
      // 清除用户登录缓存数据
      auth.logout();

      const loHref = new URL(location.href);
      history.push(`/login?redirect=${loHref.pathname}${loHref.search}`);

      setTimeout(() => {
        Toast.show({
          content: '账户已过期，请重新登录',
          maskClassName: 'unit-toast',
        });
      }, 0);

      setTimeout(() => {
        isErrcode10000 = false;
      }, 2000);
    }
    return;
  }

  // 维护中
  if (!isIgnoreUpdateCheck && res.code === 20000) {
    // history.push('/update')
    location.href = '/update';
    return;
  }

  // 未通过实名认证 || 实名认证为未成年人
  if ([1018, 1020].includes(res.code)) {
    store.dispatch(
      modalVisibleAction({
        teenagerStatus: res.code === 1018 ? 'under18' : 'noauth',
      })
    );
    return;
  }

  !isHideMsg &&
    res.code !== 3001 &&
    Toast.show({
      content: res.message,
      maskClassName: 'unit-toast',
    });
};

export function formatBeijing(dateVal, formatVal) {
  var format = formatVal || 'yyyy-MM-dd hh:mm:ss',
    timezone = 8, //目标时区时间，东八区
    offset_GMT = new Date().getTimezoneOffset(), // 本地时间和格林威治的时间差，单位为分钟
    nowDate = new Date(dateVal && +dateVal).getTime(), // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
    date = new Date(
      nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000
    ),
    dateObj = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };

  // format - year
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    );
  }

  // format - !year
  for (var k in dateObj) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? dateObj[k]
          : ('00' + dateObj[k]).substr(('' + dateObj[k]).length)
      );
    }
  }

  return format;
}

// 判断是否对象
const isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

// px 转 rem，保留3位小数
export const pxTorem = (px) => {
  return ((10 * px) / 750).toFixed(3) + 'rem';
};

// 拼接url参数
function getQueryString(params) {
  if (!isObject(params)) {
    return '';
  }

  let str = '';
  let count = 0;
  for (let key in params) {
    str += (count === 0 ? '?' : '&') + `${key}=${params[key]}`;
    count++;
  }

  return str;
}

// 判断是否qq浏览器
export const isQQ =
  navigator.userAgent.toLocaleLowerCase().match(/tencenttraveler/) != null ||
  navigator.userAgent.toLocaleLowerCase().match(/qqbrowse/) != null;

//设置cookie
export function setCookie(name, value, seconds) {
  seconds = seconds || 0; //seconds有值就直接赋值，没有为0
  var expires = '';
  if (seconds != 0) {
    //设置cookie生存时间
    var date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    expires = '; expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + escape(value) + expires + '; path=/'; //转码并赋值
}

//取得cookie
export function getCookie(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';'); //把cookie分割成组
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]; //取得字符串
    while (c.charAt(0) == ' ') {
      //判断一下字符串有没有前导空格
      c = c.substring(1, c.length); //有的话，从第二位开始取
    }
    if (c.indexOf(nameEQ) == 0) {
      //如果含有我们要的name
      return unescape(c.substring(nameEQ.length, c.length)); //解码并截取我们要值
    }
  }
  return false;
}

//清除cookie
export function clearCookie(name) {
  setCookie(name, '', -1);
}

export { isToday, datelineFormate, getQueryString };

// 图片地址拼接
export function contactImgUrl(url) {
  return url.indexOf('data:image/') > -1
    ? url
    : `${envConfig.STATIC_DOMAIN_FOR_IMAGE}${url.split('../../')[1]}`;
}

// 动态加载js
export function loadScript(url, callback) {
  let scripts = document.getElementsByTagName('script');
  let loaded = false;
  for (let i = 0, iMax = scripts.length; i < iMax; i++) {
    if (scripts[i].src === url) {
      loaded = true;
      break;
    }
  }

  // js 已成功加载，不需重复加载
  if (loaded) {
    callback && callback();
    return;
  }

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = url;
  document.head.appendChild(script);

  script.onload = () => {
    callback && callback();
  };
}

// 格式化金额，保留两位小数
export function allToFixed(value, digit = 2) {
  return !isNaN(parseFloat(value)) ? parseFloat(value).toFixed(digit) : '-';
}

// 根据日期获取当前周 dateTime - new Date()
export function getWeek(dateTime) {
  let temptTime = dateTime;
  //周几
  let weekday = temptTime.getDay() || 7;
  //周1+5天=周六
  temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
  let firstDay = new Date(temptTime.getFullYear(), 0, 1);
  let dayOfWeek = firstDay.getDay();
  let spendDay = 1;
  if (dayOfWeek != 0) {
    spendDay = 7 - dayOfWeek + 1;
  }
  firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
  let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
  let result = Math.ceil(d / 7);
  return result + 1;
}

//手机校验
export const phoneReg = (value) => {
  const phoneReg = /^1[3456789]\d{9}$/;
  return phoneReg.test(value);
};

// 判断是否手机浏览器
export const isPhone = () => {
  const sUserAgent = navigator.userAgent.toLowerCase();
  const bIsIpad = sUserAgent.match(/ipad/i) == 'ipad';
  const bIsIphoneOs = sUserAgent.match(/iphone os/i) == 'iphone os';
  const bIsMidp = sUserAgent.match(/midp/i) == 'midp';
  const bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == 'rv:1.2.3.4';
  const bIsUc = sUserAgent.match(/ucweb/i) == 'ucweb';
  const bIsAndroid = sUserAgent.match(/android/i) == 'android';
  const bIsCE = sUserAgent.match(/windows ce/i) == 'windows ce';
  const bIsWM = sUserAgent.match(/windows mobile/i) == 'windows mobile';
  return (
    bIsIpad ||
    bIsIphoneOs ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsAndroid ||
    bIsCE ||
    bIsWM
  );
};

//路由跳转
export const routerJump = (path) => {
  if (path === '') {
    return;
  }

  const isCaseAlias = path.indexOf('/case/') === 0;

  path.slice(0, 1) === '/'
    ? history.push(path, isCaseAlias ? { case_alias: path.split('/')[2] } : {})
    : (location.href = path);
};

// 获取网站来源referrer
export const getReferrer = () => {
  return (
    new URLSearchParams(location.search).get('referrer') || document.referrer
  );
};

// 判断浏览器
export const isAgentFun = () => {
  if (/MicroMessenger/.test(window.navigator.userAgent)) {
    return 'wx';
  } else if (/AlipayClient/.test(window.navigator.userAgent)) {
    return 'zfb';
  } else {
    return 'more';
  }
};

// 判断手机
export const IsAndroid = () => {
  var u = navigator.userAgent;

  var isandroid =
    u.toLocaleLowerCase().indexOf('android') > -1 ||
    u.toLocaleLowerCase().indexOf('adr') > -1;

  if (isandroid) {
    return true; //android(安卓手机）
  } else {
    return false; //ios（苹果手机）
  }
};
