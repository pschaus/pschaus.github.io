/**
 * @author Sascha Van Cauwelaert
 */

//TODO : check that the component, appraoach and label names are in one word, or the properties do not work

//makes a bit more checks that could not be done via the JSON schema
function functionalChecksOfInputDataPassed(inputDataObject) {
      
    var nbApproaches = parseInt(inputDataObject.nbApproaches);	
    var models = inputDataObject.models;
    var nbInstances = parseInt(inputDataObject.nbInstances);
    var baseline = inputDataObject.baseline;
    var models = inputDataObject.models;
    var nbModels = models.length;
    
    if(!(nbApproaches == parseInt(inputDataObject.approachNames.length))) {
        alert("The number of approaches (" + inputDataObject.nbApproaches + ") does not match the number of approaches names (" + inputDataObject.approachNames.length+").");
        return false;
    }
    
    if(!(nbApproaches == nbModels)) {
        alert("The number of approaches (" + inputDataObject.nbApproaches + ") does not match the size of the array of models (" + inputDataObject.approachNames.length+").");
        return false;
    }
    
    if(baseline.times != null && !(nbInstances == baseline.times.length) ){
        alert("The baseline model has not the correct number of instances for the time property.");
        return false;
    }
    if(baseline.backtracks != null && !(nbInstances == baseline.backtracks.length) ){
        alert("The baseline model has not the correct number of instances for the backtrack property.");
        return false;
    }
    
    for (var j = 0; j < nbModels; j++) {
        var model = models[j];
        var modelName = inputDataObject.approachNames[j];
        if(model.times != null && !(nbInstances == model.times.length) ){
            alert("The model " + modelName + " has not the correct number of instances for the time property.");
            return false;
        }
        if(model.backtracks != null && !(nbInstances == model.backtracks.length) ){
            alert("The model " + modelName + " has not the correct number of instances for the backtrack property.");
            return false;
        }
        if(model.phiPruningTimes != null || model.phiPruningTimes != null){
            if (model.phiPruningTimes == null || model.phiPruningTimes == null) {
                alert("The model " + modelName + " must have both phiPruningTimes and phiNonPruningTimes properties, or none of them.");
                return false;
            }
            else if(!(nbInstances == model.phiPruningTimes.length)){
                alert("The model " + modelName + " has not the correct number of instances for the phiPruningTimes property.");
                return false;
            }
            else if(!(nbInstances == model.phiNonPruningTimes.length)){
                alert("The model " + modelName + " has not the correct number of instances for the phiNonPruningTimes property.");
                return false;
            }
            else {
                for(var i = 0 ; i < nbInstances ; i++) {
                    if (model.phiPruningTimes[i] + model.phiNonPruningTimes[i] > model.times[i]) {
                        alert("In the model " + modelName + ", the instance " + i + "has a solving time lower than the total amount of filtering time (with and without pruning).");
                        return false;
                    }
                }
            }
        }
    }

    return true;		
}

function savePlots() {
	
	function generateStyleDefs(svgDomElement) {
		var styleDefs = "";
		var sheets = document.styleSheets;
		for (var i = 0; i < sheets.length; i++) {
		  var rules = sheets[i].cssRules;
		  for (var j = 0; j < rules.length; j++) {
			var rule = rules[j];
			if (rule.style) {
			  var selectorText = rule.selectorText;
			  var elems = svgDomElement.querySelectorAll(selectorText);
	  
			  if (elems.length) {
				styleDefs += selectorText + " { " + rule.style.cssText + " }\n";
			  }
			}
		  }
		}

		var s = document.createElement('style');
		s.setAttribute('type', 'text/css');
		s.innerHTML = styleDefs;
	  
		var defs = document.createElement('defs');
		defs.appendChild(s);
		svgDomElement.insertBefore(defs, svgDomElement.firstChild);
	}
	
	//save svg
	var svg = document.getElementsByTagName("svg")[0];
	generateStyleDefs(svg);
	saveAs(new Blob([svg.parentNode.innerHTML], {type:"application/svg+xml"}), "performance-profile.svg");
}




// ------------------------ helper functions ----------------------------
  
function nbInstances() {
    var data = approaches();
    var firstApproach = data[Object.keys(data)[0]];
    return firstApproach[Object.keys(firstApproach)[0]].length;
}

function approaches() {
    return currentInputData.data;
}

function approachNames() {
    return Object.keys(approaches());
}

//compute the total amount of metric for a given approach.
//pre : approach an object that represents the approach data
/*function realTotalMetricOfApproach(approach) {
    
    var oneHundredRatios = {};
    
    Object.keys(data.data).forEach(function (approachName) {
    
    return realTotalMetricOfApproach(approach);
}*/

