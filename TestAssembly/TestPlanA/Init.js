/**
 * Created by fnmxcl on 2017/04/12.
 */
var fetch = require('fetch-cookie/node-fetch')(require('node-fetch'));
var async = require("async");
var testBaseUrl = require('./../../Utility/TestBaseUrl');

module.exports = function($ContainerContext){
    //将此Fetch作为全局fetch以便于其他测试用例使用。
    //async.series()
    var GlobalFetch = fetch;
    //模拟该用户登录
    GlobalFetch(testBaseUrl.Visit251Url.LoginUrl,{ credentials:'include' })
        .then(function(res) {
            return res.json();
        }).then(function(json) {
        //若此函数中带参数则可以给TestAssmbly中的测试用例使用。
        $ContainerContext.Complated(GlobalFetch);
    },function(error){
        $ContainerContext.Failed(error);
    });
    //$containerctx.Failed("手动失败!");
    // setInterval(function(){
    //     $containerctx.Complated("返回的资源");
    // },5000);
}
