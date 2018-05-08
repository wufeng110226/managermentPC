import Vue from 'vue'
import Vuex from 'vuex'
import router from '@/router'
Vue.use(Vuex);

const state = {
	routers: router.options.defaultRouterMap,
    addRouters: [],
    identity:''
}

const getters = {
	permission_routers:function(state){
		return state.routers
	},
	addRouters:function(state){
		return state.addRouters
	}
}

const mutations = {
	SET_ROUTERS(state,routers){
		state.addRouters = routers
		state.routers = router.options.defaultRouterMap.concat(routers)
	},
	CLEAN_ROUTERS(state,routers){
		state.addRouters = []
		state.identity = ''
		state.routers = router.options.defaultRouterMap
	},
	SET_IDENTITY(state,identity){
		if(identity == '0'){
			state.identity = 'channelRouterMap'
		}else if(identity == '1'){
			state.identity = 'adminRouterMap'
		}else if(identity == '2'){
			state.identity = 'financeRouterMap'
		}else if(identity == '3'){
			state.identity = 'businessRouterMap'
		}else if(identity == '4'){
			state.identity = 'marketerRouterMap'
		}
	}
}

const actions = {
	GenerateRoutes({commit}, getRouter){
		commit('SET_ROUTERS', getRouter)
	}
}


export default new Vuex.Store({
	state,mutations,getters,actions
})