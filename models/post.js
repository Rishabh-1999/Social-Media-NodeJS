var mongoose = require('mongoose');
var Schema  = mongoose.Schema;

var postSchema = new Schema({
	body  : {type:String,trim:true},
	image : {type:String,trim:true},
	likes : Array,
	comments : [{
				 user : Object,
				 fullname : String,
				 username : String,
				 comment : String
			   }],
	date   : {type:Date,default:Date.now()},
	owner  : Object
});

var Post = mongoose.model('posts',postSchema);
module.exports = Post;