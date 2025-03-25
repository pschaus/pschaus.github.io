/**
 * @author Sascha Van Cauwelaert
 */

function plotProfilesFor(jsonObject, activatedBaselines, activatedLabels, componentRatios, isXScaleLinear) {
    
    var tauMin=Number(document.getElementById("minTau").value), tauMax=Number(document.getElementById("maxTau").value);

    var metricName = jsonObject.metric;

    if (tauMax <= tauMin) {
        return;
    }
    
    var numTau = 500;
    var minBaselineMetric=Number(document.getElementById("minBaselineMetric").value);
    var minUnsolvedMetric = Number(document.getElementById("minUnsolvedMetric").value);

    var result = tv4.validateResult(jsonObject, schema);
    if(!result.valid)
      alert("There are error(s) in your JSON data file : " + JSON.stringify(result.error,null, 4));
    else if(tv4.missing.length > 0)
      alert("Missing schemas: " + JSON.stringify(tv4.missing));
    else {
      
      //TODO : reimplement functional checks that cannot be done with the json schema
      
      plotPerformanceProfilesOfJSONFile(activatedBaselines, activatedLabels, componentRatios, tauMin, tauMax, numTau, minBaselineMetric, metricName, isXScaleLinear, minUnsolvedMetric);
      //if (functionalChecksOfInputDataPassed(jsonObject))
      //  plotPerformanceProfilesOfJSONFile(jsonObject, isBaselineStatic, tauMin, tauMax, numTau, minBaselineTime);
    }
}

function plotPerformanceProfilesOfJSONFile(activatedBaselines, activatedLabels, componentRatios, tauMin, tauMax, numTau, minBaselineMetric, metricName, isXScaleLinear, minUnsolvedMetric) {
  
  var keptIds = keptInstanceIndices(minBaselineMetric, activatedLabels, currentInputData.labels, activatedBaselines);
  var largestTauForSolvedInstances = largestMetricRatioForSolvedInstances(keptIds, activatedBaselines,componentRatios, minUnsolvedMetric);
  var data = nvd3Data(keptIds, largestTauForSolvedInstances);
  
  nv.addGraph(function() {
      var chart = nv.models.lineChart()
              .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
              .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
              .showYAxis(true)        //Show the y-axis
              .showXAxis(true)        //Show the x-axis
              .interpolate("step")
              .forceY([0,100])
              .color(["#1f77b4", "#ff7f0e", 
                "#2ca02c", "#98df8a", "#d62728", 
                "#ff9896", "#9467bd", "#c5b0d5", 
                "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", 
                "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"])
    ;

    if(!isXScaleLinear) {
      chart.xScale(d3.scale.log().base(2));
      chart.xAxis.tickValues([1,2,4,8,16,32,64,128,256]);
    }
    else { 

        var width = parseInt(d3.select('#chart').style('width'), 10);

        chart.xDomain([tauMin, tauMax, largestTauForSolvedInstances]);
        chart.xRange([0, width - 250, width - 150]);

        //chart.xAxis.tickValues([tauMin, tauMax,largestTauForSolvedInstances]);
    }

    chart.xAxis     //Chart x-axis settings
        .axisLabel('\u03C4 ( ' + metricName + ' )')
        .tickFormat(d3.format(',.2r'))
        .height(300)
        .axisLabelDistance(10);
        ;
  
    chart.yAxis     //Chart y-axis settings
        .axisLabel('% instance')
        .tickFormat(d3.format('.r'))
        ;

    d3.select('#chart svg')   //Select the <svg> element you want to render the chart in.
      .datum(data)         //Populate the <svg> element with chart data...
      .transition().duration(500)
        .call(chart);          //Finally, render the chart!
        
    //Update the chart when window resizes.
    nv.utils.windowResize(function() {
      chart.update(); 
      });
    
    return chart;
  });
  
  function nvd3Data(keptIds, largestTauForSolvedInstances) {
      var tausBeforeTauMax = range(tauMin,tauMax,numTau/2);
      var tausAfterTauMax = range(tauMax,largestTauForSolvedInstances,numTau/2);

      var taus = tausBeforeTauMax.concat(tausAfterTauMax);
      
      var data = [];
      
      var approachesData = approaches()
      
      approachNames().forEach(function(name){
        data.push(nvd3ProfileDataOfApproach(approachesData[name], name, keptIds, activatedBaselines, componentRatios, taus, minUnsolvedMetric));
      });

      return data;
  }
  
  function range(from, to, numPoints) {
      var rangeToReturn = Array(numPoints);
      rangeToReturn[0] = from;
      var increment = (to - from)/numPoints;
      for (var i = 1; i < numPoints; i++)
          rangeToReturn[i]=rangeToReturn[i-1]+increment;
      if (rangeToReturn[rangeToReturn.length -1] < to) {
          rangeToReturn.push(to);
      }
      return rangeToReturn;
  }
}


