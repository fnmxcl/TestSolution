main.directive('testChart',function(){
    return {
        scope: {
            // id: "@",
            SourceItem: "@sourceitem",
            // chartItem: "=",
            // chartData: "=",
            ScreenType:"@screentype"
        },
        // scope:false,
        restrict: 'E',
        template: '<div style="height:400px"></div>',
        replace: true,
        link: function($scope, element, attrs, controller) {
            var ecElement = element[0];
            var myChart = echarts.init(ecElement);
            myChart.showLoading();
            $scope.legend = [];

            $scope.chartitem = [];
            $scope.ChartType = "line";
            $scope.legendPosition = "right";
            $scope.Serial = [];
            var testPlanItem= JSON.parse($scope.SourceItem);
            if(!$scope.ScreenType || $scope.ScreenType == "ChartL"){

                var chartdata = [];
                for(var i = 0;i < testPlanItem.ImitationThreads; i++){
                    $scope.chartitem.push(i + 1);
                }
                angular.forEach(testPlanItem.TestCaseCounter,function(testresultItem){
                    var chartItemData =[];
                    $scope.legend.push(testresultItem.TestCaseIdentityName);
                    angular.forEach(testresultItem.TestResultEntity,function(item){
                        if(item.ResultType == "incorrect" && item.Result.indexOf("TestPlanHeapFunction@Timeout") == 0) {
                            chartItemData.push(-1);
                        }else{
                            chartItemData.push(item.Duration);
                        }
                    });
                    chartdata.push(chartItemData);
                });
                for(var i=0;i<$scope.legend.length;i++){
                    var item = {
                        name : $scope.legend[i],
                        type: $scope.ChartType,
                        data: chartdata[i],
                        markLine: {
                            data: [
                                {type: 'average', name: '平均值'}
                            ]
                        }
                    };
                    $scope.Serial.push(item);
                }

            }else{
                $scope.legendPosition = "top";
                $scope.ChartType = "bar";
                $scope.legend=["请求总数","成功请求","失败请求","函数超时"];
                $scope.chartitem = [];
                var _wholeCount = [];
                var _successCount = [];
                var _failCount = [];
                var _functionTimeout = [];
                angular.forEach(testPlanItem.TestCaseCounter,function(testresultItem){
                    var wholeCount = 0;
                    var successCount  = 0;
                    var failCount  = 0;
                    var functionTimeout = 0;
                    angular.forEach(testresultItem.TestResultEntity,function(item){
                        if(item.ResultType == "correct"){
                            successCount = successCount + 1;
                        }else{
                            if(item.ResultType == "incorrect" && item.Result.indexOf("TestPlanHeapFunction@Timeout") == 0){
                                functionTimeout = functionTimeout + 1;
                            }else{
                                failCount = failCount + 1;
                            }
                        }
                        wholeCount = wholeCount + 1;
                    });
                    _wholeCount.push(wholeCount);
                    _successCount.push(successCount);
                    _failCount.push(failCount);
                    _functionTimeout.push(functionTimeout);
                    $scope.chartitem.push(testresultItem.TestCaseIdentityName);
                });

                $scope.Serial =  [
                    {
                        name:'请求总数',
                        type:'bar',
                        data:_wholeCount,
                        color:  ["#5378BE"],
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: '平均值'}
                            ]
                        },
                    },
                    {
                        name:'成功请求',
                        type:'bar',
                        data:_successCount,
                        color:  ["#B5C334"],
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: '平均值'}
                            ]
                        }
                    },
                    {
                        name:'失败请求',
                        type:'bar',
                        data: _failCount,
                        color:["#C1232B"],
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name : '平均值'}
                            ]
                        }
                    },
                    {
                        name:'函数超时',
                        type:'bar',
                        data: _functionTimeout,
                        color:["#FECB04"],
                        markPoint : {
                            data : [
                                {type : 'max', name: '最大值'},
                                {type : 'min', name: '最小值'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name : '平均值'}
                            ]
                        }
                    }
                ];
                // $scope.chartdata = [[3,4],[5,6]];
            }

            // data2.labels = ["January1", "February1", "March1", "April1", "May1", "June1", "July1"];
            // $scope.legend = ["Berlin"];
            // $scope.chartitem = ['Jan', 'Feb', 'Mar', 'Apr', 'Mar', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            // $scope.chartdata = [
            //     [-1, 1, 3, 7, 13, 16, 18, 16, 15, 9, 4, 2], //Berlin
            // ];

            var option = {
                title: {
                    left: 'left',
                    text: testPlanItem.PlanName +"["+testPlanItem.Pid+"]" + $scope.ScreenType,
                    subtext: '运行进程号:' + testPlanItem.Pid
                },
                // 提示框，鼠标悬浮交互时的信息提示
                tooltip: {
                    show: true,
                    type: 'cross',
                    trigger: 'axis' ,
                    animation: false,
                    // label: {
                    //     // backgroundColor: '#ccc',
                    //     // borderColor: '#aaa',
                    //     // borderWidth: 1,
                    //     // shadowBlur: 0,
                    //     // shadowOffsetX: 0,
                    //     // shadowOffsetY: 0,
                    //     // textStyle: {
                    //     //     color: '#222'
                    //     // }
                    // }
                },
                show : true,
                toolbox: {
                    show : true,
                    orient: 'vertical',
                    x: 'right',
                    y: 'center',
                    feature : {
                        'mark': {'show': true},
                        'dataView': { 'show': true,'readOnly': true},
                        'magicType': { 'show': true, 'type': ['line', 'bar', 'stack', 'tiled'] },
                        'restore': {  'show': true },
                        'saveAsImage': {  'show': true}
                    }
                },
                // 图例
                legend: {
                    data: $scope.legend,
                    right:$scope.legendPosition
                },
                // 横轴坐标轴
                xAxis: [{
                    type: 'category',
                    data: $scope.chartitem
                }],
                // 纵轴坐标轴
                yAxis: [{
                    type: 'value'
                }],
                // 数据内容数组
                series: $scope.Serial
            };
            angular.element(window).bind('resize', myChart.resize);
            myChart.hideLoading();
            myChart.setOption(option);
        }
    };
});