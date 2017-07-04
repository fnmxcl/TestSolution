// http://192.168.0.251:8008/MobileApp.html#/shell/200100103 页面的压力测试

var chai = require('chai');
var expect = chai.expect;
var q = require("q");
var request = require("request");

//var fetch = require('fetch-cookie/node-fetch')(require('node-fetch'));
var executionReport = require('./../../Common/ExecutionReport');
var testBaseUrl = require('./../../Utility/TestBaseUrl');

//TODO: 目前存在未返回的问题，比如 2000个请求只返回 1800多个。 需要解决此问题。
module.exports.shell_200100103_DataQuery1 = function ($context){
    //获取全局Fetch执行网络请求。
    var fetch = $context.InitedAsset;
    var JsonParam = JSON.stringify({"TabularType":"ApplicationData.T_CM_SubscribeInfo","Properties":["CarType1","CarType2","CarType3","CHName","Province","City","Area","DataSource","Remark","ApplyTime","CarBrand","CarSerial","CarModel","WebSource","Status","BusinessMan","TraceResult","ClueTraceSerialNo","LinkTel","T_CM_ClueTraceInfoSeriaNo.NextTraceDate","T_CM_ClueTraceInfoSeriaNo.TraceContent","T_Province.CityName","T_Province.CityID","T_City.CityName","T_City.CityID","T_Area.CityName","T_Area.CityID","ExComeDT"],"Filter":"'刘小佳'.Contains(BusinessMan)&&PointCode=='05719999' && (TraceResult!='失控'||TraceResult==null)null","PageSize":10,"StartIndex":0,"SortDescriptions":[{"PropertyName":"ApplyTime","Direction":"Descending"}]});

    try{
        fetch(testBaseUrl.Visit251Url.DataQueryUrl,{
            method: "POST",
            credentials:'include',
            mode: "no-cors",
            dataType: 'JSONP',
            body:JsonParam,
            headers: {
                "X-Requested-With": 'XMLHttpRequest',
                "Content-Type":"application/json",
                method: "POST"
            }}).then(function(res){


            if(res.status != 200){
                $context.incorrect("返回值不为200");
            }else{

                if(!res.ok){
                    $context.incorrect(res.json());
                }

                var result = res.json();

                result.then(function(result){
                    if(typeof result != "object"){
                        $context.incorrect("当前返回的不是object类型!");
                        return ;
                    }
                    if(result.Status && result.Status == "Error" ){
                        if(result.ErrorMessage){
                            $context.incorrect(result.ErrorMessage);

                        }else{
                            $context.incorrect("当前为错误状态但ErrorMessage为空!");
                        }
                        return;
                    }else{
                        //成功之后只返回第一行的结果。因全部返回 报告日志会非常大。
                        $context.correct({TestFirstRowValue:result.Items[0]});
                    }
                },function(error){
                    $context.incorrect(error);
                }).catch(function(exception){
                    $context.incorrect(exception);
                });
                //通知TestPlan 已完成。
                //throw  "手动失败";
            }
        }).catch(function(error){
            $context.incorrect(error);
        });
    }catch(excepiton){
        $context.incorrect(excepiton);
    }



};

