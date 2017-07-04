/**
 * Created by fnmxcl on 2017/04/18.
 */
main.controller("MainCtrl",MainCtrl);
MainCtrl.$inject = ['$scope', '$http','$interval','$linq'];
function MainCtrl($scope, $http,$interval) {
    $scope.OnStartTest = StartTestCommand;

    $scope.TestReportsScreen = {};
    // html5 only
    $scope.ws = new WebSocket("ws://localhost:3000");
    $scope.ws .onopen = function (e) {
        console.log('Connection to server opened');
        //sendMessage();
    }
    // function sendMessage() {
    //     //$scope.ws.send('{"Name":"yangliu"}');
    // }
    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    // $interval(function(){
    //     $scope.series = ['Series A', 'Series B','Series C'];
    //
    //     $scope.data =[
    //         [1, 1, 3, 3, 3, 7, 6],
    //         [3, 4, 4, 7, 7, 4, 5],
    //         [6, 9, 9, 4, 0, 3, 1]
    //     ];
    //         // $scope.data.map(function (data) {
    //         // return data.map(function (y) {
    //         //     y = y + Math.random() * 10 - 5;
    //         //     return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
    //         // });
    //     // });
    //     }, 2000);
        // $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
        // $scope.options = {
        //     scales: {
        //         yAxes: [
        //             {
        //                 id: 'y-axis-1',
        //                 type: 'linear',
        //                 display: true,
        //                 position: 'left'
        //             },
        //             {
        //                 id: 'y-axis-2',
        //                 type: 'linear',
        //                 display: true,
        //                 position: 'right'
        //             }
        //         ]
        //     }
        // };

    $scope.ContainsAllProcessReports = [];
    // 处理受到的消息
    $scope.ws.onmessage = function (e) {
        var stocksData = JSON.parse(e.data);
        if(stocksData){
            $scope.TestReportsScreen.PlanName = stocksData.PlanName;

            $scope.TestCaseComplated.forEach(function(item){

            });
            //$scope.
            //应用模型所有的变化。
            $scope.$apply();
        }


        console.log(stocksData);
    };
     $interval(function(){
         $scope.TestReportsScreen.PlanName  = "123";
     },30000);

    function StartTestCommand(){
        $scope.ws.send('{"Command":"StartTest"}');
    }


    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

}