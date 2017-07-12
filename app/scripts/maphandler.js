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
    self.largeInfowindow = new google.maps.InfoWindow({width:500,maxWidth:500});

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
    self.addMarker_ = function (params) {
        var marker = new google.maps.Marker(params);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function(event) {
            console.log('marker click', this, event);
            console.log('http://maps.google.com/maps?q=loc:'+this.position.lat()+','+this.position.lng());
            var article = new WikipediaPage();
            article.load(this.latin_name, function(page, successFlag, errorMessage) {
                if (successFlag) {
                    self.populateInfoWindow(marker, self.largeInfowindow, page);
                } else {
                    self.populateInfoWindow(marker, self.largeInfowindow, errorMessage);
                }
            });
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
    self.addMarkers_ = function (trees) {
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
            var defaultIcon = self.makeMarkerIcon_(ageColors[ageIdx], tree.age);
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

    // Animate marker for tree for 3 seconds
    self.animateMarker = function (tree) {
        var marker = self.markers[tree.index];
        google.maps.event.trigger(map, "resize");
        self.map.setZoom(18);
        self.map.panTo(marker.getPosition());

        // It takes the map a moment to zoom in and pan, so
        // the animation is started after a short delay:
        setTimeout(function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 3000);
        }, 500);
    };

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

    self.checkResize = function() {
        google.maps.event.trigger(self.map, 'resize');
    };

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

    // This function creates a new marker icon with a color of markerColor and a label
    // containing the text parameter string.
    // The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    self.makeMarkerIcon_ = function(markerColor, text) {
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

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    self.populateInfoWindow = function (marker, infowindow, data) {
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
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    };

    // Sets the map on all markers in the tree.
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

    // Switches map on for markers in the trees array.
    self.setMapOnForMarkers_ = function(trees) {
        self.visibleMarkers = [];
        self.mapBounds = new google.maps.LatLngBounds();
        for (var i = 0; i < trees.length; i++) {
            self.markers[trees[i].index].setMap(self.map);
            self.visibleMarkers.push(self.markers[trees[i].index]);
            self.mapBounds.extend(trees[i].position);
        }
    };

    self.showMarkerCluster_ = function() {
        if (self.visibleMarkers.length>=100)
            self.markerClusterer.addMarkers(self.visibleMarkers);
    };

    // Removes the markers from the map, but keeps them in the array.
    self.clearMarkers_ = function() {
        self.setMapForAllMarkers_(null);
        self.markerClusterer.clearMarkers();
    };

    // Shows all markers.
    self.showAllMarkers = function() {
        console.log('showAllMarkers');
        self.setMapForAllMarkers_(self.map);
        self.showMarkerCluster_();
        //self.map.fitBounds(self.mapBounds);
    };

    // Shows markers in the trees array.
    self.showMarkers = function(trees) {
        console.log('showMarkers '+trees.length);
        self.clearMarkers_();
        self.setMapOnForMarkers_(trees);
        self.showMarkerCluster_();
        //self.map.fitBounds(self.mapBounds);
    };

    // Deletes all markers in the array by removing references to them.
    self.deleteMarkers_ = function() {
        self.clearMarkers_();
        self.markers = {};
        // reset the cache for the marker icons
        self.markerIconCache = {};
    };


}
