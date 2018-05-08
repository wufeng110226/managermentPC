let localhostDev = true;
//如果是本地开发，就把localhostDev 设置成true，连接就是拼成‘http://localhost:8080/api/test’
//生产环境，就把localhostDev 设置成false，连接就是拼成‘http://xxx.com/api/test’
let _host= localhostDev ? 'http://192.168.188.109:3020' : '';
let httpUrl = {
    'login': _host + '/api/user/login',
    'resetPassword':_host + '/api/user/resetPassword',
    //'updateChannelListByMchId':_host + '/api/business/updateChannelListByMchId',
    //'getChannelByRole':_host + '/api/business/getChannelByRole',
    'operaMchInfos_2':_host + '/api/business/operaMchInfos/2',
    'operaMchInfos_1':_host + '/api/business/operaMchInfos/1',
    'getMchInfos':_host + '/api/business/getMchInfos',
    'getTotalAmountByTime':_host + '/api/business/getTotalAmountByTime',
    'updateSettlementHistoryStatus':_host + '/api/business/updateSettlementHistoryStatus',
    'getSettlementHistory':_host + '/api/business/getSettlementHistory',
    'getSettlementHistoryByMchId':_host + '/api/business/getSettlementHistoryByMchId',
    'operaAdmin':_host + '/api/business/operaAdmin',
    'getAllAdmin':_host + '/api/business/getAllAdmin',
    //'getOrderInfoListByMchId':_host + '/api/business/getOrderInfoListByMchId',
    //'getOrderInfoList':_host + '/api/business/getOrderInfoList',
    'getAllChannel':_host + '/api/business/getAllChannel',
    'operaChannel':_host + '/api/business/operaChannel',
    'saveRoles':_host + '/api/user/saveRoles',
    'saveMchInfos':_host + '/api/business/saveMchInfos',
    'modifyPassword':_host + '/api/user/modifyPassword',
    'getMchInfosByMchId':_host + '/api/business/getMchInfosByMchId',
    'getBankOrderExcel':_host + '/api/order/getBankOrderExcel',       //导出excel
    'operaViewMchList':_host + '/api/business/operaViewMchList',  //商户分配，市场获取可查看商户列表
    'getBankOrderDetail':_host + '/api/order/getBankOrderDetail', //查询银行订单记录
    'getBankUserDetail':_host + '/api/order/getBankUserDetail'    //查询银行卡验证签约记录
    
};
export {httpUrl}