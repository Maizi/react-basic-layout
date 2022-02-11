class Url {
  /**
   * 将改变url参数值
   * @param {string} url url地址
   * @param {Json} data json对象
   * @returns {string}
   */
  changeUrlArg(url, arg, val) {
    var pattern = arg + '=([^&]*)',
      replaceText = arg + '=' + val,
      hashVal =
        url.indexOf('#') > -1 && url.split('#')[1]
          ? '#' + url.split('#')[1]
          : '',
      repUrl = hashVal !== '' ? url.split('#')[0] : url;
    url = repUrl.match(pattern)
      ? repUrl.replace(eval('/(' + arg + '=)([^&]*)/gi'), replaceText)
      : repUrl.match('[?]')
      ? repUrl + '&' + replaceText
      : repUrl + '?' + replaceText;

    return url + hashVal;
  }

  /**
   * 通过参数名获取url中的参数值
   * @param  {[string]} queryName [参数名]
   * @return {[string]}           [参数值]
   */
  getQueryValue(queryName) {
    var query = decodeURI(window.location.search.substring(1));
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] == queryName) {
        return pair[1];
      }
    }
    return null;
  }

  /**
   * 传入对象返回url参数
   * @param {Object} data
   * @returns {string}
   */
  getParam(data) {
    let url = '';
    for (var k in data) {
      let value = data[k] !== undefined ? data[k] : '';
      url += `&${k}=${encodeURIComponent(value)}`;
    }
    return url ? url.substring(1) : '';
  }

  /**
   * 将url和参数拼接成完整地址
   * @param {string} url url地址
   * @param {Json} data json对象
   * @returns {string}
   */
  getUrl(url, data) {
    //看原始url地址中开头是否带?，然后拼接处理好的参数
    return (url += (url.indexOf('?') < 0 ? '?' : '') + this.getParam(data));
  }
}

export default Url;
