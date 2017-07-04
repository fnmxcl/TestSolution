/**
 * Created by fnmxcl on 2017/04/13.
 */
var Enumerable = require('linq');
var fs = require("fs");
module.exports.CALL_FUNCTION_TIMEOUT = -1;
module.exports.TESTPLAN_MAINTAIN_INTERVAL = 150;
module.exports.HEAP_FUNCTION_QUEUE = [];
module.exports.WEB_CONNECTION = [];



Array.prototype.toJoinedString = function(attachMark){
    var that = this;
    var attachStr = "";
    for(var i = 0 ; i < that.length; i ++){
        for(var item in that[i]){
            attachStr += item + ":" + that[i][item]+ ",";
        }
        attachStr = attachStr.substr(0,attachStr.length - 1);
        attachStr += ";";
    }
    return attachStr;
}

module.exports.MaintainsHeapFunctionIn = function(item){
    var that = this;
    that.HEAP_FUNCTION_QUEUE.push(item);
}
//若传入ITEM则直接出堆之后移除。
module.exports.MaintainsHeapFunction =  function(item){
    var that = this;
    var retCurrentCallFunction = null;
    try{
        while(true){
            var success = false;
            for(var index = 0;index <  that.HEAP_FUNCTION_QUEUE.length;index ++ ){
                var currentHeapFunction = that.HEAP_FUNCTION_QUEUE[index];
                //若为0则默认超时时间为1个小时。
                //var callFunctionTimeout = globalTestConfig.CallFunctionTimeout>0?globalTestConfig.CallFunctionTimeout:216000;
                if (currentHeapFunction.FuncitonObject.ThreadID == item.ThreadID && currentHeapFunction.FuncitonObject.TestCase.IdentityName == item.TestCase.IdentityName
                    && currentHeapFunction.FuncitonObject.Host.TestPlanInstance.PlanName == item.Host.TestPlanInstance.PlanName){
                    retCurrentCallFunction = currentHeapFunction;
                    that.HEAP_FUNCTION_QUEUE.splice(index,1);
                    success = true;
                    break;
                }
            }
            if(!success){
                break;
            }
            console.log("当前还有"+that.HEAP_FUNCTION_QUEUE.length+"个函数在内存中");
        }
    }catch(exception){
        console.log("MaintainsHeapFunction Error:"+ exception)
    }
    return retCurrentCallFunction;
};

module.exports.IntervalMaintainsHeapFunction = function(){
    var that = this;
    var retCurrentCallFunction = null;
    try{
        while(true){
            var success = false;
            for(var index = 0;index <  that.HEAP_FUNCTION_QUEUE.length;index ++ ){
                var currentHeapFunction = that.HEAP_FUNCTION_QUEUE[index];
                //若为0则默认超时时间为1个小时。
                var callFunctionTimeout = that.CALL_FUNCTION_TIMEOUT>0?that.CALL_FUNCTION_TIMEOUT:216000;
                if (new Date().getTime() - currentHeapFunction.PushTime > callFunctionTimeout ){
                    var item =  that.HEAP_FUNCTION_QUEUE.splice(index,1);
                   item[0].FuncitonObject.Host.TimeoutIncorrectTest(item[0].FuncitonObject);
                    success = true;
                    break;
                }
            }
            if(!success){
                break;
            }
        }
    }catch(exception){
        console.log("IntervalMaintainsHeapFunction Error:"+exception);
        process.exit();
    }
}

//去除BOM头
module.exports.ReadFileAndRemoveBomInFilePath =  function RemoveBomInDirectory(file) {
    var filePath = file;
    var stats = fs.statSync(filePath);
    var buff = fs.readFileSync(filePath);
    if (buff[0].toString(16).toLowerCase() == "ef" && buff[1].toString(16).toLowerCase() == "bb" && buff[2].toString(16).toLowerCase() == "bf") {
        //EF BB BF 239 187 191
        console.log('\发现BOM文件：', filePath, "\n");
        buff = buff.slice(3);
        fs.writeFileSync(filePath, buff.toString(), "utf8");
    }
    return fs.readFileSync(filePath);
}

