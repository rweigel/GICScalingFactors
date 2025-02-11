// TODO: Put these in a object that stores state.
var colorMax = 255;
var colorMin = 0;
var varMax = 1;
var varMin = -1;

var radiusBase = 30000;
var sliderMin = -5; // Define default global values so hiding function can scale both simultaneously
var sliderMax = varMax;
var QFselected = -1;

var betaToPlot = "betaFactorAverageNorm"
//var betaToPlot = "betaFactorRawNorm"

function initMap() {

  $(initSlider)

  // Create the map.
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 5,
    center: {lat: 40.090, lng: -95.712},
    mapTypeId: 'terrain'
  });

  var infoWindow = new google.maps.InfoWindow();

  google.maps.event.addListenerOnce(map, 'tilesloaded', updateColorBar);

  // Construct the circle for each station
  for (var key in STATIONS) {
    // Add the circle for this city to the map.
    STATIONS[key].circle = setCircle(map, infoWindow, STATIONS[key])
  }
}

function setCircle(map, infoWindow, stationInfo) {
  var location = stationInfo.center
  var color = stationInfo[betaToPlot]

  // TODO: Document reason for adding Math.floor(scaleToColor(color) to radius
  var cityCircle = new google.maps.Circle({
    strokeColor: betaToColor(color,0),
    strokeOpacity: 0.0,
    strokeWeight: 1,
    fillColor: betaToColor(color,0),
    fillOpacity: 0.75,
    map: map,
    center: location,
    radius: radiusBase + Math.floor(scaleToColor(color))
  });

  google.maps.event.addListener(cityCircle,'click', function() {
    infoWindow.close();
    infoWindow.setContent("<div id='infowindow'>Station: "+stationInfo.stationName+"<br/>Latitude: "+location.lat+"<br/>Longitude: "+location.lng+"<br/>log<sub>10</sub>(&beta;)="+stationInfo[betaToPlot]+"<br/>&beta;="+stationInfo[betaToPlot]+"<br/>QF="+stationInfo.QF+"</div>");
    infoWindow.open(map,cityCircle);
    infoWindow.setPosition(location);
  });

  return cityCircle;
}

function initSlider() {
  $( "#slider-range" ).slider(
    {
      range: true,
      min: varMin,
      max: varMax,
      step: (varMax-varMin)/20,
      values: [ varMin, varMax ],
      slide: function( event, ui ) {
        $( "#amount" ).val( "[ " + ui.values[ 0 ] + " , " + ui.values[ 1 ] + " ]" );
        if(ui.values[ 0 ]==varMin) {
          sliderMin=-5;
          sliderMax=ui.values[1];
      } else {
        sliderMin=ui.values[0];
        sliderMax=ui.values[1];
      }
      updateVisibleCircles();
    }
  });

  $( "#amount" ).val( "[ "+$( "#slider-range" ).slider( "values", 0 ) +
    " , " + $( "#slider-range" ).slider( "values", 1 ) +" ]" );
  $("#slider-range").width($("#legendGradient").width());
}

function updateColorBar() {
  var maxIntensity = 1;
  var minIntensity = -1;
  var legendWidth = $('#legendGradient').outerWidth();

  var gradientCss = '(left';
    for (var j = minIntensity; j <= maxIntensity; j+=0.1) {
      gradientCss += ', ' + betaToColor(j,1) + ', ' + betaToColor(j,1) + ', ' + betaToColor(j,1);
    }
    gradientCss += ')';

    $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', 'linear-gradient' + gradientCss);

    for (var i = minIntensity; i <= maxIntensity; ++i) {
      var offset = (i-minIntensity) * legendWidth / (maxIntensity-minIntensity) ;
      if (i > minIntensity && i < maxIntensity) {
        offset -= 0.5;
      } else if (i == maxIntensity) {
        offset -= 1;
      }

      $('#legend').append($('<div>').css({
          'position': 'absolute',
          'left': offset + 'px',
          'top': '5px',
          'width': '1px',
          'height': '3px',
          'background': 'white'
          }));
      $('#legend').append($('<div>').css({
          'position': 'absolute',
          'left': (offset - 5) + 'px',
          'top': '8px',
          'width': '10px',
          'text-align': 'center'
          }).html(i));
    }
}

function updateVisibleCircles(){
  var upper = sliderMax;
  var lower = sliderMin;
  for (var key in STATIONS) {
    var beta = STATIONS[key][betaToPlot]
    if ((beta <= upper) && (beta>=lower) && (QFselected==-1 || (QFselected==0 && STATIONS[key].QF== 0) || (QFselected>0 && STATIONS[key].QF>=QFselected))){
      STATIONS[key].circle.setVisible(true);
    } else {
      STATIONS[key].circle.setVisible(false);
    }
  }
}

// Functions to scale between data range and color/radius range
function betaToColor(n,type) {
  n=scaleToColor(n); //Scale n from [-1,1] to [0,255]

  var R = Math.floor(255*(-0.51*Math.sin(2*3.14*n/305)+0.46));
  var G = Math.floor(255*(0.58*Math.sin(2*3.14*n/911)+0.24));
  var B = Math.floor(255*(0.34*Math.sin(2*3.14*n/308)+0.52));

  if(n<colorMin || n >colorMax) {
    R=G=B=0; //If point value outside range, color it white
  }

  if (n<scaleToColor(-3.9)) {
    R=G=B=255; //If beta=0
  }

  if(R>colorMax){R=colorMax;}
  if(G>colorMax){G=colorMax;}
  if(B>colorMax){B=colorMax;}
  if(R<colorMin){R=colorMin;}
  if(G<colorMin){G=colorMin;}
  if(B<colorMin){B=colorMin;}

  if(type==0) {
  return "#" + hex(R) + hex(G) + hex(B);
  } else {
  return "rgb("+R+","+G+","+B+")";
  }
}

function scaleToColor(n) {
  return (colorMax-colorMin)*(n-varMin)/(varMax-varMin)+colorMin;
}

function scaleToVar(n) {
  return (varMax-varMin)*(n-colorMin)/(colorMax-colorMin)+varMin;
}

function hex(x) {
  return ("0" + parseInt(x).toString(16)).slice(-2);
}

