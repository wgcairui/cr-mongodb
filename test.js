/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-11 09:15:53
 * @LastEditTime: 2019-08-11 22:19:24
 * @LastEditors: Please set LastEditors
 */
/* jshint esversion:8 */
const mongodb = require('./index')
const db = new mongodb(null,{db:'log',enable:true})

const test = async ()=>{
    //let r = await db.find({db:'BS',collection:'bulletin'},{multi:true},{log_collection:'dev',user:'admin'})
    //let r = await db.insert({db:'BS',collection:'bulletin'},{query:{date:'1234'}},{log_collection:'dev',user:'admin'})
    //let r = await db.insert({db:'BS',collection:'bulletin'},{query:[{date:'1234'},{tes:'kjklm'}]},{log_collection:'dev',user:'admin'})
    
    let r =  (await db.Conection).db('BS').collection('bulletin').updateOne({date:'1234'},{$set:{update:1}},{upsert:true}) // db.update({db:'BS',collection:'bulletin'},{query:{date:'1234'},modify:{$set:{update:1}}},{log_collection:'dev',user:'admin'})
    r = await db.updatSerize(r,{log_collection:'dev',user:'admin'})
    console.log(r)
}

test()
