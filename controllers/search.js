/* Models */
var User = require('../models/users');

module.exports.findUser = async function (req, res, next) {
    var term = req.query.term;
    User.find({
        $or: [{
            fullname: {
                '$regex': '^' + term,
                '$options': 'i'
            }
        }, {
            username: {
                '$regex': '^' + term,
                '$options': 'i'
            }
        }]
    }, function (err, users) {
        users.map(user => {
            user.password = "";
        });
        if (term) {
            res.send(users);
        } else {
            res.send([]);
        }
    });
};