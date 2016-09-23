# StationKML
Converts station data from .mat file to google-maps KML file.

## To run: ##
* Run WaveToKML in MATLAB
* Open one of the generated station html files in browser of choice

## Notes ##
* Parula colors aren't functionally defined (just a list of values), so fit a simple sine wave to each channel. Here n is 0-255:
    * R: -0.51 * sin(2 * pi * n / 305) + 0.46
    * G:  0.58 * sin(2 * pi * n / 911) + 0.24
    * B:  0.34 * sin(2 * pi * n / 308) + 0.52
* Google abstracts marker from DOM, so not easily hideable by jquery with a slider
    * [See this](https://stackoverflow.com/questions/9594130/how-to-hide-google-maps-api-markers-with-jquery)
    * [Also, jquery range slider](https://jqueryui.com/slider/#range)

