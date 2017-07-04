/**
 * Created by fnmxcl on 2017/04/06.
 */
var fetch = require("node-fetch");

var Credit = {
    load: function ( employeeCode,employeePassWord, callback ) {
        fetch('http://192.168.0.251:8008/AccountService/Login?password=000&pointcode=05719999&userName=003')
            .then(function(res) {
                callback.call( this, res );
            });
    }
};
module.exports = Credit;