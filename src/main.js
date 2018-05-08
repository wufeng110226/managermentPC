// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
//加载项目根组件
import App from './App'
import store from './vuex/store'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import 'font-awesome/css/font-awesome.min.css'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueResource);

Vue.http.options.emulateJSON = true;
Vue.http.options.headers = {
  'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'
};

let userPermission = JSON.parse(sessionStorage.getItem('user'));
if(userPermission){
	store.commit('SET_IDENTITY',userPermission.identity);
	let _routers = store.state.identity;
	store.dispatch('GenerateRoutes', router.options[_routers]).then(() => { // 生成可访问的路由表
		router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
	})
}


router.beforeEach((to, from, next) => {    //路由进入前的条件判断
	if(to.path === '/login'){
		sessionStorage.clear();
		store.commit('CLEAN_ROUTERS');
		next();
	}else{
		let user = JSON.parse(sessionStorage.getItem('user'));
		if(user){
			next();
			if(to.path === '/'){
				next({path:'/index'});
			}
		}else{
			next({path:'/login'})
		}
	}
})

//分转元
Vue.prototype.priceConversions = (price) => {
	if( typeof price !== 'number' || isNaN(price)){
		return 'null'
	}else{
		price = (price* 0.01).toFixed(2);
		price += '';  //转换成字符串
		let reg = price.indexOf('.') >-1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g;
		return price.replace(reg, '$1,');
	}
}

//改变0变成00 time选择器
Vue.prototype.appendZero = (obj) => {
	if(obj == 0){
		return "00"
	}else if(obj < 10){
		return "0" + obj
	}else{
		return obj
	}
}

//设置Cookie,增加到Vue实例方便全局调用
Vue.prototype.setCookie = (c_name, value, expireTimes) => {
	let exdate = new Date();
	exdate.setTime(exdate.getTime() + expireTimes);
	document.cookie = c_name + "=" + escape(value) + ((expireTimes = null) ? "" : ";expores=" + exdate.toGMTString());
}
//获取cookie
Vue.prototype.getCookie = (name) => {
	let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg)){
		return (arr[2]);
  }else{
  	return null;
  } 
};

//删除cookie
Vue.prototype.delCookie =(name) => {
    let exp = new Date();
    exp.setTime(exp.getTime() - 1);
    let cval = getCookie(name);
    if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}


/* eslint-disable no-new */
//实例化Vue
const app = new Vue({
	data:{},
	render:h => h(App),
	store,
	router,
	watch:{
		"$route":"checkLogin"
	},
	created(){
		this.checkLogin();
	},
	methods:{
		checkLogin(){
			let user = sessionStorage.getItem('user');
			if(!user){
				sessionStorage.clear();
				store.commit('CLEAN_ROUTERS');
				this.$router.push('/login');
			}
		}
	}
}).$mount('#app')
