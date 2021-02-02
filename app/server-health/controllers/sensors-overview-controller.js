/**
 * Controller for sensors-overview
 *
 * @module app/serverHealth
 * @exports sensorsOverviewController
 * @name sensorsOverviewController
 */

window.angular && (function(angular) {
  'use strict';
  angular.module('app.overview').controller('sensorsOverviewController', [
    '$scope', '$log', '$window', 'APIUtils', 'dataService', 'Constants',
    function($scope, $log, $window, APIUtils, dataService, Constants) {
      $scope.dataService = dataService;
      $scope.selected_sensor_title = dataService.selected_sensor_title;

      $scope.dropdown_selected = false;

      $scope.$log = $log;
      $scope.customSearch = '';
      $scope.searchTerms = [];
      $scope.messages = Constants.MESSAGES.SENSOR;
      $scope.selectedSeverity =
          {all: true, normal: false, warning: false, critical: false};
      $scope.export_name = 'sensors.json';
      $scope.loading = false;
      $scope.jsonData = function(data) {
        var dt = {};
        data.data.forEach(function(item) {
          dt[item.original_data.key] = item.original_data.value;
        });
        return JSON.stringify(dt);
      };

      $scope.clear = function() {
        $scope.customSearch = '';
        $scope.searchTerms = [];
      };

      $scope.doSearchOnEnter = function(event) {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (event.keyCode === 13 && search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.doSearchOnClick = function() {
        var search =
            $scope.customSearch.replace(/^\s+/g, '').replace(/\s+$/g, '');
        if (search.length >= 2) {
          $scope.searchTerms = $scope.customSearch.split(' ');
        } else {
          if (search.length == 0) {
            $scope.searchTerms = [];
          }
        }
      };

      $scope.doSensorOnClick = function(element) {
          dataService.selected_sensor=element.sensor;	  
          dataService.selected_sensor_title=element.sensor.title;	  
          $scope.selected_sensor_title=element.sensor.title;	  
	  document.getElementById("sensor__selected").innerHTML=element.sensor.title;
	  drowGraph();
      };

      $scope.doGraphShowHideOnClick = function() {
          var e = document.getElementById("content__graph-element");
	  if(e.style.display == "block"){
	    e.style.display="none";
	    document.getElementById("content__graph-submit").setAttribute("value","Show");
	  }
	  else {
	    e.style.display="block";
	    document.getElementById("content__graph-submit").setAttribute("value","Hide");
	  }
      };

      $scope.toggleSeverityAll = function() {
        $scope.selectedSeverity.all = !$scope.selectedSeverity.all;

        if ($scope.selectedSeverity.all) {
          $scope.selectedSeverity.normal = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        }
      };

      $scope.toggleSeverity = function(severity) {
        $scope.selectedSeverity[severity] = !$scope.selectedSeverity[severity];

        if (['normal', 'warning', 'critical'].indexOf(severity) > -1) {
          if ($scope.selectedSeverity[severity] == false &&
              (!$scope.selectedSeverity.normal &&
               !$scope.selectedSeverity.warning &&
               !$scope.selectedSeverity.critical)) {
            $scope.selectedSeverity.all = true;
            return;
          }
        }

        if ($scope.selectedSeverity.normal && $scope.selectedSeverity.warning &&
            $scope.selectedSeverity.critical) {
          $scope.selectedSeverity.all = true;
          $scope.selectedSeverity.normal = false;
          $scope.selectedSeverity.warning = false;
          $scope.selectedSeverity.critical = false;
        } else {
          $scope.selectedSeverity.all = false;
        }
      };

      $scope.filterBySeverity = function(sensor) {
        if ($scope.selectedSeverity.all) return true;

        return (
            (sensor.severity_flags.normal && $scope.selectedSeverity.normal) ||
            (sensor.severity_flags.warning &&
             $scope.selectedSeverity.warning) ||
            (sensor.severity_flags.critical &&
             $scope.selectedSeverity.critical));
      };
      $scope.filterBySearchTerms = function(sensor) {
        if (!$scope.searchTerms.length) return true;

        for (var i = 0, length = $scope.searchTerms.length; i < length; i++) {
          if (sensor.search_text.indexOf($scope.searchTerms[i].toLowerCase()) ==
              -1)
            return false;
        }
        return true;
      };

     function drowPath(width,height,ax,ay){
          var sensor=dataService.selected_sensor;
	  var history=dataService.sensors_history[sensor.title];
	  var path_str="";
	  var v_min=0;
	  var v_max=Math.ceil(sensor.CriticalHigh+sensor.CriticalLow);
	  var y_min=v_min;
	  var y_max=height; // y=v*y_max/v_max
	  var dy=y_max/v_max;
	  var now=new Date();
	  var now_year =now.getFullYear();
	  var now_month=now.getMonth();
	  var now_date =now.getDate();
	  history.forEach(function(item){
	    var date=item[0]; 
	    if(date.getFullYear()==now_year &&
		 date.getMonth()==now_month &&
		 date.getDate()==now_date){
	      var hh=date.getHours();
	      var mm=date.getMinutes();
	      var x=ax+(hh*60+mm);
	      var y=height-ay-Math.round(item[1]*dy,0);
	      if(path_str){ path_str+=" "+x+" "+y+","; }
	      else { path_str="M "+(x-1)+" "+(y-1)+" L "+x+" "+y+","; }
	    }
	  });
	  var path_element=document.getElementById("sensor_path");
	  path_element.setAttribute("d",path_str);
      }

      function drowGraph() {
	  var svg = document.getElementById("svg__graph");
	  while (svg.lastChild) {
	      svg.removeChild(svg.lastChild);
	  }
	  var svgNS = "http://www.w3.org/2000/svg";
	  var y_base=511;
	  var y_step=10;
	  var y_steps=5;
	  var y_period=y_step*y_steps;
	  var y_text=y_base+25;
	  var y1=y_base;
	  var y2=0;

	  var x_base=50;
	  var x_step=10;
	  var x_steps=6;
	  var x_period=x_step*x_steps;
	  var x1=x_base;
	  var x2=1500;
	  var color="gray";

	  var y_critical=100;
	  var y_warning=200;

          var sensor=dataService.selected_sensor;

	  var v_wl=sensor.WarningLow;
	  var v_cl=sensor.CriticalLow;
	  var v_min=0;
	  var v_wh=sensor.WarningHigh;
	  var v_ch=sensor.CriticalHigh;
	  var v_max=Math.ceil(sensor.CriticalHigh+sensor.CriticalLow);
	  var y_min=v_min;
	  var y_max=y_base; // y=v*y_max/v_max
	  
	  var g_rect = document.createElementNS(svgNS, "g");
	  g_rect.setAttribute("fill-opacity",".15");
	  svg.appendChild(g_rect);

	  var zone_ch = document.createElementNS(svgNS, "rect");
	  var y=y_base-y_max;
	  var height=y_max*(v_max-v_ch)/v_max;
	  var width=x2-x_base;
	  zone_ch.setAttribute("x", x_base);
	  zone_ch.setAttribute("y", y);
	  zone_ch.setAttribute("width", width);
	  zone_ch.setAttribute("height",height);
	  zone_ch.setAttribute("fill", "red");
	  g_rect.appendChild(zone_ch);

	  var zone_wh = document.createElementNS(svgNS, "rect");
	  y+=height;
	  height=y_max*(v_ch-v_wh)/v_max;
	  zone_wh.setAttribute("x", x_base);
	  zone_wh.setAttribute("y", y);
	  zone_wh.setAttribute("width", width);
	  zone_wh.setAttribute("height",height);
	  zone_wh.setAttribute("fill", "#ff9e2c"); //orange
	  g_rect.appendChild(zone_wh);

	  var zone_normal = document.createElementNS(svgNS, "rect");
	  y+=height;
	  height=y_max*(v_wh-v_wl)/v_max;
	  zone_normal.setAttribute("x", x_base);
	  zone_normal.setAttribute("y", y);
	  zone_normal.setAttribute("width", width);
	  zone_normal.setAttribute("height",height);
	  zone_normal.setAttribute("fill", "green");
	  g_rect.appendChild(zone_normal);

	  var zone_wl = document.createElementNS(svgNS, "rect");
	  y+=height;
	  height=y_max*(v_wl-v_cl)/v_max;
	  zone_wl.setAttribute("x", x_base);
	  zone_wl.setAttribute("y", y);
	  zone_wl.setAttribute("width", width);
	  zone_wl.setAttribute("height",height);
	  zone_wl.setAttribute("fill", "#ff9e2c"); //orange
	  g_rect.appendChild(zone_wl);

	  var zone_cl = document.createElementNS(svgNS, "rect");
	  y+=height;
	  height=y_max*(v_cl-v_min)/v_max;
	  zone_cl.setAttribute("x", x_base);
	  zone_cl.setAttribute("y", y);
	  zone_cl.setAttribute("width", width);
	  zone_cl.setAttribute("height",height);
	  zone_cl.setAttribute("fill", "red");
	  g_rect.appendChild(zone_cl);

	  var i_max=v_max*10+1;
	  var dy=y_max/i_max;
	  for(var i=0;i<=i_max;i++){
	      var width=(i % 10)? 1:2;
	      var x=(width==1)? ((i%5)?x1:x-5):x1-10;
	      var y=y_base-(i*dy);	      
	      var axis_x = document.createElementNS(svgNS, "line");
	      axis_x.setAttribute("x1", x);
	      axis_x.setAttribute("x2", x2);
	      axis_x.setAttribute("y1", y);
	      axis_x.setAttribute("y2", y);
	      axis_x.setAttribute("stroke", color);
	      axis_x.setAttribute("stroke-width", width);
	      axis_x.setAttribute("fill", "transparent");
	      svg.appendChild(axis_x);
	      if(width==2){
		  var text_content = Math.round(i/10,0);
	          var value_label = document.createElementNS(svgNS, "text");
	          value_label.setAttribute("x", x-20);
	          value_label.setAttribute("y", y+5);
	          value_label.textContent=text_content;
		  svg.appendChild(value_label);
	      }
	  }

	  var axis_y_label = document.createElementNS(svgNS, "text");
	  axis_y_label.setAttribute("x", 12);
	  axis_y_label.setAttribute("y", 270);
	  axis_y_label.setAttribute("transform","rotate(-90 12 270)");
	  axis_y_label.textContent=dataService.selected_sensor.unit;
	  svg.appendChild(axis_y_label);

	  for(var i=0;i<x2;i+=x_step){
	      var width=(i % (x_step * 6))? 1:2;
	      var x=x_base+i;
	      var y=(width==1)? y1:y1+5;
	      var axis_y = document.createElementNS(svgNS, "line");
	      axis_y.setAttribute("x1", x);
	      axis_y.setAttribute("x2", x);
	      axis_y.setAttribute("y1", y);
	      axis_y.setAttribute("y2", y2);
	      axis_y.setAttribute("stroke", color);
	      axis_y.setAttribute("stroke-width", width);
	      axis_y.setAttribute("fill", "transparent");
	      svg.appendChild(axis_y);
	      if(width==2){
		  var hour = i / x_period;
	          var time_label = document.createElementNS(svgNS, "text");
		  x=(hour>=10)? x-10:x-5; 
	          time_label.setAttribute("x", x);
	          time_label.setAttribute("y", y_text);
	          time_label.textContent=hour;
		  svg.appendChild(time_label);
	      }
	  }

	  var axis_x_label = document.createElementNS(svgNS, "text");
	  axis_x_label.setAttribute("x", 0);
	  axis_x_label.setAttribute("y", y_text);
	  axis_x_label.textContent="Hour";
	  svg.appendChild(axis_x_label);

	  var path = document.createElementNS(svgNS, "path");
	  path.setAttribute("d","");
	  path.setAttribute("id","sensor_path");
	  path.setAttribute("stroke", "blue");
	  path.setAttribute("stroke-width", "2");
	  path.setAttribute("fill", "transparent");
	  svg.appendChild(path);
	  drowPath(1500,540,50,29);
      }

      $scope.loadSensorData = function() {
        //$scope.loading = true;
        APIUtils.getAllSensorStatus(function(data, originalData) {
	  dataService.appendSensorsData(data);
          $scope.data = data;
          $scope.originalData = originalData;
          $scope.export_data = JSON.stringify(originalData);
          //$scope.loading = false;
        });
      };

      var reloadSensorData = function(){
	$scope.loadSensorData();
	setTimeout(function(){  
	    if(dataService.selected_sensor){
/*
	        for(var sensor in $scope.data){
		    console.log(sensor.title);
		    if(sensor.title == dataService.selected_sensor_title){
		        dataService.selected_sensor=sensor;
		        $scope.selected_sensor_title=sensor.title;
		    }
	        }
*/
	        if(document.getElementById("sensor_path")){
		    drowPath(1500,540,50,29);
	        }
	        else {
		    drowGraph();
		}
	    }
	},500);
      };

      reloadSensorData();
      let timerId = setInterval(reloadSensorData, 60000);
	
    }
 
  ]);
})(angular);