module.exports.shell_200100103_LinqQuery1 = function ($context){
    //获取全局Fetch执行网络请求。
    var fetch = $context.InitedAsset;
    var JsonParam = JSON.stringify({"linq":"ApplicationData.T_EmployeeInfoSet.Where(a=>a.PointCode=='05719999').Select(m=>new{Manager=m.Manager,EmployeeID=m.EmployeeID,EmployeeCHName=m.EmployeeCHName})"});
    try{
        fetch(testBaseUrl.Visit251Url.LinqQueryUrl,{
            method: "POST",
            credentials:'include',
            mode: "no-cors",
            dataType: 'JSONP',
            body:JsonParam,
            headers: {
                "X-Requested-With": 'XMLHttpRequest',
                "Content-Type":"application/json",
                method: "POST"
            }}).then(function(res){
            if(res.status != 200){
                $context.incorrect("返回值不为200");
            }else{
                var result = res.json();
                result.then(function(result){
                    if(result.Status == "OK"){
                        //成功之后只返回第一行的结果。因全部返回 报告日志会非常大。
                        $context.correct({TestFirstRowValue:result.Value[0]});
                    }else if(result.Status == "Error"){
                        $context.incorrect(result.ErrorMessage);
                    }
                },function(error){
                    $context.incorrect(error);

                }).catch(function(exception){
                    $context.incorrect(exception);
                });
                //通知TestPlan 已完成。
                //throw  "手动失败";
            }

        }).catch(function(error){
            $context.incorrect(error);
        });}catch(excepiton){
        $context.incorrect(excepiton);
    }
};

// it('网络请求测试用例', function (done) {
//     // var queryParams = {
//     //     client: clientId,
//     //     bizTemplate: bizTemplate,
//     // };
//     // if (parameters) {
//     //     queryParams.parameters = JSON.stringify(parameters);
//     // }
//     var options = {
//         url: 'http://192.168.0.251:8008/AccountService/Login?password=000&pointcode=05719999&userName=005',
//         method: "GET",
//         headers: {
//             "X-Requested-With": 'XMLHttpRequest'
//         }
//     };
//     request(options, function (error, response, body) {
//         //将远程Cookies设置到返回信息中
//         if (error) {
//             //deferred.reject(error);
//             done(error);
//         }
//         else {
//             try {
//                 expect(response).to.be.a("object");
//                 //var result = JSON.parse(response.body);
//                  if(response.status = 200){
//                      done();
//                  }else
//                  {
//                      done("返回值不为200");
//                  }
//                 //expect(response).to.be.a("IncomingMessage");
//                 //deferred.resolve(result);
//             }
//             catch (e) {
//                 // if(body){
//                 //     done(e);
//                 //     //deferred.reject('分析执行结果失败,失败原因:'+ body);
//                 // }
//                 // else{
//                 //     //deferred.reject('分析执行结果失败,失败原因:'+ e);
//                 // }
//                 done(e);
//             }
//
//         }
//     });
//     // driver.findElement(By.css('#lst-ib')).sendKeys('mocha');
//     // driver.findElement(By.css('[name="btnK"]')).click();
//     // driver.sleep(3000);
//     // driver.getTitle().then(function (title) {
//     //     title.should.contain('mocha');
//     //     done();
//     // });
// });
// });
//
//
// describe("登录系统WebKit测试",function(done){
//     it("用例1",function(done){
//         var sw = require('selenium-webdriver');
//         var driver = new sw.Builder()
//             .withCapabilities(sw.Capabilities.chrome())
//             .build()
//
// // And then...
//         var chai = require('chai');
//         var chaiWebdriver = require('chai-webdriver');
//         chai.use(chaiWebdriver(driver));
//
// // And you're good to go!
//         driver.get('http://github.com');
//         chai.expect('#site-container h1.heading').dom.to.not.contain.text("I'm a kitty!");
//     });
// });
//




