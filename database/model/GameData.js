const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2')
var aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const Schema = new mongoose.Schema({
  uid: String,
  name: String,
  phone: String,
  type: String,
})

Schema.statics.count = function(rname) {
  // console.log('check '+rname)
  return this.find({rname:rname}).countDocuments()
}

Schema.statics.groupping = function() {
  return this.aggregate(
    [
        { 
            "$match" : {
                "uid" : {
                    "$exists" : true
                }, 
                "name" : {
                    "$exists" : true
                }, 
                "phone" : {
                    "$exists" : true
                }
            }
        }, 
        { 
            "$group" : {
                "_id" : {
                    "uid" : "$uid", 
                    "name" : "$name", 
                    "phone" : "$phone", 
                    "addr" : "$address"
                }, 
                "data" : {
                    "$push" : {
                      "type" : "$type", 
                      "code" : "$rcode", 
                        "gift" : "$rname", 
                        "date" : "$date"
                    }
                }, 
                "count" : {
                    "$sum" : 1.0
                }
            }
        }, 
        { 
            "$sort" : {
                "count" : -1.0, 
                "data.date" : 1.0
            }
        }
    ], 
    { 
        "allowDiskUse" : false
    }
);

}
Schema.plugin(paginate)
module.exports = mongoose.model('gamedata', Schema)
