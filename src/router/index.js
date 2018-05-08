import Vue from 'vue'
import Router from 'vue-router'
//通用组件
import Login from '@/components/login.vue'
import nopage from '@/components/public/404.vue'
import noAccess from '@/components/public/noAccess.vue'
import supHome from '@/components/public/supHome.vue'
import changePw from '@/components/public/changePw.vue'
//superAdmin根组件 + 子目录
import grossIncome from '@/components/superAdmin/grossIncome.vue'
import allOrder from '@/components/superAdmin/allOrder.vue'
import addAccount from '@/components/superAdmin/addAccount.vue'
import addUser from '@/components/superAdmin/addUser.vue'
import mchList from '@/components/superAdmin/mchList.vue'
import getSettlementHistory from '@/components/superAdmin/getSettlementHistory.vue'
import allChannel from '@/components/superAdmin/allChannel'
import getAlladmin from '@/components/superAdmin/getAlladmin'
import transactionReport from '@/components/superAdmin/transactionReport'
import profitReport from '@/components/superAdmin/profitReport'
import getBankUserDetail from '@/components/superAdmin/getBankUserDetail'

//mch根组件 + 子目录
import orderList from '@/components/mch/orderList.vue'
import editMch from '@/components/mch/editMch.vue'
import mchSetHistory from '@/components/mch/mchSetHistory.vue'
//财务finance子目录
import fmchList from '@/components/finance/fmchList.vue'
//市场marketer子目录
import marketerOrder from '@/components/marketer/marketerOrder'
import marketerMchlist from '@/components/marketer/marketerMchlist'
//业务business子目录
import business from '@/components/business/business'


Vue.use(Router)


const defaultRouterMap = [
	{
		path:'/login',
		component:Login
	}
]

const adminRouterMap = [ //超级管理员
	{
		path:'/',
		component:supHome,
		hook:true,
		name:'数据中心',
		iconCls:'fa fa-cc-visa fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/index',
				component:grossIncome,
				name:'收入统计'
			},{
				hidden:false,
				path:'/allOrder',
				component:allOrder,
				name:'交易信息'
			},{
				hidden:false,
				path:'/getSettlementHistory',
				component:getSettlementHistory,
				name:'商户结算历史'
			},{
				hidden:false,
				path:'/getBankUserDetail',
				component:getBankUserDetail,
				name:'银行卡签约记录'
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'商户管理',
		iconCls:'fa fa-user-o fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/mchList',
				component:mchList,
				name:'商户列表'
			},{
				hidden:true,
				path:'/addAccount',
				component:addAccount
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'业务报表',
		iconCls:'fa fa-file-excel-o fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/transactionReport',
				component:transactionReport,
				name:'交易统计报表'
			},{
				hidden:false,
				path:'/profitReport',
				component:profitReport,
				name:'分润统计报表'
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'上游支付渠道',
		iconCls:'fa fa-chain fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/allChannel',
				component:allChannel,
				name:'支付渠道列表'
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'管理员',
		iconCls:'fa fa-address-book fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/getAlladmin',
				component:getAlladmin,
				name:'管理员列表'
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'系统设置',
		iconCls:'fa fa-wrench fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/addUser',
				component:addUser,
				name:'开通账号'
			},{
				hidden:false,
				path:'/changePw',
				component:changePw,
				name:'修改密码'
			}
		]
	},{
		path:'/404',
		component:nopage
	},{
		path:'/noAccess',
		component:noAccess
	},{
		path:'*',
		component:nopage
	}
]

const channelRouterMap = [ //渠道路由
	{
		path:'/',
		component:supHome,
		hook:true,
		name:'数据中心',
		iconCls:'fa fa-cc-visa fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/index',
				component:orderList,
				name:'订单列表'
			},{
				hidden:false,
				path:'/mchSetHistory',
				component:mchSetHistory,
				name:'结算历史'
			}
		]
	},{
		path:'/',
		component:supHome,
		hook:true,
		name:'系统设置',
		iconCls:'fa fa-wrench fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/editMch',
				component:editMch,
				name:'修改信息'
			},{
				hidden:false,
				path:'/changePw',
				component:changePw,
				name:'修改密码'
			}
		]
	},{
		path:'/404',
		component:nopage
	},{
		path:'/noAccess',
		component:noAccess
	},{
		path:'*',
		component:nopage
	}
]

const financeRouterMap = [ //财务路由
	{
		path:'/',
		component:supHome,
		hook:true,
		name:'数据中心',
		iconCls:'fa fa-cc-visa fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/index',
				component:grossIncome,
				name:'收入统计'
			},{
				hidden:false,
				path:'/fmchList',
				component:fmchList,
				name:'商户列表'
			},{
				hidden:false,
				path:'/allOrder',
				component:allOrder,
				name:'全部订单总览'
			},{
				hidden:false,
				path:'/getSettlementHistory',
				component:getSettlementHistory,
				name:'全部结算总览'
			}
		]
	},{
		path:'/404',
		component:nopage
	},{
		path:'/noAccess',
		component:noAccess
	},{
		path:'*',
		component:nopage
	}
]

const businessRouterMap = [
	{
		path:'/',
		component:supHome,
		hook:true,
		name:'业务中心',
		iconCls:'fa fa-cc-visa fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/index',
				component:profitReport,
				name:'分润统计报表'
			}
		]
	},{
		path:'/404',
		component:nopage
	},{
		path:'/noAccess',
		component:noAccess
	},{
		path:'*',
		component:nopage
	}
]

const marketerRouterMap = [
	{
		path:'/',
		component:supHome,
		hook:true,
		name:'市场中心',
		iconCls:'fa fa-cc-visa fa-fw fa-lg',
		children:[
			{
				hidden:false,
				path:'/index',
				component:marketerOrder,
				name:'订单明细'
			},{
				hidden:false,
				path:'/indexb',
				component:marketerMchlist,
				name:'商户列表'
			}
		]
	},{
		path:'/404',
		component:nopage
	},{
		path:'/noAccess',
		component:noAccess
	},{
		path:'*',
		component:nopage
	}
]

export default new Router({
  routes:defaultRouterMap,
  defaultRouterMap,
  adminRouterMap,
  channelRouterMap,
  financeRouterMap,
  businessRouterMap,
  marketerRouterMap
})
