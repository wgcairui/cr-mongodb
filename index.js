/*
 * @Description: In User Settings Edit
 * @Author: cairui
 * @Date: 2019-08-11 00:03:40
 * @LastEditTime: 2019-08-11 20:10:26
 * @LastEditors: Please set LastEditors
 */
/* jshint esversion:8 */
const MongoClient = require('mongodb').MongoClient;


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
    async write_log({ collection, msg: { infoType, infoStatu, infoBody, infoUser } }) {
        if (await this.log && collection) {
            try {
                (await this.log).collection(collection).insertOne(Object.assign(msg,{generateTime:this.Dates().cn},{DateTime:new Date()}))
            } catch (error) {

            }
        }
    }

    static Dates() {
        let d = new Date()
        let en = new Date(...[d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()])
        let cn = new Date(...[d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours() + 8, d.getMinutes(), d.getSeconds(), d.getMilliseconds()])
        return {cn,en}
    }

    /**
     *
     *
     * @param {*} [connect={ db, collection, }] 连接对象
     * @param {*} [querys={ query: {}, result: {}, multi }] 查询对象
     * @param {string} [log={ log_collection, msg: {}, user: 'all' }] 日志对象
     * @returns
     * @memberof mongodb
     */
    async find(connect = { db, collection, }, querys = { query: {}, result: {}, multi }, log = { log_collection, msg: {}, user: 'all' }) {
        if (connect) {
            let { db, collection, } = connect;
            let { query, result, multi } = querys
            try {
                let Arr_result = (await this.Conection).db(db).collection(collection).find(query).project(Object.assign({ _id: 0 }, result)).toArray()
                this.write_log({log_collection,msg:{infoType:'mongoFind',infoStatu:'success',infoBody:Object.assign(connect,querys),infoUser:user}})
                return multi ? Arr_result : Arr_result[0]
            } catch (error) {
                console.error(error)
                this.write_log({log_collection,msg:{infoType:'mongoFind',infoStatu:'error',infoBody:Object.assign(connect,querys,{error:error}),infoUser:user}})
                return false
            }
        } else {
            throw Error('find db arg is null')
        }
    }


}

module.exports = mongodb;


