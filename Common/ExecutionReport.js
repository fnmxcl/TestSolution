/**
 * Created by fnmxcl on 2017/04/05.
 */
var fs = require("fs");
var path = require("path");
var moment = require("moment");
module.exports.EXECUTIONTESTREPORT = [];

function SavePhysicalReport(complated){
    try{
        var pathName = path.join(__dirname,"./../TestReports/");
        if(!fs.existsSync(pathName)){
            fs.mkdirSync(pathName);
        }
        var filenameCalc = (moment(new Date).format("YYYYMMDDHHmmss"))+"_PID_"+complated.Pid +"_PN_"+complated.PlanName +".json";
        var fileName =  pathName + filenameCalc;
        fs.writeFileSync(fileName, JSON.stringify(complated));
        console.log(("已写入报告!" + fileName).green);
        return filenameCalc;
    }catch(exception){
        console.log("ExecutionReport中出现错误:"+exception);
    }
}
module.exports.SavePhysicalReport = SavePhysicalReport;