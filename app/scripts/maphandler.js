// Credits: markers functions see https://developers.google.com/maps/documentation/javascript/examples/marker-remove?hl=de
// update markercluster after removing markers from array: https://stackoverflow.com/a/24383013/4571082

function MapHandler() {
    var self = this;

    self.map = null;
    self.markerClusterer = null;
    self.currentDistrictPolygon = null;
    self.currentDistrictBounds = null;
    self.markers = {};
    self.visibleMarkers = [];
    // Cache for already created icons
    self.markerIconCache = {};

    // Create a styles array to use with the map.
    // Make the green areas look light-brown to avoid
    // distractions from our green tree markers
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

    // Adds a marker to the map and push to the array.
    self.addMarker = function (params) {
        var marker = new google.maps.Marker(params);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            self.populateInfoWindow(this, largeInfowindow);
        });
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', (function(icon) {
            return function() {
                this.setIcon(icon);
            };
        })(params.highlightedIcon));
        marker.addListener('mouseout', (function(icon) {
            return function() {
                this.setIcon(icon);
            };
        })(params.icon));

        //self.markers.push(marker);
        self.markers[params.index] = marker;
    };

    // Adds all marker by push to the array.
    self.addMarkers = function (trees) {
        // ageColors contains 5 different colors for the map markers:
        // from light green (young trees) to dark green (old trees).
        var ageColors = ['7CFC33', '63CA29', '54AC22', '47921D', '397517'];

        // The following group uses the location array to create an array of markers on initialize.
        for (var i=0; i<trees.length; i++) {
            var tree = trees[i];

            // ageIdx is an index to the ageColors array. The older the tree,
            // the bigger the value (and the darker the green)
            var ageIdx = Math.min(Math.floor(tree.age / 50), ageColors.length-1);

            // This will be the default tree marker icon.
            var defaultIcon = self.makeMarkerIcon(ageColors[ageIdx], tree.age);
            // This is a "highlighted location" marker for when the user
            // mouses over the marker.
            var highlightedIcon = self.makeMarkerIcon('FFFF24', tree.age);

            var title = tree.name + ' (' + tree.age + ')\n' + tree.facility;

            self.addMarker({
                index: tree.index,
                position: tree.position,
                title: title,
                //animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                highlightedIcon: highlightedIcon,
                optimized: false
            });
        }
    }

    self.changeDistrict = function(coordsDistrict, trees) {
        self.deleteMarkers();

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
        self.currentDistrictBounds = self.getBoundsFromPolygon(self.currentDistrictPolygon);
        self.map.fitBounds(self.currentDistrictBounds);

        self.addMarkers(trees);
    };

    self.checkResize = function() {
        google.maps.event.trigger(self.map, 'resize');
    };

    self.getBoundsFromPolygon = function(polygon) {
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

    // This function creates a new marker icon with a color of markerColor and a label
    // containing the text parameter string.
    // The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    self.makeMarkerIcon = function(markerColor, text) {
        text = text || '%E2%80%A2';

        // Cache already existing icons
        var prop = markerColor + text;
        if (self.markerIconCache.hasOwnProperty(prop)) {
            return self.markerIconCache[prop];
        }

        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|24|_|'+text,
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34)
        );
        self.markerIconCache[prop] = markerImage;
        return markerImage;
    };

    // Sets the map on all markers in the tree.
    self.setMapForAllMarkers = function(map) {
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
    
    // Switches map on for markers in the tree array.
    self.setMapOnForMarkers = function(trees) {
        self.visibleMarkers = [];
        self.mapBounds = new google.maps.LatLngBounds();
        for (var i = 0; i < trees.length; i++) {
            self.markers[trees[i].index].setMap(self.map);
            self.visibleMarkers.push(self.markers[trees[i].index]);
            self.mapBounds.extend(trees[i].position);
        }
    };
    
    self.showMarkerCluster = function() {
        if (self.visibleMarkers.length>=100)
            self.markerClusterer.addMarkers(self.visibleMarkers);
    };

    // Removes the markers from the map, but keeps them in the array.
    self.clearMarkers = function() {
        self.setMapForAllMarkers(null);
        self.markerClusterer.clearMarkers();
    };

    // Shows all markers.
    self.showAllMarkers = function() {
        console.log('showAllMarkers');
        self.setMapForAllMarkers(self.map);
        self.showMarkerCluster();
        //self.map.fitBounds(self.mapBounds);
    };

    // Shows markers in the trees array.
    self.showMarkers = function(trees) {
        console.log('showMarkers '+trees.length);
        self.clearMarkers();
        self.setMapOnForMarkers(trees);
        self.showMarkerCluster();
        //self.map.fitBounds(self.mapBounds);        
    };

    // Deletes all markers in the array by removing references to them.
    self.deleteMarkers = function() {
        self.clearMarkers();
        self.markers = {};
        // reset the cache for the marker icons
        self.markerIconCache = {};
    };


}
