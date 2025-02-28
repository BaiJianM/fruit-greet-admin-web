import axios from 'axios'
import {Message} from 'element-ui'

const rootUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8081/admin' : 'http://8.138.177.7/web/';

// 创建axios实例
const service = axios.create({
    baseURL: rootUrl, // 根据你的配置修改接口根路径
    timeout: 30 * 1000 // 设置请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在这里可以做一些请求前的处理，例如添加token
        let token = localStorage.getItem('token') || ''
        console.log('这时候的token值：' + token)
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token // 在请求头中添加token
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 判断响应状态码
        if (response.status !== 200) {
            // 如果HTTP响应码不为200，弹出异常消息
            Message.error('服务异常')
            return Promise.reject(new Error('服务异常'))
        }
        // 判断自定义code，如果不为200，抛出异常
        const {code, msg} = response.data
        if (code !== 200) {
            Message.error(msg || '请求失败')
            return Promise.reject(new Error(msg || '请求失败'))
        }
        // 返回正常数据
        return response.data
    },
    error => {
        const errJson = JSON.parse(JSON.stringify(error))
        if (errJson.config.url.includes("login")) {
            Message.error(errJson.response.data.msg || '网络异常')
            return Promise.reject(error)
        } else {
            Message.error(error.message || '网络异常')
            // this.$router.replace({name: "login"});
            return Promise.reject(error)
        }
    }
)

// 封装GET请求
export const get = (url, params = {}) => {
    return service.get(url, {params})
}

// 封装POST请求
export const post = (url, data = {}, headers = {}) => {
    return service.post(url, data, headers)
}

export default {
    install(Vue) {
        Vue.prototype.$request = {
            get,
            post
        }
    }
}