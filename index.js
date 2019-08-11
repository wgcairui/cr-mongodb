/*
 * @Description: In User Settings Edit
 * @Author: cairui
 * @Date: 2019-08-11 00:03:40
 * @LastEditTime: 2019-08-11 22:20:51
 * @LastEditors: Please set LastEditors
 */
/* jshint esversion:8 */
const MongoClient = require('mongodb').MongoClient;
const util = require('util')


/**
 *new 传递一个新的url，本机默认为null、、
 *log is obj,传递log dbname，enable配置是否启用log写入
 * @class mongodb
 */
class mongodb {
    constructor(url, log = { db: 'log', enable: false }) {
        this.url = url || 'mongodb://localhost:27017';
        this.Conection = new Promise((res, rej) => {
            MongoClient.connect(this.url, { useNewUrlParser: true }, function (err, client) {
                if (err) rej(err)
                res(client)
            });
        }),
            this.log = new Promise((resolve, reject) => {
                if (log) {
                    let { db, enable } = log;
                    if (!enable) resolve(null)
                    MongoClient.connect(this.url, { useNewUrlParser: true }, function (err, client) {
                        if (err) reject(err)
                        resolve(client.db(db))
                    })
                } else {
                    res(null)
                }
            })

    }

    setConnect(connect = { db, collection, }) {
        let { db, collection, } = connect
        this.db = db
        this.collection = collection
    }

    /**
     *
     *
     * @param {*} { collection, msg }collection集合名称，msg为log消息体，
     * @memberof mongodb
     */
    async write_log({ log_collection = 'other', msg }) {
        if (await this.log && log_collection) {
            try {
                (await this.log).collection(log_collection).insertOne(Object.assign(msg, { generateTime: this.Dates().cn }, { DateTime: new Date() }))
            } catch (error) {
                console.error(error);

            }
        }
    }

    Dates() {
        let d = new Date()
        let en = new Date(...[d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()])
        let cn = new Date(...[d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours() + 8, d.getMinutes(), d.getSeconds(), d.getMilliseconds()])
        return { cn, en }
    }

    /**
     *
     *
     * @param {*} [connect={ db, collection, }] db数据库，collection集合
     * @param {*} [querys={ query: {}, result: {}, multi }] query查询条件，result返回刷选，multi多选
     * @param {string} [log={ log_collection, msg: {}, user: 'all' }] 日志对象
     * @returns
     * @memberof mongodb
     */
    async find(connect = { db, collection, }, querys = { query: {}, result: {}, multi }, log = { log_collection, msg: {}, user: 'all' }) {
        if (connect) {
            let { db, collection, } = connect;
            let { query, result, multi } = querys
            let { log_collection, msg, user } = log
            try {
                let Arr_result = (await this.Conection).db(db).collection(collection).find(query).project(Object.assign({ _id: 0 }, result)).toArray()
                console.log(log_collection);

                this.write_log({ log_collection, msg: { infoType: 'mongoFind', infoStatu: 'success', infoBody: Object.assign(connect, querys), infoUser: user } })
                return multi ? Arr_result : Arr_result[0]
            } catch (error) {
                console.error(error)
                this.write_log({ log_collection, msg: { infoType: 'mongoFind', infoStatu: 'error', infoBody: Object.assign(connect, querys, { error: error }), infoUser: user } })
                return false
            }
        } else {
            throw Error('find db arg is null')
        }
    }

    /**
     *
     *
     * @param {*} [connect={ db, collection, }]
     * @param {*} [querys={ query}]
     * @param {string} [log={ log_collection, msg: {}, user: 'all' }]
     * @returns
     * @memberof mongodb
     */
    async insert(connect = { db, collection, }, querys = { query }, log = { log_collection, msg: {}, user: 'all' }) {
        if (connect) {
            let { db, collection, } = connect;
            let { query } = querys
            let { log_collection, msg, user } = log
            try {
                let Arr_result
                if (util.isArray(query)) {
                    Arr_result = await (await this.Conection).db(db).collection(collection).insertMany(query)
                } else {
                    Arr_result = await (await this.Conection).db(db).collection(collection).insertOne(query)
                }
                this.write_log({ log_collection, msg: { infoType: 'mongoInsert', infoStatu: 'success', infoBody: Object.assign(connect, querys), infoUser: user } })
                let { insertedCount, insertedId, insertedIds } = Arr_result
                return { insertedCount, insertedId, insertedIds }
            } catch (error) {
                console.error(error)
                this.write_log({ log_collection, msg: { infoType: 'mongoInsert', infoStatu: 'error', infoBody: Object.assign(connect, querys, { error: error }), infoUser: user } })
                return false
            }
        } else {
            throw Error('insert db arg is null')
        }
    }

    /**
     *
     *因为处理不了原子操作符，顾updatSerize只处理 promise update
     * @param {string} [log={ log_collection, msg: {}, user: 'all' }]
     * @returns
     * @memberof mongodb
     */
    async updatSerize(update_result, log = { log_collection, msg: {}, user: 'all' }) {
        let { log_collection, msg, user } = log
        try {
            await update_result
            this.write_log({ log_collection, msg: { infoType: 'mongoUpdate', infoStatu: 'success', infoBody: update_result, infoUser: user } })
            let { result } = await update_result            
            return result
        } catch (error) {
            console.error(error)
            this.write_log({ log_collection, msg: { infoType: 'mongoUpdate', infoStatu: 'error', infoBody: Object.assign(await update_result, { error: error }), infoUser: user } })
            return false
        }
    }


}

module.exports = mongodb;


