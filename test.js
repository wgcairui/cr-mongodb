/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-11 09:15:53
 * @LastEditTime: 2019-08-11 10:05:08
 * @LastEditors: Please set LastEditors
 */
/* jshint esversion:8 */
const mongodb = require('./index')
const db = new mongodb(null,{db:'log',enable:true})

const test = async ()=>{
    let r = await db.find({db:'BS',collection:'bulletin'},{multi:true})
    console.log(r)
}

test()
