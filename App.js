/**
 * Created by fnmxcl on 2017/04/10.
 */
var chai = require('chai');
// var should = require( 'should' );
var expect = chai.expect;
var fs = require("fs");
var path = require("path");
var TestContainer = require("./TestSolutionCore/TestContainer");
var colors = require('colors');
var domain = require('domain');
var cluster = require('cluster');
var os = require('os');
var express = require('express');
var WebSocketServer = require('ws').Server;
var sw = require('selenium-webdriver');
var async = require("async");
require("colors");
var globalTestTool = require("./Utility/GlobalTestTool");
var multer = require('multer');
var upload = multer({ dest: 'TestUpload/'});
var type = upload.single('file');
var Enumerable = require('linq');

process.on('uncaughtException', function (err) {
    console.log(err);
});


function main(){
    //读取测试计划
    var testPlanStr =  globalTestTool.ReadFileAndRemoveBomInFilePath(path.join("./Config/TestPlan.json"));
    var jsonTestPlan =  JSON.parse(testPlanStr.toString("utf-8"));

    if(checkingJsonValid(jsonTestPlan)){
        var clusterNumber = null;
        if(jsonTestPlan.UsedWorkerNumber && jsonTestPlan.UsedWorkerNumber > 0){
            clusterNumber = jsonTestPlan.UsedWorkerNumber;
        }
        var cupNums =  os.cpus().length;
        if(!clusterNumber||clusterNumber>cupNums){
            clusterNumber = Math.floor(cupNums/2)||1;
        }
        if (cluster.isMaster) {
            console.log(("CPU核心数:"+ cupNums + "个,当前运行进程数:"+ clusterNumber +"(若设置的进程大于CPU核心数自动降为一半核心数)").yellow);
            //TODO:需加入是否自动弹出测试报告页面。
            if(!process.argv.filter(f=>f=="--console")[0]) {
                //TODO: 此页面能打开和 Chromedriver 有关系。 网址放置于 Chromedriver 中。
                var driver = new sw.Builder()
                    .withCapabilities(sw.Capabilities.chrome())
                    .build();
                driver.get("http://localhost:29861/TestOnceReport.html");
            }

            StartWebServices(function(error){
                if(!error){
                    var delay = 0;
                    if(process.argv.filter(f=>f=="--debug")[0]){
                        delay = 5000;
                    }
                    if(!process.argv.filter(f=>f=="--notest")[0]){
                        console.log("当前为调试模式、延迟"+delay+"ms执行TestContainer");
                        setTimeout(function(){
                            for (let i = 0; i < clusterNumber; i++) {
                                cluster.fork();
                            }
                            cluster.on('exit', (worker, code, signal) => {
                                console.log("工作进程号:["+process.pid+"]" +"工作进程退出!");
                            });
                        },delay)
                    }else{
                        console.log("http://localhost:29861/TestOnceReport.html");
                    }
                }
            });
            //console.log("工作进程号:["+process.pid+"]" + "主进程正在运行");
            // Fork workers.

        } else {
            try{
                // StartWebServices(function(error){
                //     if(!error){
                //设置函数调用超时时间。
                globalTestTool.CALL_FUNCTION_TIMEOUT = jsonTestPlan.CallFunctionTimeOut;
                var testContainer = new TestContainer(jsonTestPlan.TestPlan);
                testContainer.Launch();
                // }
                // });
            }catch(exception){
                console.log(exception);
            }
        }
    }else{
        console.log("验证外部JSON失败,已停止服务!");
        process.exit();
    }
}

function StartWebServices(callback){
    async.series([function StartWebSite(callback){
        //首先清理缓存
        var fileUrl = path.join(__dirname,"./TestUpload");
        var files = fs.readdirSync(fileUrl);//读取该文件夹
        files.forEach(function(file){
            var stats = fs.statSync(fileUrl+'/'+file);
            if(!stats.isDirectory()){
                fs.unlinkSync(fileUrl+'/'+file);
            }
        });
        var WebSiteService = express();
        WebSiteService.use(express.static(path.join(__dirname, 'bower_components')));
        WebSiteService.use('/lib', express.static('bower_components'));
        WebSiteService.use('/Assets', express.static('TestReports'));
        WebSiteService.use(express.static(__dirname + '/www'));
        WebSiteService.use(express.static(__dirname + '/TestReports'));
        WebSiteService.use(express.static(__dirname + '/TestUpload'));
        // WebSiteService.post('/Upload', type, function (req,res) {
        //     //var originalname
        //     var fileData =  fs.readFileSync(req.file.path);
        //     if(fileData){
        //         var jsonFileData = JSON.parse(fileData.toString());
        //         jsonFileData.FileName= req.file.filename;
        //         res.send(jsonFileData);
        //     }else{
        //         res.send({Error:"读取数据失败"});
        //     }
        // });
        WebSiteService.listen(29861, function () {
            console.log(("工作进程号:[" + process.pid + "]" + "Express server listening in port 29861!").green);
            callback(null, "StartWebSite");
        });
        WebSiteService.use(function (err, req, res, next) {
            console.error(err.stack);
            res.status(500).send('异常错误! 500 CODE Error:' + err);
            console.log('异常错误!  E2:' + err);
        });
    },function StartCommandSocket(callback){
        var  wss = new WebSocketServer({ port: 29862 });//此端口需要配置
        wss.on('connection', function (ws) {
            globalTestTool.WEB_CONNECTION.push(ws);
            console.log(("工作进程号:["+process.pid+"]" +"client connected!"));
            ws.on('message', function (message) {
               // var receiver =  globalTestTool.WEB_CONNECTION;
                // if(message){
                //     try{
                //         var commandObject = JSON.parse(message);
                //         if(commandObject.Command == "StartTest"){
                //             testBoot();
                //         }
                //     }catch(exception){
                //         console.log('WebSocketServer is Error:'+ exception);
                //     }
                // }
                globalTestTool.WEB_CONNECTION.forEach(function(item){
                    try{
                        if(item.protocol == "echo-protocol-201704261902"){
                            return;
                        }
                        item.send(message);
                    }catch (exception){
                        console.log(exception);
                    }
                });
                //console.log(message);
            });
        });
        callback(null,"StartCommandSocket");
        console.log(("工作进程号:["+process.pid+"]" +"WebSocketServer listening in port 29862!").green);
    }] ,function(err){
        if(err){
            console.error('application context inited error:'+err.toString());
        }else{
            callback(err);
        }
    });
}
main();

function checkingJsonValid(jsonTestPlan){
    try
    {
        if( jsonTestPlan.TestPlan ){
            var calc =   Enumerable.from(jsonTestPlan.TestPlan)
                .groupBy("$.PlanName","$.PlanName",
                    function (key,group) {
                        return {Key:key ,Count:group.count()}
                    }).toArray().filter(v=>v.Count > 1);
            if(calc && calc.length > 0 ){
                var promptStr = "";
                console.log(("出现重复的测试计划 :"+ calc.toJoinedString(";")).red);
                return false;
            }
        }else {
            console.log("没有TestPlan节点!");
            return false;
        }
        return true;
    }catch (exception){
        console.log("检查JSON测试配置时出现错误:"+exception);
        return false;
    }

}
