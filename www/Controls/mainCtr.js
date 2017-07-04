/**
 * Created by fnmxcl on 2017/04/18.
 */
main.controller("MainCtrl",MainCtrl);
MainCtrl.$inject = ['$scope', '$http','$interval','$linq','Upload'];
function MainCtrl($scope, $http,$interval,$linq,Upload) {
    $scope.loading = false;
    $scope.DownReportMark = false;
    $scope.isError = false;
    $scope.ErrorInfo = "";
   // $scope.OnStartTest = StartTestCommand;
    $scope.TestReportsScreen = {};
    // html5 only
    $scope.ws = new WebSocket("ws://localhost:29862");
    $scope.ws .onopen = function (e) {
        console.log('Connection to server opened');
        //sendMessage();
    }
    // function sendMessage() {
    //     //$scope.ws.send('{"Name":"yangliu"}');
    // }
    $scope.ContainsAllProcessReports = [];
    // 处理受到的消息
    $scope.ws.onmessage = function (e) {
        $scope.DownReportMark = true;
        var stocksData = JSON.parse(e.data);
        if(stocksData){
            $scope.ContainsAllProcessReports.push(stocksData);
            //应用模型所有的变化。
             $scope.$apply();
        }
    };

    $scope.uploadFiles = function(file, errFiles) {
        $scope.isError = false;
        $scope.ErrorInfo = "";

        $scope.file = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            $scope.DownReportMark = false;
            $scope.loading = true;
            //$scope.$apply();
            var reader = new FileReader();
                reader.readAsText(file);//读取文件的内容
            reader.onload = function(){
                var jsonReport = null;
                try{
                    jsonReport = JSON.parse(this.result);
                }catch(exception){
                    $scope.isError = true;
                    $scope.ErrorInfo = exception;
                    return;
                }

                jsonReport.FileName = file.name;
                //console.log(this.result);//当读取完成之后会回调这个函数，然后此时文件的内容存储到了result中。直接操作即可。
                $scope.ContainsAllProcessReports = [];
                $scope.ContainsAllProcessReports.push(jsonReport);
                $scope.$apply();
                $scope.loading = false;
            };

            reader.onerror = function(){
                $scope.isError = true;
                $scope.ErrorInfo = "未知错误";
                $scope.loading = false;
            }

            reader.onabort = function () {
                $scope.loading = false;
            }

            // Upload.upload({
            //     url: 'Upload',
            //     data: {file: file}
            // })
            // //     .progress(function (evt) {
            // //     var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            // //     console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
            // // })
            //     .success(function (data, status, headers, config) {
            //         if(status == 200){
            //             $scope.ContainsAllProcessReports = [];
            //             $scope.ContainsAllProcessReports.push(data);
            //         }
            //     //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            // }).error(function (data, status, headers, config) {
            //     console.log('error status: ' + status);
            // });
        }
    }


    // function StartTestCommand(){
    //     $scope.ws.send('{"Command":"StartTest"}');
    // }
    // $scope.$watch('ContainsAllProcessReports',function(newValue,oldValue){
    //
    // });
    //
    // $http.get('20170425173629_PID_11932_PN_潜在客户压力测试计划.json').then(function successCallback(response) {
    //     var data = response.data;
    //     console.log(data);
    //     //20170421142426_PID_22884_PN_潜在客户压力测试计划 - Copy.json
    //     $scope.ContainsAllProcessReports.push(data);
    //     // $http.get('20170425163527_PID_11756_PN_潜在客户压力测试计划.json').then(function successCallback(response) {
    //     //     var data2 = response.data;
    //     //     $scope.ContainsAllProcessReports.push(data2);
    //     //     // $scope.$apply();
    //     // });
    //     //应用模型所有的变化。
    //     // $scope.$apply();
    //     // 请求成功执行代码
    // }, function errorCallback(response) {
    //     // 请求失败执行代码
    // });
    //
    //
    // $scope.$watch('ContainsAllProcessReports',function(a){
    //     if(a && a.length > 0){
    //         // $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    //         // $scope.series = ['Series A', 'Series B'];
    //         // $scope.data = [
    //         //     [65, 59, 80, 81, 56, 55, 40],
    //         //     [28, 48, 40, 19, 86, 27, 90]
    //         // ];
    //         //$scope.$apply();
    //     }
    // },true)


    //
    // $scope.onClick = function (points, evt) {
    //     console.log(points, evt);
    // };
}