//compute the total amount of metric for a given approach
//some of the metric components might be scaled with a factor, if isFictional is set to true
function totalMetricOfApproach(approach, isFictional, componentRatios) {
    
    var numInstances = nbInstances();
    var totalMetric = Array.apply(null, Array(numInstances)).map(Number.prototype.valueOf,0);
    for (var i = 0 ; i < numInstances ; i++) {
        Object.keys(approach).forEach(function (component) {
            if (isFictional)
                totalMetric[i] += approach[component][i] * componentRatios[component];
            else
                totalMetric[i] += approach[component][i];
        });   
    }
    return totalMetric;
}


//filter out instances for which the time of one of the selected baselines is smaller than the minimum value (or equals 0 to prevent dividing by 0), or with a non-activated label
function keptInstanceIndices(minimalMetric, activatedLabels, dataLabels, activatedBaselines) {
    
    function isInstanceWithABaselineLargerThanMinimum(index) {
        var data = currentInputData.data;
        var isLarger = true;
        activatedBaselines.each(function(b) {
                var totalMetric = totalMetricOfApproach(data[activatedBaselines[b]], false, null)[index];
                if (totalMetric === 0 || totalMetric < minimalMetric) {
                  isLarger = false;  
                }
            });
        return isLarger;
    }
    
    var indices = Array.apply(null, {length: nbInstances()}).map(Number.call, Number);
    
    indices = indices.filter(function(i){
        return isInstanceWithABaselineLargerThanMinimum(i);}
    );
    
    var kept = indices.filter(function(i){
        var isInstanceKept = true;//isInstanceWithABaselineLargerThanMinimum(i);
        var labelIdsOfInstance = currentInputData.instances[i];
        for(var l = 0 ; isInstanceKept && l < labelIdsOfInstance.length; l++) {
            var label = dataLabels[labelIdsOfInstance[l]];
            if ($.inArray(label, activatedLabels) < 0){
                isInstanceKept = false;
            }
        }
        return isInstanceKept;
    });
    
    return kept;
}

//compute the baseline based on current selected baselines (for each instance, minimum of all )
function baselineForInstances(activatedBaselines, componentRatios) {
    var numInstances = nbInstances();
    var baselineValues = Array.apply(null, Array(numInstances)).map(Number.prototype.valueOf,Number.MAX_VALUE);
    
    activatedBaselines.each(function(b) {
        var approachName = activatedBaselines[b];
        
        var data = approaches();
        
        var approachValues = totalMetricOfApproach(data[approachName], true, componentRatios);
        for (var i = 0 ; i < numInstances ; i++) {
            baselineValues[i] = Math.min(baselineValues[i], approachValues[i]);
        }
    });
    return baselineValues;
}

function nvd3ProfileDataOfApproach(approach, approachName, keptIds, activatedBaselines, componentRatios, taus, minUnsolvedMetric) {

    var values = allMetricRatios(approach, keptIds, activatedBaselines,componentRatios, minUnsolvedMetric);

    var profile = taus.map(function(tau) {
        var numLeqTau = nbValuesLessThan(values,tau);
        var numInstances = values.length;
        return numLeqTau/numInstances;
    });
    var profileData = Array(taus.length);
    for (var t = 0; t < taus.length ; t++ ) {
        profileData[t] = {"x" : taus[t], "y" : profile[t] * 100};
    }
    
    return {values: profileData, key: approachName};	
}

//if an approach has an instance solved in more than minUnsolvedMetric, it is considered as unsolved, so has a ratio of Number.MAX_VALUE
function allMetricRatios(approach, keptIds, activatedBaselines,componentRatios, minUnsolvedMetric) {
    var baselineValues = baselineForInstances(activatedBaselines, componentRatios);
    var metricValues = totalMetricOfApproach(approach, true, componentRatios);
    return keptIds.map(function(i) {
        if (metricValues[i] < minUnsolvedMetric)
            return metricValues[i]/baselineValues[i];
        else
            return Number.MAX_VALUE;
    });
}

//return the maximum ratio (with the current baselines) of the data that is currently considered
//if an approach has an instance solved in more than minUnsolvedMetric, it is considered as unsolved
function largestMetricRatioForSolvedInstances(keptIds, activatedBaselines,componentRatios, minUnsolvedMetric) {
    var largestRatio = Number.MIN_VALUE;
    var appr = approaches();
    approachNames().forEach(function(name) {
        var ratios = allMetricRatios(appr[name], keptIds, activatedBaselines, componentRatios, minUnsolvedMetric);
        console.log(ratios);
        var ratiosForSolvedInstances = ratios.filter(function(r) {return r < Number.MAX_VALUE});
        console.log(ratiosForSolvedInstances);
        var maxRatioOfApproach = Math.max.apply(Math, ratiosForSolvedInstances);
        largestRatio = Math.max(largestRatio, maxRatioOfApproach);
    })
    console.log(largestRatio);
    return largestRatio;
}

function nbValuesLessThan(values, tau) {
    return values.filter(function(v) { return v <= tau;} ).length;
}