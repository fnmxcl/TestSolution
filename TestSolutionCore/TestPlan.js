/**
 * Created by fnmxcl on 2017/04/11.
 */
var util = require("util");
var events =  require('events');
var domain = require("domain");
var colors = require('colors');
var globalTestTool = require("./../Utility/GlobalTestTool");
var executionReport = require("./../Common/ExecutionReport");
var path = require("path");
var Enumerable = require('linq');

function TestPlan(testPlanInstance){
    this.TestPlanInstance = testPlanInstance;
    this.CalcNumber = 0;
}

function TestPlanReportInvoke(complated){
    var that = this;

    console.log(("已完成对工作进程号:["+ complated.Pid +"]测试计划:"+complated.PlanName+"测试用例:"+complated.TestCaseIdentityName+"模拟线程:"+ complated.ImitationThreads +"的测试!").green);
    //executionReport.SavePhysicalReport(complated);
    var PlanTest = that.SenderContext;
    //计算是否Plan计划中的所有测试用例已经完成。
    var mustComplatedTestCases =  Enumerable.from(PlanTest.TestPlanInstance.PlanCases).where("$.Enable != 'false'").toArray().length;
    var complatedTestCases =  Enumerable.from(that.TestCaseCounter).where("$.ComplatedThreads == $.ImitationThreads").toArray().length;
    if(mustComplatedTestCases == complatedTestCases){
        //使用 PlanTest 实例完成。
        PlanTest.emit("Reported",PlanTest);
    }
}

TestPlan.prototype.TimeoutIncorrectTest = function($ExecutionContext){
    var that = $ExecutionContext;
    var executionMs = globalTestTool.CalcTestCaseDuration(that);
    that.Host.PlanReportProcess.PutTestCaseExecutionResult(process.pid, that.Host.TestPlanInstance.PlanName, that.TestCase.IdentityName, that.ThreadID, "incorrect", "TestPlanHeapFunction@Timeout("+globalTestTool.CALL_FUNCTION_TIMEOUT+")", executionMs);
    console.error(("工作进程号:[" + process.pid + "]" + "测试计划:[" + that.Host.TestPlanInstance.PlanName + "]线程号:" + that.ThreadID + "执行时间:(" + executionMs + "ms),测试用例[" + that.TestCase.IdentityName + "]失败,失败原因:TestPlanHeapFunction@Timeout("+globalTestTool.CALL_FUNCTION_TIMEOUT+")").red);
    that.Host.CalcNumber = that.Host.CalcNumber + 1;
    console.log("工作进程号:[" + process.pid + "]" + "全局计数器:" + that.Host.CalcNumber);
}

TestPlan.prototype.IncorrectTest = function(error){
    var that = this;
    //检查函数是否已超时
    var heapFunction =  globalTestTool.MaintainsHeapFunction(that);
    if(heapFunction) {
        var executionMs = globalTestTool.CalcTestCaseDuration(that);
        if (!that.Host || that.Host.constructor.name != "TestPlan") {
            throw "工作进程号:[" + process.pid + "]" + "当前对象的Host不是TestPlan,程序出现验证的异常!";
        }
        //put 结果到TestCase执行结果列表中。
        that.Host.PlanReportProcess.PutTestCaseExecutionResult(process.pid, that.Host.TestPlanInstance.PlanName, that.TestCase.IdentityName, that.ThreadID, "incorrect", error, executionMs);
        console.error(("工作进程号:[" + process.pid + "]" + "测试计划:[" + that.Host.TestPlanInstance.PlanName + "]线程号:" + that.ThreadID + "执行时间:(" + executionMs + "ms),测试用例[" + that.TestCase.IdentityName + "]失败,失败原因:" + error).red);
        that.Host.CalcNumber = that.Host.CalcNumber + 1;
        console.log("工作进程号:[" + process.pid + "]" + "全局计数器:" + that.Host.CalcNumber);
    }
}

