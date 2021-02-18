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

      $scope.svg_width=1489;
      $scope.svg_height=540;
      var svg_dx=50;
      var svg_dy=29
	
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
          var e = document.getElementById("content__graph");
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

     function drowPath(width,height,svg_dx,svg_dy){
          var sensor=dataService.selected_sensor;
	 
	  var path_str="";
	  var v_min=0;
	  var v_ch=(sensor.CriticalHigh>0)? sensor.CriticalHigh:sensor.WarningHigh;
	  var v_cl=(sensor.CriticalLow>0)? sensor.CriticalLow:sensor.WarningLow;
	  var epsilon=0.000001;
/*
	  v_cl=0.9;
	  v_ch=1.2;
*/
	  var v_max=v_ch+v_cl;
	  var dv=(v_max<10)? 0.1:0.5;
	  if(Math.abs(Math.round(v_max,0)-v_max) < epsilon){ v_max+=dv; }
	  var y_min=v_min;
	  var y_max=height-svg_dy; // y=v*y_max/v_max
	  var dy=y_max/v_max;
	  var x, y;

	  var TIME_ZONE=3;
	  var TIME_DURATION_S=1000; // milliseconds
	  var TIME_DURATION_M=TIME_DURATION_S*60;
	  var TIME_DURATION_H=TIME_DURATION_M*60;
	  var TIME_DURATION_D=TIME_DURATION_H*24;
	  var history=dataService.sensors_history[sensor.title];
	  var time_length=history.length;
	  var time_0=history[0][0];
	  var time_0_ms=time_0.getTime();
	  var time_last=history[time_length-1][0];
	  var time_last_ms=time_last.getTime();
	  var time_diff_ms=time_last_ms-time_0_ms;
          var time_left_ms=(time_diff_ms<=TIME_DURATION_D)? time_0_ms:time_last_ms-TIME_DURATION_D;
	  time_left_ms-=time_left_ms % TIME_DURATION_H;
	  var time_left_h = Math.floor((time_left_ms % TIME_DURATION_D) / TIME_DURATION_H) + TIME_ZONE;
	  //console.log("time_left_h="+time_left_h);
	  var time_right_ms=time_left_ms+TIME_DURATION_D;
	  //var time_right_h = time_right_ms % TIME_DURATION_H;
	 
          for(var i=0;i<24;i++){
	      var time_line=document.getElementById("time_line_"+i);
	      var time_label=document.getElementById("time_label_"+i);
	      var hx=(i>=time_left_h)? i-time_left_h:24-time_left_h+i;
	      x=svg_dx+hx*60;
	      time_line.setAttribute("x1",x);
	      time_line.setAttribute("x2",x);
	      x=(i>=10)? x-10:x-5; 
	      time_label.setAttribute("x",x);
	  }

	  var path_start=document.getElementById("path_start");
	  var path_end=document.getElementById("path_end");
	  history.forEach(function(item){
	      var date=item[0];
	      var t=date.getTime();
	      if(t>=time_left_ms && t<=time_right_ms){
		  var hh=Math.floor((t-time_left_ms) / TIME_DURATION_H);
		  var mm=Math.floor(((t-time_left_ms) % TIME_DURATION_H) / TIME_DURATION_M);
		  x=svg_dx+(hh*60+mm);
		  //var value=1.066; //item[1]
		  var value=item[1];
		  y=Math.round(y_max-value*dy,0);
		  if(path_str){ path_str+=" "+x+" "+y+","; }
		  else {
		      path_start.setAttribute("cx",x);
		      path_start.setAttribute("cy",y);
		      path_str="M "+(x-1)+" "+(y-1)+" L "+x+" "+y+",";
		  }
	      }
	  });
	  var path_element=document.getElementById("sensor_path");
	  path_element.setAttribute("d",path_str);
	  path_end.setAttribute("cx",x);
	  path_end.setAttribute("cy",y);
      }

      function drowGraph() {
	  var svg = document.getElementById("svg__graph");
	  while (svg.lastChild) {
	      svg.removeChild(svg.lastChild);
	  }
	  var svgNS = "http://www.w3.org/2000/svg";
	  var y1=$scope.svg_height-svg_dy;
	  var y2=0;
	  var y_step=10;
	  var y_steps=5;
	  var y_period=y_step*y_steps;
	  var y_text=y1+25;

	  var x1=svg_dx;
	  var x2=$scope.svg_width;
	  var width=x2-x1;
	  var x_step=10;
	  var x_steps=6;
	  var x_period=x_step*x_steps;
	  var color="gray";

          var sensor=dataService.selected_sensor;
	  var v_min=0;
	  var v_wl=sensor.WarningLow;
	  var v_wh=sensor.WarningHigh;
	  var v_cl=(sensor.CriticalLow>0)? sensor.CriticalLow:v_wl;
	  var v_ch=(sensor.CriticalHigh>0)? sensor.CriticalHigh:v_wh;
	  var epsilon=0.000001;
/*
	  v_wl=0.99;
	  v_wh=1.1;
	  v_cl=0.9;
	  v_ch=1.2;
*/
	  var v_max=v_ch+v_cl;
	  var dv=(v_max<10)? 0.1:0.5;
	  if(Math.abs(Math.round(v_max,0)-v_max) < epsilon){ v_max+=dv; }
	  var y_min=v_min;
	  var y_max=y1; // y=v*y_max/v_max
	  var dy=y_max/v_max;
	  
	  var g_rect = document.createElementNS(svgNS, "g");
	  g_rect.setAttribute("fill-opacity",".15");
	  svg.appendChild(g_rect);

	  var zone_ch = document.createElementNS(svgNS, "rect");
	  var x, y=y1-y_max;
	  var height=y_max*(v_max-v_ch)/v_max;
	  zone_ch.setAttribute("x", x1);
	  zone_ch.setAttribute("y", y);
	  zone_ch.setAttribute("width", width);
	  zone_ch.setAttribute("height",height);
	  zone_ch.setAttribute("fill", "red");
	  g_rect.appendChild(zone_ch);

	  var zone_wh = document.createElementNS(svgNS, "rect");
	  y=y1-y_max*v_ch/v_max;
	  height=y_max*(v_ch-v_wh)/v_max;
	  zone_wh.setAttribute("x", x1);
	  zone_wh.setAttribute("y", y);
	  zone_wh.setAttribute("width", width);
	  zone_wh.setAttribute("height",height);
	  zone_wh.setAttribute("fill", "#ff9e2c"); //orange
	  g_rect.appendChild(zone_wh);

	  var zone_normal = document.createElementNS(svgNS, "rect");
	  y=y1-y_max*v_wh/v_max;
	  height=y_max*(v_wh-v_wl)/v_max;
	  zone_normal.setAttribute("x", x1);
	  zone_normal.setAttribute("y", y);
	  zone_normal.setAttribute("width", width);
	  zone_normal.setAttribute("height",height);
	  zone_normal.setAttribute("fill", "green");
	  g_rect.appendChild(zone_normal);

	  var zone_wl = document.createElementNS(svgNS, "rect");
	  y=y1-y_max*v_wl/v_max;
	  height=y_max*(v_wl-v_cl)/v_max;
	  zone_wl.setAttribute("x", x1);
	  zone_wl.setAttribute("y", y);
	  zone_wl.setAttribute("width", width);
	  zone_wl.setAttribute("height",height);
	  zone_wl.setAttribute("fill", "#ff9e2c"); //orange
	  g_rect.appendChild(zone_wl);

	  var zone_cl = document.createElementNS(svgNS, "rect");
	  y=y1-y_max*v_cl/v_max;
	  height=y_max*(v_cl-v_min)/v_max;
	  zone_cl.setAttribute("x", x1);
	  zone_cl.setAttribute("y", y);
	  zone_cl.setAttribute("width", width);
	  zone_cl.setAttribute("height",height);
	  zone_cl.setAttribute("fill", "red");
	  g_rect.appendChild(zone_cl);

	  for(var i=0;i<v_max;i+=dv){
	      var stroke_width=(Math.abs(Math.round(i,0)-i) < epsilon)? 2:1;
	      x=(stroke_width==1)? ((Math.abs(Math.round(i*2,0)-i*2) < epsilon)? x1-5:x1):x1-10;
	      y=Math.round(y1-i*dy,0);	      
	      var axis_x = document.createElementNS(svgNS, "line");
	      axis_x.setAttribute("x1", x);
	      axis_x.setAttribute("x2", x2);
	      axis_x.setAttribute("y1", y);
	      axis_x.setAttribute("y2", y);
	      axis_x.setAttribute("stroke", color);
	      axis_x.setAttribute("stroke-width", stroke_width);
	      axis_x.setAttribute("fill", "transparent");
	      svg.appendChild(axis_x);
	      if(stroke_width==2){
	          var value_label = document.createElementNS(svgNS, "text");
	          value_label.setAttribute("x", x-20);
	          value_label.setAttribute("y", y+5);
	          value_label.textContent=Math.round(i,0);
		  svg.appendChild(value_label);
	      }
	  }

	  var axis_y_label = document.createElementNS(svgNS, "text");
	  axis_y_label.setAttribute("x", 12);
	  axis_y_label.setAttribute("y", 270);
	  axis_y_label.setAttribute("transform","rotate(-90 12 270)");
	  axis_y_label.textContent=dataService.selected_sensor.unit;
	  if(axis_y_label.textContent == "C"){ axis_y_label.textContent="°C"; }
	  svg.appendChild(axis_y_label);

	  for(var i=0;i<width;i+=x_step){
	      var stroke_width=(i % (x_step * 6))? 1:2;
	      x=x1+i;
	      var time_line = document.createElementNS(svgNS, "line");
	      time_line.setAttribute("x1", x);
	      time_line.setAttribute("x2", x);
	      time_line.setAttribute("y1", y1);
	      time_line.setAttribute("y2", y2);
	      time_line.setAttribute("stroke", color);
	      time_line.setAttribute("stroke-width",1);
	      time_line.setAttribute("fill", "transparent");
	      svg.appendChild(time_line);
	      if(stroke_width==2){
		  var hour = i / x_period;
	          time_line = document.createElementNS(svgNS, "line");
	          time_line.setAttribute("id","time_line_" + hour);
	          time_line.setAttribute("x1", x);
	          time_line.setAttribute("x2", x);
	          time_line.setAttribute("y1", y1+5);
	          time_line.setAttribute("y2", y2);
	          time_line.setAttribute("stroke", color);
	          time_line.setAttribute("stroke-width", stroke_width);
	          time_line.setAttribute("fill", "transparent");
	          svg.appendChild(time_line);
	          var time_label = document.createElementNS(svgNS, "text");
		  x=(hour>=10)? x-10:x-5; 
	          time_label.setAttribute("id","time_label_" + hour);
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

 	  var circle = document.createElementNS(svgNS, "circle");
	  circle.setAttribute("id","path_start");
	  circle.setAttribute("cx",-100);
	  circle.setAttribute("cy",-100);
	  circle.setAttribute("r",5);
	  circle.setAttribute("stroke", "blue");
	  circle.setAttribute("stroke-width", "2");
	  circle.setAttribute("fill", "transparent");
	  svg.appendChild(circle);

 	  var circle2 = document.createElementNS(svgNS, "circle");
	  circle2.setAttribute("id","path_end");
	  circle2.setAttribute("cx",-100);
	  circle2.setAttribute("cy",-100);
	  circle2.setAttribute("r",2);
	  circle2.setAttribute("stroke", "blue");
	  circle2.setAttribute("stroke-width", "2");
	  circle2.setAttribute("fill", "transparent");
	  svg.appendChild(circle2);

	  var path = document.createElementNS(svgNS, "path");
	  path.setAttribute("d","");
	  path.setAttribute("id","sensor_path");
	  path.setAttribute("stroke", "blue");
	  path.setAttribute("stroke-width", "2");
	  path.setAttribute("fill", "transparent");
	  svg.appendChild(path);
	  drowPath($scope.svg_width,$scope.svg_height,svg_dx,svg_dy);
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
		    drowPath($scope.svg_width,$scope.svg_height,svg_dx,svg_dy);
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