module.exports.shell_200100103_DataQuery1_CheckDataValid = function ($context){
    //获取全局Fetch执行网络请求。
    var fetch = $context.InitedAsset;
    var JsonParam = JSON.stringify({"TabularType":"ApplicationData.T_CM_SubscribeInfo","Properties":["CarType1","CarType2","CarType3","CHName","Province","City","Area","DataSource","Remark","ApplyTime","CarBrand","CarSerial","CarModel","WebSource","Status","BusinessMan","TraceResult","ClueTraceSerialNo","LinkTel","T_CM_ClueTraceInfoSeriaNo.NextTraceDate","T_CM_ClueTraceInfoSeriaNo.TraceContent","T_Province.CityName","T_Province.CityID","T_City.CityName","T_City.CityID","T_Area.CityName","T_Area.CityID","ExComeDT"],"Filter":"'刘小佳'.Contains(BusinessMan)&&PointCode=='05719999' && (TraceResult!='失控'||TraceResult==null)null","PageSize":10,"StartIndex":0,"SortDescriptions":[{"PropertyName":"ApplyTime","Direction":"Descending"}]});
    try{
        fetch(testBaseUrl.Visit251Url.DataQueryUrl,{
            method: "POST",
            credentials:'include',
            mode: "no-cors",
            dataType: 'JSONP',
            body:JsonParam,
            headers: {
                "X-Requested-With": 'XMLHttpRequest',
                "Content-Type":"application/json",
                method: "POST"
            }}).then(function(res){


            if(res.status != 200){
                $context.incorrect("返回值不为200");
            }else{

                if(!res.ok){
                    $context.incorrect(res.json());
                }

                var result = res.json();

                result.then(function(result){
                    if(typeof result != "object"){
                        $context.incorrect("当前返回的不是object类型!");
                        return ;
                    }
                    if(result.Status && result.Status == "Error" ){
                        if(result.ErrorMessage){
                            $context.incorrect(result.ErrorMessage);

                        }else{
                            $context.incorrect("当前为错误状态但ErrorMessage为空!");
                        }
                        return;
                    }else{
                        if(result.TotalItemCount != 124){
                            $context.incorrect("返回的数据集长度不为124!");
                            return;
                        }
                        if(result.Items[0].CHName != "杨柳"){
                            $context.incorrect("返回的数据集中第一个客户不为杨柳!");
                            return;
                        }
                        if(result.Items[1].CHName != "吴京"){
                            $context.incorrect("返回的数据集中第二个客户不为吴京!");
                            return;
                        }
                        $context.correct( "验证数据成功:条目数:"+ result.TotalItemCount );
                    }
                },function(error){
                    $context.incorrect(error);
                }).catch(function(exception){
                    $context.incorrect(exception);
                });
                //通知TestPlan 已完成。
                //throw  "手动失败";
            }
        }).catch(function(error){
            $context.incorrect(error);
        });
    }catch(excepiton){
        $context.incorrect(excepiton);
    }
}




module.exports.shell_200100103_LinqQuery1_CheckDataValid = function ($context){
    //获取全局Fetch执行网络请求。
    var fetch = $context.InitedAsset;
    var JsonParam = JSON.stringify({"linq":"ApplicationData.T_EmployeeInfoSet.Where(a=>a.PointCode=='05719999').Select(m=>new{Manager=m.Manager,EmployeeID=m.EmployeeID,EmployeeCHName=m.EmployeeCHName})"});
    try{
        fetch(testBaseUrl.Visit251Url.LinqQueryUrl,{
            method: "POST",
            credentials:'include',
            mode: "no-cors",
            dataType: 'JSONP',
            body: JsonParam,
            headers: {
                "X-Requested-With": 'XMLHttpRequest',
                "Content-Type":"application/json",
                method: "POST"
            }}).then(function(res){
            if(res.status != 200){
                $context.incorrect("返回值不为200");
            }else{
                var result = res.json();
                result.then(function(result){
                    if(result.Status == "OK"){
                        if(result.Value.length != 9){
                            $context.incorrect("返回的行数不为9");
                            return;
                        }
                        if(result.Value[0].EmployeeCHName != "123"){
                            $context.incorrect("返回的第一行数据的EmployeeCHName不为123");
                            return;
                        }
                        $context.correct("数据检查没有问题:数据行数"+result.Value.length);
                    }else if(result.Status == "Error"){
                        $context.incorrect(result.ErrorMessage);
                    }
                },function(error){
                    $context.incorrect(error);

                }).catch(function(exception){
                    $context.incorrect(exception);
                });
                //通知TestPlan 已完成。
                //throw  "手动失败";
            }

        }).catch(function(error){
            $context.incorrect(error);
        });}catch(excepiton){
        $context.incorrect(excepiton);
    }
};