TestPlan.prototype.CorrectTest = function(correctinfo){
    var that = this;
    //检查函数是否已超时
    var heapFunction =  globalTestTool.MaintainsHeapFunction(that);
    if(heapFunction){

        var executionMs =  globalTestTool.CalcTestCaseDuration(that);
        //获取Host 相关的HeapFunction
        if(!that.Host ||   that.Host.constructor.name != "TestPlan"){
            throw "工作进程号:["+ process.pid +"]" +"当前对象的Host不是TestPlan,程序出现验证的异常!";
        }
        console.log( ("工作进程号:["+process.pid+"]" +"测试计划:["+ that.Host.TestPlanInstance.PlanName +"]线程号:"+ that.ThreadID +",测试用例[" + that.TestCase.IdentityName +"]成功,执行时间:("+ executionMs + "ms)").green);
        //put 结果到TestCase执行结果列表中。
        that.Host.PlanReportProcess.PutTestCaseExecutionResult(process.pid,that.Host.TestPlanInstance.PlanName, that.TestCase.IdentityName,that.ThreadID,"correct",correctinfo,executionMs);
        that.Host.CalcNumber = that.Host.CalcNumber + 1;
        console.log("工作进程号:["+process.pid+"]" +"计数器:"+ that.Host.CalcNumber);
    }
}

TestPlan.prototype.Start = function($TestContainerContext){
    var that = this;

    that.emit("PlanStart",that);

    //注册回调报告处理的参数
    this.PlanReportProcess =  globalTestTool.RegisterPlanReportProcess(this,TestPlanReportInvoke);

    //region 初始化 测试用例
    for(var i = 0;i < that.TestPlanInstance.PlanCases.length ; i++){

        var testPlanInstance = that.TestPlanInstance.PlanCases[i];
        if(testPlanInstance.Enable &&  testPlanInstance.Enable.toString().toLowerCase() == "false"){
            continue;
        }
        //延迟启动事件触发，让调用端可以将 ON 写在 Start 下方。
        // setTimeout(function(){
        // },500);
        var ImitationThreads = (testPlanInstance.ImitationThreads)|| that.TestPlanInstance.ImitationThreads  || 1;

        //并发多请求模式。
        console.log("工作进程号:["+process.pid+"]" +"测试计划:["+ that.TestPlanInstance.PlanName +"]当前测试用例:["+testPlanInstance.IdentityName+"]并发数为:"+ ImitationThreads +"次!");
        //region 根据配置模拟线程数处理
        for(var j = 0;j <  ImitationThreads;j++ ){
            var $ExecutionContext = {};
            $ExecutionContext.InitedAsset = $TestContainerContext;
            $ExecutionContext.Host = that;
            $ExecutionContext.ThreadID = j;
            $ExecutionContext.TestCase = testPlanInstance;
            $ExecutionContext.incorrect = this.IncorrectTest;
            $ExecutionContext.correct  = this.CorrectTest;
            $ExecutionContext.Duration = { ExecutionBeginDT:new Date().getTime(), ExecutionEndDT:new Date().getTime() };
            var childDomain = domain.create();
            try {
                //函数入堆。
                globalTestTool.MaintainsHeapFunctionIn({FuncitonObject:$ExecutionContext , PushTime:new Date().getTime()});
                //查找入口点.
                var entryPoint = testPlanInstance.EntryPoint;
                if(entryPoint){
                    if(typeof testPlanInstance.Instance[entryPoint] != "function"){
                        console.error("工作进程号:["+process.pid+"]" +"没有可以执行的入口点函数。因入口点EntryPoint:"+entryPoint+"参数设置有问题!");
                        process.exit(0);
                    }
                    childDomain.run(testPlanInstance.Instance[entryPoint], $ExecutionContext);
                }else{
                    if(typeof testPlanInstance.Instance !=  "function"){
                        console.error("工作进程号:["+process.pid+"]" +"没有可以执行的入口点函数。因入口点EntryPoint:"+entryPoint+"参数设置有问题!");
                        process.exit(0);
                    }
                    childDomain.run(testPlanInstance.Instance, $ExecutionContext);
                }
            }
            catch (exception) {
                console.error("工作进程号:["+process.pid+"]" +"线程号:"+ j +"调用测试脚本失败,测试计划名:[" + that.TestPlanInstance.PlanName + "],测试用例:[" + testPlanInstance.IdentityName + "],异常内容:" + exception);
            }
            childDomain.on("error", function (err) {
                console.error("工作进程号:["+process.pid+"]" +"线程号:"+ j +"调用测试脚本失败,测试计划名:[" + that.TestPlanInstance.PlanName + "],测试用例:[" + testPlanInstance.IdentityName + "],异常内容:" + err);
            });
        }
        //endregion

    }
    //endregion

}

util.inherits(TestPlan, events.EventEmitter);
module.exports = TestPlan;

//Error 事件 和 Reported