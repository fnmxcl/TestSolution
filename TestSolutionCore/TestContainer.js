var util = require("util");
var fs = require("fs");
var path = require("path");
var events =  require('events');
var TestPlan = require('./TestPlan');
var globalTestTool = require("./../Utility/GlobalTestTool");
var Enumerable = require('linq');
var executionReport = require("./../Common/ExecutionReport");
var testBaseAssemblyPath = "./../TestAssembly/";
var WebSocketClient = require('websocket').client;

function TestContainer(testPlanJson){
    this.TEST_PLAN_INSTANCE = [];
    this.PID = process.pid;
    if(testPlanJson){
        if((typeof(testPlanJson) != "object" && testPlanJson.constructor.name == "Array") ){
            throw "["+process.pid+"]" + "the Param 'testPlanJson' is not a Json Type!";
        }else{
            //以JSON方式构造的测试容器。
            for(let i = 0; i< testPlanJson.length ;i++){
                var planConfig = testPlanJson[i];
                if(planConfig.Enable && planConfig.Enable.toString().toLowerCase() == "false"){
                    continue;
                }
                for(let j = 0; j < planConfig.PlanCases.length ; j++){
                    let testCase = planConfig.PlanCases[j];
                    var tastCaseUrl = path.join(__dirname,"../",testCase.TestScriptName);
                    if(!fs.existsSync(tastCaseUrl)){
                        throw tastCaseUrl + "文件不存在!";
                    }
                    planConfig.PlanCases[j].Instance = require( tastCaseUrl );
                }
                this.TEST_PLAN_INSTANCE.push(planConfig);
            }
            console.log("工作进程号:["+ process.pid +"]" +"初始化测试容器完成!");
        }

        //初始化通讯接口
        var client = new WebSocketClient();
        client.TestContainer = this;
        //TODO:此 连接地址和 端口号需 做成配置。
        client.connect('ws://localhost:29862', 'echo-protocol-201704261902');
        client.on('connect', function(connection) {
            console.log("PID:"+process.pid+" WebSocket Client Connected");
            //设置动态的WebSocketConnection 关联。
            client.TestContainer.WebSocketConnection = connection;
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });
            connection.on('close', function() {
                console.log('echo-protocol Connection Closed');
            });
        });

    }

    // function _OnBeginLaunch(){
    //     //自动维护堆函数引用列表
    //     setInterval(function(){
    //         globalTestTool.IntervalMaintainsHeapFunction();
    //     },globalTestTool.TESTPLAN_MAINTAIN_INTERVAL);
    // }


    TestContainer.prototype.Launch = function(){
        var that = this;
        console.log("工作进程号:["+process.pid+"]" +"测试计划启动...");
        //延迟触发事件。将本对象传递至调用端。
        // setTimeout(function(){
        //     that.emit("BeginLaunch",this);
        // },200);
        // if(planName){
        //     var  testPlan =  this.TEST_PLAN_INSTANCE.filter(function(item){
        //         return item.PlanName ==  planName;
        //     })[0];
        //     //testPlan.PlanDetail;
        // }else{
            console.log("工作进程号:["+process.pid+"]" + "当前总计有:"+this.TEST_PLAN_INSTANCE.length +"个测试计划。" );
            for(let i = 0; i < this.TEST_PLAN_INSTANCE.length ;i++){
                var tempPlanInstance = this.TEST_PLAN_INSTANCE[i];
                tempPlanInstance.Host = that;
                //构造允许初测试计划访问当前上下文对象。
                try{
                    if(tempPlanInstance.InitingScript){
                        var initingScriptUrl = path.join(__dirname,"../",tempPlanInstance.InitingScript);
                        if(!fs.existsSync(initingScriptUrl)){
                            throw initingScriptUrl + "文件不存在!";
                        }
                        //初始化脚本运行。
                        var $ContainerContext = {};
                        $ContainerContext.Host = that;
                        $ContainerContext.CurrentPlanTest = tempPlanInstance;
                        //初始化完成。
                        $ContainerContext.Complated = function(complateAsset){
                            var that = this;
                            //调用所有的测试计划并等待返回测试结果。
                            console.log("工作进程号:["+process.pid+"]" +"当前测试计划:["+ that.CurrentPlanTest.PlanName +"]有启动脚本,正在启动测试计划:"+ tempPlanInstance.PlanName);
                            var testPlan = new TestPlan(that.CurrentPlanTest);
                            //事件在创建函数实例之后立即附加。
                            testPlan.on("PlanStart",function(param){
                                console.log("工作进程号:["+process.pid+"]" + "TestContainer触发事件PlanStart");
                            });
                            testPlan.on("Reported",function(reportResult){
                                var wholeDrution = 0;
                                var TestContainer =  reportResult.TestPlanInstance.Host;
                                var planTestCaseCounter  =  reportResult.PlanReportProcess.TestCaseCounter.filter(v=>v.PlanName == reportResult.TestPlanInstance.PlanName);
                                //保存JSON格式的实体报告文件。
                                var physicalReport = {};
                                physicalReport.PlanName = reportResult.TestPlanInstance.PlanName;
                                physicalReport.Pid = reportResult.TestPlanInstance.Host.PID;
                                physicalReport.InitingScript = reportResult.TestPlanInstance.InitingScript;
                                physicalReport.ImitationThreads = reportResult.TestPlanInstance.ImitationThreads;
                                physicalReport.TestCaseCounter = planTestCaseCounter;
                                physicalReport.TestCaseComplated = reportResult.PlanReportProcess.TestPlanReport;
                                physicalReport.WholeAvgDrution = (Enumerable.from(physicalReport.TestCaseComplated).sum(function(item){
                                    return item.Duration;
                                }) / physicalReport.TestCaseComplated.length).toFixed(2) ;

                                //TODO:此项若未成功则需要做异常处理，目前还未实现。

                                var fileName =  executionReport.SavePhysicalReport(physicalReport);
                                physicalReport.FileName = fileName;
                                TestContainer.WebSocketConnection.send(JSON.stringify(physicalReport));

                                setTimeout(function(){
                                    console.log("工作进程号:["+ process.pid +"]" +"当前测试计划:["+ reportResult.TestPlanInstance.PlanName +"],延迟3秒退出!");
                                },3000);
                                // console.log("工作进程号:["+process.pid+"]" + reportResult.Report);
                                // console.log("工作进程号:["+process.pid+"]" +tempPlanInstance.PlanName+",测试完成!");
                                // ChromeOptions options = new ChromeOptions();
                                // options.addArguments("user-data-dir=C:/Users/user_name/AppData/Local/Google/Chrome/User Data");

                            });
                            testPlan.Start(complateAsset);
                        }
                        $ContainerContext.Failed = function(error){
                            console.error("工作进程号:["+process.pid+"]" +"测试计划:"+ tempPlanInstance.PlanName +"初始化脚本中出现异常:"+ error);
                        }
                        var initRequire = require(initingScriptUrl);
                        // that.call(initRequire,[$ContainerContext]); //TODO: 此处无法使用call
                        initRequire($ContainerContext);
                    }else{
                        //TODO:没有启动项JS的情况下未处理。
                        console.log("工作进程号:["+process.pid+"]" +"当前测试计划:["+ tempPlanInstance.PlanName +"],无启动项,正在启动测试计划:"+ tempPlanInstance.PlanName);
                        tempPlanInstance.Host = that;
                        var testPlan = new TestPlan(tempPlanInstance);
                        //事件在创建函数实例之后立即附加。
                        testPlan.on("PlanStart",function(param){
                            console.log("工作进程号:["+process.pid+"]" +"TestContainer触发事件PlanStart");
                        });
                        testPlan.on("Reported",function(reportResult){
                            console.log("工作进程号:["+process.pid+"]" +reportResult.Report);
                            console.log("工作进程号:["+process.pid+"]" +tempPlanInstance.PlanName+",测试完成!");
                        });
                        testPlan.Start();
                    }
                }catch(excepiton){
                    console.error("工作进程号:["+process.pid+"]" +"测试容器Launch失败:"+excepiton);
                }

            }
        //启动监视维护函数堆.
        setInterval(function(){
            globalTestTool.IntervalMaintainsHeapFunction();
        },globalTestTool.TESTPLAN_MAINTAIN_INTERVAL);
        // }
    }

    TestContainer.prototype.IncreaseTestPlan = function(testPlan){
        if( ( typeof  testPlan ) != "object"   || testPlan.toString() != "[object Object]"){
            throw "the param is not  a TestPlan  Instance";
        }
        this.TEST_PLAN_INSTANCE.push(testPlan);
    }

    TestContainer.prototype.GetTestPlan = function(planName){
        if(planName  && this.TEST_PLAN_INSTANCE.length > 0){
          return   this.TEST_PLAN_INSTANCE.filter(function(item){
                item.PlanName == planName;
            });
        }
    }
    //
    // TestContainer.prototype.on = function(containerStep,callback){
    //     this.emitter.on(containerStep, callback);
    // }
}

util.inherits(TestContainer, events.EventEmitter);
module.exports  =  TestContainer;
//
// function TestCase(identityName,testDescription,testScriptName){
//     this.TEST_IDENTITYNAME = identityName;
//     this.TEST_DESCRIPTION = testDescription;
//     this.TEST_SCRIPT_NAME = testScriptName;
// }
// module.exports.TestCase = TestCase;
//
