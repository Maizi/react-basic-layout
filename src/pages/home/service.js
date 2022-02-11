import request from '@utils/request';

/***************** 首页 ***************** */

// 获取盲盒分组列表
export const getGroupCases = ({ ...props }) => {
  return request({
    url: '/api/cases',
    ...props,
  });
};

// 获取盲盒记录列表箱
export const getPoolRecords = (successFun) => {
  return request({
    url: '/api/common/item/logs',
    method: 'get',
    successFun,
  });
};
