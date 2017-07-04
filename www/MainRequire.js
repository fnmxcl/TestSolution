/**
 * Created by fnmxcl on 2017/04/20.
 */
//alert("加载成功！");
// <!--<script src="lib/jquery/dist/jquery.min.js"></script>-->
//     <!--<script src="lib/angular/angular.js"></script>-->
//     <!--<script src="lib/bootstrap/dist/js/bootstrap.min.js"></script>-->
//     <!--<script src="lib/bootstrap/js/button.js"></script>-->
//     <!--<script src="lib/ngAnimate/js/angular-animate.min.js"></script>-->
//     <!--<script src="//cdn.bootcss.com/angular-ui-bootstrap/0.11.2/ui-bootstrap-tpls.js"></script>-->
//     <!--<script src="lib/chart.js/dist/Chart.js"></script>-->
//     <!--<script src="lib/angular-chart.js/dist/angular-chart.js"></script>-->
//     <!--<script src="lib/angular-chart.js/dist/angular-chart.js"></script>-->
require.config({
    baseUrl: 'lib',
    paths: {
        'domReady': 'domReady/domReady',
        'underscore': 'underscore/underscore',
        "jquery": "jquery/dist/jquery.min",
        "angular": "angular/angular",
        "bootstrap": "bootstrap/dist/js/bootstrap",
        "buttonjs":"bootstrap/button",
        "ngAnimate":"ngAnimate/js/angular-animate.min",
        "ui.bootstrap":"//cdn.bootcss.com/angular-ui-bootstrap/0.11.2/ui-bootstrap-tpls",
        'chart': 'chart.js/dist/Chart.min',
        "angular-chart":"angular-chart/angular-chart",
        "mainApp":"./../Model/main",
    },
    map: {
        '*': {
            'css':'require-css/css.min',
            // 'domReady': libPath+'domReady/domReady'
        }
    },
    shim:{
        'underscore': {
            exports: '_'
        },
        'bootstrap':{
            deps:['jquery']
        },
        'angular': {
            exports: 'angular',
            deps:['jquery','bootstrap','css!themify-icons']
        },
        'buttonjs':{
            deps:['jquery']
        },

        'angular-chart':{
            deps:['chart']
        },
        'ui.bootstrap':['angular'],
        'mainApp':{
            deps:['angular','bootstrap','ui.bootstrap','chart','angular-chart'],
            exports: 'mainApp'
        },
    }
});

define(['require', 'angular', 'jquery','mainApp'],function(require,angular){
    'use strict';
    require(['domReady'],function(document){
        angular.bootstrap(document,['mainApp']);
    });
});