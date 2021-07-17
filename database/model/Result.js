const mongoose = require('mongoose');
const log = require('../../utils/log')
const paginate = require('mongoose-paginate-v2')
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Schema = new mongoose.Schema({
    winner: {
        type:mongoose.Types.ObjectId,
        ref: 'user'
    },
    loser: {
        type:mongoose.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

Schema.statics.getResult = async function(uid) {
    let w = await this.find({winner:uid}).count()
    let l = await this.find({loser:uid}).count()
    return {win:w,lose:l}
}

Schema.statics.getRanking = async function(limit=1000) {
    let ret = await this.aggregate([
        {
            $project: { 
                winner: 1, 
                team: ["$winner","$loser"]
            }
        },
        {
            $unwind: "$team"
        },
        {
            "$group": { 
                _id: "$team", 
                win: {
                    $sum: {
                        $cond: [{
                            $eq: ["$winner","$team"]
                        }, 1, 0]
                    }
                },
                lose: {
                    $sum: {
                        $cond: [{
                            $eq: ["$winner","$team"]
                        }, 0, 1]
                    }
                }
            },
        },
        {
            "$sort": {
                win:-1,
                lose:1
            }
        },
        {
            $lookup: {
              from: 'users', localField: '_id', foreignField: '_id', as: 'userinfo'
            }
        },
        {
            $project: {
                uid: "$userinfo.uid",
                name: "$userinfo.name",
                win: "$win",
                lose: "$lose"
            }
        }
    ]).limit(limit)
    for (var i=0;i<ret.length;i++) {
        ret[i].rank = (i+1)
        ret[i].name = ret[i].name[0]
        ret[i].uid = ret[i].uid[0]
    }
    return ret
}

Schema.plugin(paginate)
Schema.plugin(aggregatePaginate)
module.exports = mongoose.model('result', Schema)