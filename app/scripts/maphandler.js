function MapHandler() {
    var self = this;

    self.map = null;
    self.currentDistrictPolygon = null;
    self.markers = [];
    
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
    
    self.init = function() {
        self.map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 50.703556, lng: 7.0459461},
          zoom: 13,
          styles: styles,
          mapTypeControl: true,
          mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_RIGHT
          }
        });
    };
    
    // Adds a marker to the map and push to the array.
    function addMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
        self.markers.push(marker);
    }    

    self.changeDistrict = function(coordsDistrict, trees) {
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
        self.map.fitBounds(self.getBoundsFromPolygon(self.currentDistrictPolygon));
                
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
    }

}
