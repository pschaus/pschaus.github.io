/**
 * @author Sascha Van Cauwelaert
 */

var sliderPrefix = "slider-";

$(function(){
   
   //prepare the link to download the JSON schema
   var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schema));
   $('#downloadSchema').attr("href", "data:"+data);  
   $('#downloadSchema').attr("download", "schema.json");
   
   //input json file
   $("#jsonInputFile").fileinput('refresh', {browseLabel: 'Data'});
   $("#jsonInputFile").on('fileloaded', function(/*event, file, previewId, index, reader*/) {
    deactivateAllDataButtons();
    loadDataFile();
   });
   
   $("#minTau" ).change(function() {
      redraw();
   });
   
   $("#maxTau" ).change(function() {
      redraw();
   });
   
   $("#minBaselineMetric" ).change(function() {
      redraw();
   });

   $("#minUnsolvedMetric" ).change(function() {
      redraw();
   });
   
   $("#jsonInputFile").fileinput({
                    autoReplace: true,
                    maxFileCount: 1,
                    allowedFileExtensions: ["json"]
                });
   $("#input-example").text(stringify(inputExample));

   $("#xscale-type-checkbox").bootstrapSwitch();

   $("#xscale-type-checkbox").on('switchChange.bootstrapSwitch', function () {
      redraw();
   });

   generateUIElementsFromData(currentInputData);
   redraw();

   window.setInterval(function(){
      if(isASliderUpdated)
        redraw();
   }, 200);
});

function loadDataFile() {
  
  function clearUIElements() {
    $('#baselines').empty();
    $('#labels').empty();
    $('#reduction-sliders').empty();
  }
  
  var f = document.getElementById("jsonInputFile").files[0];
  if (f) {
    var r = new FileReader();
    r.onload = function(e) {
        var contents = e.target.result;
        currentInputData = JSON.parse(contents);
        clearUIElements();
        generateUIElementsFromData(currentInputData);
        redraw();
    };
    r.onerror = function (evt) {
        console.log("Error while reading file.");
    };
    r.readAsText(f);
  }
}


function generateUIElementsFromData(data) {
  
  function metricComponents(data) {
    var components = [];
    
    Object.keys(data.data).forEach(function (approachName) {
      var approach = data.data[approachName];
      Object.keys(approach).forEach(function (componentName) {
        if (components.indexOf(componentName) < 0)
          components.push(componentName);
      });
    });
    
    return components;
  }

  function changeActiveStatus(item) {
      if (item.hasClass('active')) 
          item.removeClass('active');
      else
          item.addClass('active');
  }
  
  //baselines
  $('#baselines').append('<li role="separator" class="divider"></li>');
  
  Object.keys(data.data).forEach(function (key) {
    var baselineCheckboxId = "baseline-checkbox-" + key
    $('#baselines').append('<li name="' + key + '" id="' + baselineCheckboxId + '" class="active"><a>'+key+'</a></li>');
    $('#baselines').append('<li role="separator" class="divider"></li>');
    $("[id='"+baselineCheckboxId+"']").children().first().on("click",function() {
                                                       changeActiveStatus($(this).parent());
                                                       if(activatedBaselines().length == 0)
                                                          baselines().addClass('active');
                                                       redraw();
                                                     });
  });
  
  //labels
  $('#labels').append('<li role="separator" class="divider"></li>');
  data.labels.forEach(function (labelName) {
    var labelCheckboxId = "label-checkbox-" + labelName;
    //$('#labels').append('<label name="' + labelName + '" id="' + labelCheckboxId + '" class="btn btn-primary active"> <input type="checkbox" autocomplete="off">' + labelName + ' </label>');
    $('#labels').append('<li name="' + labelName + '" id="' + labelCheckboxId + '" class="active"><a>'+labelName+'</a></li>');
    $('#labels').append('<li role="separator" class="divider"></li>');
    $("[id='"+labelCheckboxId+"']").children().first().on("click",function() {
                                                       changeActiveStatus($(this).parent());
                                                       redraw();
                                                     });
    
    
  });
  
  //metric components
  metricComponents(data).forEach(function(componentName) {
    var sliderDivId=sliderPrefix+componentName;
    $('#reduction-sliders').append('<div id='+sliderDivId+' name='+componentName+' style="width:100%"></div>');
    $('#'+sliderDivId).slider({min : 0, max : 1, step: 0.01, value : 1});
    
    $('#reduction-sliders').append('<label for='+sliderDivId+'>'+componentName+'</label>');
    $('#'+sliderDivId).on('change', function(slideEvt) {
        isASliderUpdated = true;
    });
    
  });
}

/*
 * Helper UI functions
 */

function baselines() {
  return $('#baselines').find("li");
}

function labels() {
  return $('#labels').find("li");
}

function inputDataButtons() {
  return $('#input-buttons').children();
}

function deactivateAllDataButtons() {
  inputDataButtons().each(function(index) {
    $(this).removeClass('active');
  });
}

function clearChart() {
  d3.select('#chart svg').remove();
        
  d3.select('#chart').append("svg")
  .attr("height", 540).attr('xmlns','http://www.w3.org/2000/svg')
}

function redraw() {
  plotProfilesFor(currentInputData, activatedBaselines(), activatedLabels(), componentRatios(), isXScaleLinear());
  isASliderUpdated = false;
}

function activatedBaselines() {
   return activatedElementsOfSelection(baselines());
}

function activatedLabels() {
   return activatedElementsOfSelection(labels());
}

function activatedElementsOfSelection(jQuerySelection) {
   return jQuerySelection.filter(function() {return $(this).hasClass("active");}).map(function() {return $(this).attr("name")});
}

function componentRatios() {
   var ratios = {};
   $("div[id^='" + sliderPrefix +"']").each(function(i){
      var name = $(this).attr('name');
      var value = $(this).attr('value')
      ratios[name] = value;
   }
   );
   return ratios;
}

function isXScaleLinear() {
  return $("#xscale-type-checkbox").is(":checked");
}

  
 /* 
  function currentInputButtonJson() {
    
    //find the active button. If none, get the file from the custom input.
    var activeButtons = inputDataButtons().filter(function() {
      return $(this).hasClass("active");
    });
    
    if (activeButtons.length > 1 ) {
      console.error("More than 1 button is active.")
      return null;
    }
    else if (activeButtons.length == 1 ) {
      var button = activeButtons[0];
      if (button.id == "button-UTT") {
        return inputUnaryTT;
      }
      else
        return null ;
    }
    else
      return null;
  }
  */