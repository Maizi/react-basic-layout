import {Decimal} from 'decimal.js'

/**
 * @description 加法
 * @param {number} x 
 * @param {number} y 
 * @param {number} digits - 保留位数
 * @param {number} type - 类型 默认 1 - 截取
 */
export const mathPlus = (x, y, digits = 0, type = Decimal.ROUND_DOWN) => {
    x = new Decimal(x)
    y = new Decimal(y)

    return new Decimal(x.plus(y)).toFixed(digits, type)
}

/**
 * @description 减法
 * @param {number} x 
 * @param {number} y 
 * @param {number} digits - 保留位数
 * @param {number} type - 类型 默认 1 - 截取
 */
export const mathMinus = (x, y, digits = 0, type = Decimal.ROUND_DOWN) => {
    x = new Decimal(x)
    y = new Decimal(y)

    return new Decimal(x.minus(y)).toFixed(digits, type)
}

/**
 * @description 除法
 * @param {number} x 
 * @param {number} y 
 * @param {number} digits - 保留位数
 * @param {number} type - 类型 默认 1 - 截取
 */
export const mathDiv = (x, y, digits = 0, type = Decimal.ROUND_DOWN) => {
    x = new Decimal(x)
    y = new Decimal(y)

    return new Decimal(x.div(y)).toFixed(digits, type)
}

/**
 * @description 乘法
 * @param {number} x 
 * @param {number} y 
 * @param {number} digits - 保留位数
 * @param {number} type - 类型 默认 1 - 截取
 */
export const mathMul = (x, y, digits = 0, type = Decimal.ROUND_DOWN) => {
    x = new Decimal(x)
    y = new Decimal(y)

    return new Decimal(x.mul(y)).toFixed(digits, type)
}