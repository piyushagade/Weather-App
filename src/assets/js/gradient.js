var current_weather = $('#current-weather').text();
current_weather = current_weather.toLowerCase();


if(current_weather === 'partly cloudy'){
  var colors = new Array(
    [117, 174, 244],
    [21,114,148],
    [81, 112, 123],
    [186, 220, 220]
  );
}

else{
  var colors = new Array(
    [255,196,0],
    [255,224,130],
    [255,111,0],
    [255,248,225]
    );
}

var step = 0;
//color table indices for: 
// current color left
// next color left
// current color right
// next color right
var colorIndices = [0,1,2,3];

//transition speed
var gradientSpeed = 0.002;

function updateGradient()
{

  colors = updateColors();

  
  if ( $ === undefined ) return;
  
var c0_0 = colors[colorIndices[0]];
var c0_1 = colors[colorIndices[1]];
var c1_0 = colors[colorIndices[2]];
var c1_1 = colors[colorIndices[3]];

var istep = 1 - step;
var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
var color1 = "rgb("+r1+","+g1+","+b1+")";

var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
var color2 = "rgb("+r2+","+g2+","+b2+")";

 $('#gradient').css({
   background: "-webkit-gradient(linear, left top, right top, from("+color1+"), to("+color2+"))"}).css({
    background: "-moz-linear-gradient(left, "+color1+" 0%, "+color2+" 100%)"});
  
  step += gradientSpeed;
  if (step >= 1)
  {
    step %= 1;
    colorIndices[0] = colorIndices[1];
    colorIndices[2] = colorIndices[3];
    
    //pick two new target color indices
    //do not pick the same as the current one
    colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
    
  }
}

setInterval(updateGradient, 60); //change number to increase/decrease speed

function updateColors(){
  var current_weather = $('#current-weather').text().trim();
  current_weather = current_weather.toLowerCase();

  if(current_weather === 'partly-cloudy-day' ){
    var colors = new Array(
      [117, 174, 244],
      [21,114,148],
      [81, 112, 123],
      [186, 220, 220]
    );
  }
  else if(current_weather === 'partly-cloudy-night' || current_weather === 'clear-night' ){
    var colors = new Array(
      [31, 41, 64],
      [21, 42, 90],
      [2, 11, 32],
      [20, 27, 34]
    );
  }
  else if(current_weather === 'rain' ){
    var colors = new Array(
      [0, 105, 128],
      [77, 100, 118],
      [49, 152, 232],
      [5, 31, 36]
    );
  }
  else if(current_weather === 'snow' || current_weather === 'sleet' || current_weather === 'fog' || current_weather === 'cloudy'){
    var colors = new Array(
      [31, 41, 64],
      [21, 42, 90],
      [2, 11, 32],
      [20, 27, 34]
    );
  }
  else{
    var colors = new Array(
      [255,196,0],
      [169,135,34],
      [255,111,0],
      [224, 197, 48]
      );
  }

  return colors;
}