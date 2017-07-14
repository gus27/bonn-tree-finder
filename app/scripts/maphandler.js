/**
 * @name Utility class for handling a Google Map
 * @version version 1.0
 * @author Guido Schoepp
 * @fileoverview
 * Provides functions for initializing, showing markers
 * (including clustering) and info windows.
 * Credits:
 * - for markers functions see https://developers.google.com/maps/documentation/javascript/examples/marker-remove?hl=de
 * - updating markercluster after removing markers from array see https://stackoverflow.com/a/24383013/4571082
 */

/**
 * @description Creates the MapHandler interface class
 * @constructor
 */
function MapHandler() {
    var self = this;

    self.map = null;
    self.markerClusterer = null;
    self.currentDistrictPolygon = null;
    self.currentDistrictBounds = null;
    /**
     * @description Contains all markers for a district. The
     * key of the object is a numeric index, the value is the marker.
     *
     * @type {object}
     * @private
     */
    self.markers = {};
    /**
     * @description Contains only the visible (filtered) markers.
     *
     * @type {array}
     * @private
     */
    self.visibleMarkers = [];
    /**
     * @description Cache for already created icons
     *
     * @type {object}
     * @private
     */
    self.markerIconCache = {};
    self.largeInfowindow = new google.maps.InfoWindow({maxWidth:400});
    /**
     * @description ageColors contains 5 different colors for the map markers:
     *      from light green (young trees) to dark green (old trees).
     *
     * @type {array}
     * @private
     */
    self.ageColors = ['7CFC33', '63CA29', '54AC22', '47921D', '397517'];

    /**
     * @description Create a styles array to use with the map.
     * Make the green areas look light-brown to reduce
     * distractions from our green tree markers.
     *
     * @type {array}
     * @private
     */
    var styles = [
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                { visibility: 'on' },
                { color: '#f0e4d3' }
            ]
        }
    ];

    /**
     * @description Initialize the map
     *
     * @param {string} elementId - the id of the html element for the map
     */
    self.init = function (elementId) {
        self.map = new google.maps.Map(document.getElementById(elementId), {
          center: {lat: 50.703556, lng: 7.0459461},
          zoom: 13,
          styles: styles,
          mapTypeControl: true,
          mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_RIGHT
          }
        });
        self.markerClusterer = new MarkerClusterer(
            self.map,
            [],
            {
                imagePath: './images/m',
                gridSize: 30,
                maxZoom: 17
            }
        );
    };

    /**
     * @description Adds a marker to the map and push to the array.
     *
     * @param {object} params - Beside the parameters for the google.maps.Marker class
     *      it supports the following options:
     *      'highlightedIcon': the name of the highlight icon
     *      'index': the unique index of the marker (will be the key for the markers array)
     * @private
     */
    self.addMarker_ = function (params) {
        var marker = new google.maps.Marker(params);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function(event) {
            self.showInfoWindowForMarker_(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1200);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', (function(icon) {
            return function() {
                marker.setIcon(icon);
            };
        })(params.highlightedIcon));
        marker.addListener('mouseout', (function(icon) {
            return function() {
                marker.setIcon(icon);
            };
        })(params.icon));

        self.markers[params.index] = marker;
    };

    /**
     * @description Adds all markers with the required options.
     *      Calculates 5 different colors for the markers icon
     *      depending on the age of the corresponding tree.
     *
     * @param {array} trees - An array of Tree objects
     * @private
     */
    self.addMarkers_ = function (trees) {
        // The following group uses the location array to create an array of markers on initialize.
        for (var i=0; i<trees.length; i++) {
            var tree = trees[i];

            // ageIdx is an index to the ageColors array. The older the tree,
            // the bigger the value (and the darker the green)
            var ageIdx = Math.min(Math.floor(tree.age / 50), self.ageColors.length-1);

            // This will be the default tree marker icon.
            var defaultIcon = self.makeMarkerIcon_(self.ageColors[ageIdx], tree.age);
            // This is a "highlighted location" marker for when the user
            // mouses over the marker.
            var highlightedIcon = self.makeMarkerIcon_('FFFF24', tree.age);

            var title = tree.name + ' (' + tree.age + ')\n' + tree.facility;

            self.addMarker_({
                index: tree.index,
                latin_name: tree.latin_name,
                position: tree.position,
                title: title,
                //animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                highlightedIcon: highlightedIcon,
                optimized: false
            });
        }
    };

    /**
     * @description Animates the marker, pans the map to center the marker and opens the InfoWindow
     *
     * @param {object} tree - The Tree object, for which the corresponding marker and InfoWindow should be shown.
     */
    self.signalMarkerWithInfoWindow = function (tree) {
        self.largeInfowindow.close();

        var marker = self.markers[tree.index];
        self.checkResize();
        self.map.setZoom(18);
        self.map.panTo(marker.getPosition());

        // It takes the map a moment to zoom in and pan, so
        // the animation is started after a short delay:
        setTimeout(function() {
            self.showInfoWindowForMarker_(marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 3000);
        }, 500);
    };

    /**
     * @description Sets a new polygon and trees (when the district was changed)
     *
     * @param {array} coordsDistrict - The array with LatLng coordinates of the districts polygon.
     * @param {array} trees - An array of Tree objects
     */
    self.changeDistrict = function(coordsDistrict, trees) {
        self.deleteMarkers_();

        if (self.currentDistrictPolygon)
            self.currentDistrictPolygon.setMap(null);
        self.currentDistrictPolygon = new google.maps.Polygon({
            paths: coordsDistrict,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FFFF00',
            fillOpacity: 0.1
        });
        self.currentDistrictPolygon.setMap(self.map);
        self.currentDistrictBounds = self.getBoundsFromPolygon_(self.currentDistrictPolygon);
        self.map.fitBounds(self.currentDistrictBounds);

        self.addMarkers_(trees);
    };

    /**
     * @description Triggers a resize request to the map.
     */
    self.checkResize = function() {
        google.maps.event.trigger(self.map, 'resize');
    };

    /**
     * @description Calculates the bounds of a polygon
     *
     * @param {object} polygon - A google.maps.Polygon with the coordinates of a polygon.
     * @returns {object} the bounds of the polygon as LatLngBounds object
     * @private
     */
    self.getBoundsFromPolygon_ = function(polygon) {
        var bounds = new google.maps.LatLngBounds();
        var paths = polygon.getPaths();
        for (var i = 0; i < paths.getLength(); i++) {
            var path = paths.getAt(i);
            for (var j = 0; j < path.getLength(); j++) {
                bounds.extend(path.getAt(j));
            }
        }
        return bounds;
    };

    /**
     * @description Creates a new marker icon with a specified color and label
     *
     * @param {string} markerColor - color of the marker.
     * @param {string} text - label which appears inside the top of the marker
     * @returns {object} an instance of google.maps.MarkerImage class
     * @private
     */
    self.makeMarkerIcon_ = function(markerColor, text) {
        text = text || '%E2%80%A2';

        // If icon is already in the cache return it directly
        var prop = markerColor + text;
        if (self.markerIconCache.hasOwnProperty(prop)) {
            return self.markerIconCache[prop];
        }

        var markerImage = new google.maps.MarkerImage(
            'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|24|_|'+text,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34)
        );
        // Add icon to the cache
        self.markerIconCache[prop] = markerImage;
        return markerImage;
    };

    /**
     * @description Populates the infowindow when the marker is clicked. Only
     * one infowindow will open at the marker that is clicked.
     *
     * @param {object} marker - a marker object.
     * @param {object} text - an InfoWindow instance.
     * @param {object/string} data - should be a WikipediaPage object or a string
     *      containing the content that should be displayed in the InfoWindow.
     * @private
     */
    self.populateInfoWindow_ = function (marker, infowindow, data) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;

            if (typeof data === 'object') {
                var page = data;
                var image = '<img src="%%PAGEIMGURL%%" style="float:right;margin-left:10px;">';
                var content = '<div>%%IMG%% %%PAGEEXTRACT%%</div><div>Source: <a href="%%PAGEURL%%" target="_blank">Wikipedia</a></div>';
                content = content.replace('%%IMG%%', page.pageImageUrl ? image.replace('%%PAGEIMGURL%%', page.pageImageUrl) : '');
                content = content.replace('%%PAGEEXTRACT%%', page.pageExtract);
                content = content.replace('%%PAGEURL%%', page.pageUrl);
            } else {
                content = '<div>'+data+'</div>';
            }

            infowindow.setContent(content);
            infowindow.open(self.map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    /**
     * @description Loads the Wikipedia information and afterwards shows the InfoWindow with the Wikipedia information or an error message.
     *
     * @param {object} marker - a marker object.
     * @private
     */
    self.showInfoWindowForMarker_ = function (marker) {
        var article = new WikipediaPage();
        article.load(marker.latin_name, function(page, successFlag, errorMessage) {
            if (successFlag) {
                self.populateInfoWindow_(marker, self.largeInfowindow, page);
            } else {
                console.log('showInfoWindowForMarker_', page, successFlag, errorMessage);
                self.populateInfoWindow_(marker, self.largeInfowindow, errorMessage);
            }
        });
    };

    /**
     * @description Sets the map property for all markers.
     *
     * @param {object} map - a map object or null.
     * @private
     */
    self.setMapForAllMarkers_ = function(map) {
        for (var property in self.markers) {
            if (self.markers.hasOwnProperty(property)) {
                self.markers[property].setMap(map);
            }
        }
        if (map)
            self.visibleMarkers = Object.keys(self.markers).map(function(e) {
                return self.markers[e];
            });
        else
            self.visibleMarkers = [];
        self.mapBounds = self.districtBounds;
    }

    /**
     * @description Switches map on for markers in the trees array.
     *
     * @param {array} trees - an array of Tree objects.
     * @private
     */
    self.setMapOnForMarkers_ = function(trees) {
        self.visibleMarkers = [];
        self.mapBounds = new google.maps.LatLngBounds();
        for (var i = 0; i < trees.length; i++) {
            self.markers[trees[i].index].setMap(self.map);
            self.visibleMarkers.push(self.markers[trees[i].index]);
            self.mapBounds.extend(trees[i].position);
        }
    };

    /**
     * @description Shows the marker clusters if there are more than 100 markers to show.
     *
     * @private
     */
    self.showMarkerCluster_ = function() {
        if (self.visibleMarkers.length>=100)
            self.markerClusterer.addMarkers(self.visibleMarkers);
    };

    /**
     * @description Removes the markers from the map, but keeps them in the array.
     *
     * @private
     */
    self.clearMarkers_ = function() {
        self.setMapForAllMarkers_(null);
        self.markerClusterer.clearMarkers();
    };

    /**
     * @description Shows the markers to the corresponding trees, shows the marker
     *      clusters (if appropriate) and fits the map to the bounds of the
     *      visible markers. If the trees array is empty the bounds are taken
     *      from the district polygon.
     *
     * @param {array} trees - an array of Tree objects or null.
     * @private
     */
    self.showMarkers_ = function(trees) {
        if (trees) {
            self.clearMarkers_();
            self.setMapOnForMarkers_(trees);
        } else {
            self.setMapForAllMarkers_(self.map);
        }
        self.showMarkerCluster_();
        if (trees !== undefined && trees.length > 0) {
            self.map.fitBounds(self.mapBounds);
        } else {
            // If there's no tree, zoom to district boundaries
            self.map.fitBounds(self.currentDistrictBounds);
        }
    };

    /**
     * @description Shows all markers.
     */
    self.showAllMarkers = function() {
        self.showMarkers_();
    };

    /**
     * @description Shows the markers for the corresponding trees of the trees array.
     *
     * @param {array} trees - an array of Tree objects.
     */
    self.showMarkers = function(trees) {
        self.showMarkers_(trees);
    };

    /**
     * @description Deletes all markers in the array by removing references to them
     *      and resets the marker icon cache.
     *
     * @private
     */
    self.deleteMarkers_ = function() {
        self.clearMarkers_();
        self.markers = {};
        // reset the cache for the marker icons
        self.markerIconCache = {};
    };
}
