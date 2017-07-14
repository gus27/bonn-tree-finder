# Bonn Tree Finder

_A Udacity FEND Project (Neighborhood Map)_

In the city of Bonn (the former german capital) you find a lot of trees. This app helps you to identify what kind of trees surround you in your neighborhood.

## Installation

You can view it [live here](https://gus27.github.io/bonn-treefinder/index.html).

If you want to download or clone the repository you can either 
* place the contents of the `dist` directory in a web server of your choice and open http://my.web.srv/dist/index.html in your browser
* or build the project by starting `npm install`, `bower install` and launch an internal web server with `gulp serve`. See here for how to install [npm](https://www.npmjs.com/get-npm) and [bower](https://www.npmjs.com/package/bower). 

## Usage
* Select your favoured district.
* At first the markers in the map are clustered so you can see where a lot of trees are growing. Zoom into the map to view the locations of single trees. 
* The marker for single trees differ in color. The color changes with the age of the tree from light green (young) to dark green (old). 
* At the head of the marker the age of the tree is displayed.
* Now filter the trees. You can filter by **type**, **age** or **street name**. After changing any of the three, list entries and markers are immediately updated.
* Select a list entry to locate the corresponding tree in the map and open a window with further Wikipedia information.
* Click any marker to display Wikipedia information about the tree.

## Dependencies

* The app is built with the help of [yeoman's](http://yeoman.io/) [generator-webapp](https://github.com/yeoman/generator-webapp) and uses [npm](https://www.npmjs.com/get-npm), [bower](https://www.npmjs.com/package/bower) and [gulp](http://gulpjs.com/).
* [Bootstrap](https://getbootstrap.com/) is used for styling.
* The JavaScript framework is provided by [Knockout](http://knockoutjs.com/).
* [LokiJS](http://lokijs.org/#/) helps to filter and sort the tree data.
* Marker clustering is done by Google's [MarkerClusterer](https://github.com/googlemaps/js-marker-clusterer).


## Challenges

* The first challenge was the size of the tree data JSON file which is [around 27 MB](http://stadtplan.bonn.de/geojson?Thema=21367&koordsys=4326) big. This would take too much time when loaded by an AJAX request. So I wrote a python script to split the data: one JSON file per district. The districts polygons can be found [here](http://stadtplan.bonn.de/geojson?Thema=21247&koordsys=4326). I used [shapely.geometry](https://pypi.python.org/pypi/Shapely) to determine which tree belongs to which district. Python's [rtree module](https://pypi.python.org/pypi/Rtree/) speeds up the process.
* Rendering the markers for more than 64,000 trees was the next problem because it slows down the browser. I decided to force the user to choose a district so that max. 4,500 markers have to be rendered. But even this amount of markers takes much time during the map generation. Thanks to Google's [MarkerClusterer](https://github.com/googlemaps/js-marker-clusterer) the markers can be clustered. With the smaller numbers of clusters the map will render fast.
* Inserting DOM elements for around 4,500 list elements is another ambitious task for a browser. To circumvent this I implemented a lazy list component (inspired by [adrienne](http://jsfiddle.net/adrienne/Y2WUN/)). This displays 20 entries at first. Only when scrolling to the last element the next 20 elements are displayed.


## Known shortcoming
Unfortunately the source file for the trees contains no english names - only the latin/scientific and a german name for the tree type are provided. To keep this app as international as possible the latin names are used and the english Wikipedia entries will be displayed.

## Credits
All trees the city of Bonn owns are provided by the open data portal [Offene Daten:Bonn](https://opendata.bonn.de/).
The informations for a tree are retrieved from [Wikipedia](http://en.wikipedia.org).