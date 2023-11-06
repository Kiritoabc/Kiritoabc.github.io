---
title: Axios
author: 菠萝
email: 2493381254@qq.com
readmore: true
hideTime: true
categories: 前端
tag: 前端开发小技巧
---

Axios学习

# Axios

## 项目中对于axios的简单二次封装



<!-- more -->

- 使用yarn添加axios

~~~powershell
yarn add axios
~~~



- 封装,创建一个request.js文件

~~~js
import axios from "axios";


const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 2000
});


// todo: 拦截器暂时不需要


/**
 * 基于axios  二次封装的get 请求
 * @param url
 * @param params
 * @returns {Promise<unknown>}
 */
const get = function (url, params) {
    return new Promise((resolve, reject) => {
        instance
            .get(url, params)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
};

/**
 * 基于axios 二次封装的 post 请求
 * @param url
 * @param data
 * @returns {Promise<unknown>}
 */
const post = function (url, data) {
    return new Promise((resolve, reject) => {
        instance
            .post(url, data)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
};

export default {get, post}
~~~



- 封装完成后可以在 api 文件夹下创建属于自己的 api 用于发送请求，便于管理。

例如

~~~js
import request from '../../utils/request';


export function helloApi(){
    return request.get("/hello",{})
}
~~~

