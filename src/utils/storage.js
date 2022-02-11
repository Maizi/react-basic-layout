class Storage {
  constructor(store) {
    if (!store) {
      // 不支持localstorage
      return;
    }
    this._store = store;
  }

  /**
   * @function 获取类型
   * @param {any} 必须参数，属性判断
   */
  getType(value) {
    let type = typeof value;
    if (type === 'number' && isNaN(value)) return 'NaN';
    if (type !== 'object') return type;

    return Object.prototype.toString
      .call(value)
      .replace(/[\[\]]/g, '')
      .split(' ')[1]
      .toLowerCase();
  }

  /**
   * @function 存储值格式化 - storage只能存储字符串
   * @param {any} 必须参数，存储值
   */
  filterValue(value) {
    let type = this.getType(value),
      nullVal = ['null', 'undefined', 'NaN'],
      stringVal = ['boolen', 'number', 'string'];

    if (nullVal.indexOf(type) >= 0) return '';
    if (stringVal.indexOf(type) >= 0) return value;

    return JSON.stringify(value);
  }

  /**
   * @function 新增值
   * @param {string} key 必须参数，属性
   * @param {any} 可选参数，属性值
   */
  add(key, value) {
    if (!this._store) return;
    let keyType = this.getType(key);
    // 属性值必须为字符串
    if (keyType === 'string') {
      let storeValue = this.get(key),
        result;
      switch (this.getType(value)) {
        case 'array':
          storeValue = storeValue ? JSON.parse(storeValue) : [];
          result = [...storeValue, ...value];
          break;
        case 'object':
          storeValue = storeValue ? JSON.parse(storeValue) : {};
          result = Object.assign({}, storeValue, value);
          break;
        default:
          result = storeValue;
          break;
      }

      this.set(key, result);
    }
  }

  /**
   * @function 设置值
   * @param {string} key 必须参数，属性
   * @param {any} value 可选参数，属性值
   */
  set(key, value) {
    if (!this._store) return;
    let keyType = this.getType(key);

    // 属性值必须为字符串
    if (keyType === 'string') {
      this._store.setItem(key, this.filterValue(value));
    }
  }

  /**
   * @function 获取值
   * @param {string} key 必须参数，属性
   * @param {any} value 可选参数，属性值
   */
  get(key) {
    if (!this._store) return;
    let keyType = this.getType(key),
      res;

    // 属性值必须为字符串
    if (keyType === 'string') {
      res = this._store.getItem(key);
    }

    return res;
  }

  /**
   * @function 移除值
   * @param {string} key 必须参数，属性
   * @param {any} key 可选参数，storage中对象的key值或者数组中的指定值
   */
  remove(key, value) {
    if (!this._store) return;
    let keyType = this.getType(key);

    // 属性值必须为字符串
    if (keyType === 'string') {
      // 删除storage中某个固定的值
      if (value) {
        let storeValue = this.get(key);
        if (storeValue) {
          storeValue = JSON.parse(storeValue);
          switch (this.getType(storeValue)) {
            case 'array':
              storeValue = storeValue.filter(({ item }) => item !== value);
              break;
            case 'object':
              if (value in storeValue) {
                delete storeValue[value];
              }
              break;
            default:
              break;
          }
        }

        this.set(key, storeValue);
        return;
      }

      this._store.removeItem(key);
    }
  }
}

class LocalStorage extends Storage {
  constructor(store) {
    super(store);
  }
}

class SessionStorage extends Storage {
  constructor(store) {
    super(store);
  }
}

var storageTest = function (storage) {
  if (storage) {
    try {
      storage.setItem('key', 'value');
      storage.removeItem('key');
      return true;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
};

const lStorage = storageTest(window.localStorage)
  ? new LocalStorage(window.localStorage || localStorage)
  : new SessionStorage(window.sessionStorage || sessionStorage);
const sStorage = new SessionStorage(window.sessionStorage || sessionStorage);

export { lStorage, sStorage };