module.exports.CalcTestCaseDuration =  function CalcTestCaseDuration(that){
    that.Duration.ExecutionEndDT = new Date().getTime();
    return that.Duration.ExecutionEndDT - that.Duration.ExecutionBeginDT;
}

module.exports.RegisterPlanReportProcess = function(senderContext, callback){
    function PlanReportProcess(){
        this.ProcessComplated = callback;
        if(this.ProcessComplated){
            if(typeof this.ProcessComplated !="function"){
                throw "Current callback is not Function!";
            }else if(this.ProcessComplated.length == 0){
                throw "Please set a Param at Function !";
            }
        }else{
            throw "Please set callback Param at function'RegisterPlanReportProcess'!";
        }
        this.Init();
    }

    PlanReportProcess.prototype.Init = function(){
        var that = this;
        that.TestPlanReport = [];
        that.SenderContext = senderContext;
        that.TestCaseCounter = [];
        this.SenderContext.TestPlanInstance.Host.TEST_PLAN_INSTANCE.forEach(function(testPlanItem){
            testPlanItem.PlanCases.forEach(function(planCasesItem){
                var ImitationThreads = (planCasesItem.ImitationThreads || testPlanItem.ImitationThreads  ) || 1;
                if(!planCasesItem.Enable || planCasesItem.Enable.toString().toLowerCase() != "false"){
                    that.TestCaseCounter.push(
                        {
                            Pid: that.SenderContext.TestPlanInstance.Host.PID,
                            PlanName : testPlanItem.PlanName,
                            TestCaseIdentityName:planCasesItem.IdentityName,
                            TestResultEntity:[],
                            Avg:0,
                            ImitationThreads:ImitationThreads,
                            ComplatedThreads:0
                        }
                    );
                }
            })
        });
    }

    PlanReportProcess.prototype.PutTestCaseExecutionResult = function(pid, planName,testCaseName,tastCaseThreadID, resultType,result,duration){
        var that = this;
        var jreulst = null;
        if(typeof  result == "object"){
            jreulst = JSON.stringify(result);
        }else{
            jreulst = result;
        }

        var entity = {
            PID:pid,
            PlanName:planName,
            TestCaseName:testCaseName,
            TestCaseThreadID:tastCaseThreadID,
            ResultType:resultType,
            Result:jreulst,
            Duration:duration
        }

        if(!pid){
            throw "pid is null ";
        }else if (!planName ){
            throw "planName is null ";
        }else if (!testCaseName ){
            throw "testCaseName is null ";
        }else if(resultType != "incorrect" && resultType != "correct"){
            throw "resultType must input a symbol 'incorrect' or 'correct'";
        }else if (!duration ){
            throw "duration is null ";
        }
        //保存执行结果。
        that.TestPlanReport.push(entity);
        that.TestCaseCounter.forEach(function(item){
            if(item.Pid == entity.PID &&
                item.PlanName == entity.PlanName &&
                item.TestCaseIdentityName == entity.TestCaseName){
                item.ComplatedThreads = item.ComplatedThreads + 1;
                item.TestResultEntity.push(entity);
                //完成线程数和模拟线程数一样则说明所有的已经完成。
                if(item.ImitationThreads == item.ComplatedThreads){
                 //计算平均值。
                  var calc =   Enumerable.from(item.TestResultEntity)
                        .groupBy("$.TestCaseName",'$.Duration',
                            function (key, group) {
                            return { TestCaseName: key, Duration: group.sum()}
                        }).toArray();
                    item.Avg = calc[0].Duration / item.TestResultEntity.length;
                    that.ProcessComplated(item);
                }
            }
        });
    }

    return new PlanReportProcess();

}