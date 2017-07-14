/**
 * @name Model and ModelView classes using the Knockout JS framework
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
 * @description Model class for a district. Represents a district with it's name 
 *      and bounding coordinates.
 * @param {string} name - The district's name
 * @param {string} filename - The name of the JSON file containing the trees for this district
 * @param {number} countTrees - The number of trees in this district
 * @param {array=} coordinates - The bounding coordinates of this district as an array of 
 *      lat/lng coordinates, eg. [{"lat": 50.7590564324, "lng": 7.0628029591}, ...]
 * @constructor
 */
function District(name, filename, countTrees, coordinates) {
    var self = this;
    self.name = name || '';
    self.filename = filename || '';
    self.countTrees = countTrees || '0';
    self.coordinates = coordinates || [];
    /**
     * @description Get display text for this district
     *
     * @returns {string} The text to display
     */
    self.displayText = function() {
        return self.name + ' (' + self.countTrees + ')';
    };
    /**
     * @description Set bounding coordinates (polygon)
     *
     * @param {array} coordinates - The bounding coordinates of this district as an array of 
     *      lat/lng coordinates, eg. [{"lat": 50.7590564324, "lng": 7.0628029591}, ...]
     */
    self.setCoordinates = function(coordinates) {
        self.coordinates = coordinates;
    };
}

/**
 * @description Model class for a tree. Represents a tree with it's names 
 *      street, age and position.
 * @param {number} index - The district's name
 * @param {number} id - The district's name
 * @param {string} name - The name to display for the tree, usually the latin_name here
 * @param {string} latin_name - The latin name of the tree
 * @param {string} facility - The name of the location of the tree, usually the street name
 * @param {number} age - The age of the tree
 * @param {object} position - The coordinates of this tree as an object of 
 *      lat/lng values, eg. {"lat": 50.7590564324, "lng": 7.0628029591}
 * @constructor
 */
function Tree(index, id, name, latin_name, facility, age, position) {
    var self = this;
    self.index = parseInt(index || '0');
    self.id = parseInt(id || '0');
    self.name = name || '';
    self.latin_name = latin_name || '';
    self.age = parseInt(age || '0');
    self.facility = facility || '';
    self.position = position || {};
}

/**
 * @description The main view model for this app. A KnockoutJS compliant ViewModel class.
 * @param {object} mapHandler - An instance of the MapHandler class
 * @constructor
 */
function MainViewModel(mapHandler) {
    var self = this;

    /**
     * @description The name to display in the tree type select input and in the tooltip of the marker.
     *      By default this is set to 'latin_name'. Can be changed to 'german_name'.
     *
     * @type {string}
     * @private
     */
    self.nameFieldname = 'latin_name';

    self.mapHandler = mapHandler;
    self.initialized = ko.observable(false);
    /**
     * @description Represents the width of the browser window. 
     *      Used for displaying the sidebar.
     *
     * @type {observable}
     * @private
     */    
    self.windowWidth = ko.observable($(window).width());
    /**
     * @description Represents the user influenced flag for showing the sidebar.
     *
     * @type {observable}
     * @private
     */    
    self.shouldShowSidebar = ko.observable(false);
    self.selectedDistrict = ko.observable();
    self.selectedTreeType = ko.observable();
    self.selectedTreeAge = ko.observable();
    self.inputStreetName = ko.observable();

    self.districts = ko.observableArray(); 
    self.visibleTrees = ko.observableArray();
    self.treeTypes = ko.observableArray(); 
    self.treeAges = ko.observableArray(['< 50', '50 - 99', '100 - 149', '150 - 199', '>= 200']);
    self.visibleTreesFound = ko.computed(function() {
        if (self.visibleTrees().length > 1)
            return self.visibleTrees().length+' trees found';
        if (self.visibleTrees().length == 1)
            return '1 tree found';
        return 'No tree found';
    });

    //self.trees = [];
    self.db = new loki('example.db');
    self.dbTrees = self.db.addCollection('trees');

    $(window).on('resize', function() {
        var win = $(window);
        self.windowWidth(win.width());
    });

    self.toggleSidebar = function() {
        self.shouldShowSidebar(!self.shouldShowSidebar());
        // resize after the css animation is finished
        setTimeout(self.mapHandler.checkResize, 1000);
    };
    
    self.listClicked = function(element, event) {
        self.mapHandler.signalMarkerWithInfoWindow(element);
    };

    self.filterTrees = function(params) {
        var idx, filters, result;
        
        params.treeType = params.treeType || self.selectedTreeType();
        params.treeAge = params.treeAge || self.selectedTreeAge();
        params.streetName = params.streetName || self.inputStreetName();

        filters = [];
        idx = self.treeAges.indexOf(params.treeAge);
        if (idx >= 0) {
            var condition = null;
            switch (idx) {
                case 1:
                    condition = { '$between': [50, 99] };
                    break;
                case 2:
                    condition = { '$between': [100, 149] };
                    break;
                case 3:
                    condition = { '$between': [150, 199] };
                    break;
                case 4:
                    condition = { '$gte': 200 };
                    break;
                default:
                    condition = { '$lt': 50 };
                    break;
            }
            filters.push({'age' : condition});
        }

        if (params.treeType) {
            filters.push({ 'name': { '$eq': params.treeType }});
        }

        if (params.streetName) {
            filters.push({ 'facility': { '$regex': [params.streetName, 'i'] }});
        }
        
        result = self.dbTrees.chain().find({ '$and': filters }).compoundsort(['facility','id']).data();
        self.mapHandler.showMarkers(result);
        self.visibleTrees(result);
    };

    self.loadDistricts = function() {
        $.getJSON('./data/districts.json')
        .done(function(result) {
            self.districts.removeAll();
            for (var i=0; i<result.districts.length; i++) {
                var data = result.districts[i];
                self.districts.push(new District(
                    data.name,
                    data.filename,
                    data.totalTreeCount
                ));
            }
            self.districts.sort(function (left, right) {
                return left.name == right.name ? 0 : (left.name < right.name ? -1 : 1);
            });
        })
        .fail(function(err) {
            // TODO: show error message to user
            console.log('loadDistricts - data cannot be loaded '+err);
        });
    };

    self.loadTrees = function() {
        if (!self.selectedDistrict() || !self.selectedDistrict().filename)
            return;
        $.getJSON('./data/'+self.selectedDistrict().filename)
        .done(function(result) {
            self.selectedDistrict().setCoordinates(result.coordinates);
            self.treeTypes.removeAll();
            self.dbTrees.removeDataOnly();
            for (var i=0; i<result.trees.length; i++) {
                var data = result.trees[i];

                self.dbTrees.insert(new Tree(
                    i,
                    data.id,
                    data[self.nameFieldname],
                    data.latin_name,
                    data.facility,
                    data.age,
                    data.coordinates
                ));
                if (self.treeTypes.indexOf(data[self.nameFieldname])<0)
                    self.treeTypes.push(data[self.nameFieldname]);
            }
            self.treeTypes.sort();

            self.mapHandler.changeDistrict(
                self.selectedDistrict().coordinates,
                self.dbTrees.find()
            );
            self.initialized(true);            
        })
        .fail(function(err) {
            // TODO: show error message to user
            console.log('loadTrees - data cannot be loaded '+err);
        });
    };

    // Gets called when either tree age, tree type or street name changed
    ko.computed(function() {
        if (!self.initialized())
            return;
        self.filterTrees({ 
            treeType: self.selectedTreeType(), 
            treeAge: self.selectedTreeAge(),
            streetName: self.inputStreetName()
        });
    }).extend({ deferred: true, rateLimit: 400, method: "notifyWhenChangesStop" });

    // Gets called when selected district changed
    ko.computed(function() {
        var district = self.selectedDistrict();
        if (self.loadTrees) {
            self.selectedTreeType(null);
            self.selectedTreeAge(null);
            self.inputStreetName(null);
            self.loadTrees(district);
        }
    }).extend({ deferred: true, rateLimit: 100 });    
    
    setTimeout(self.loadDistricts, 300);
}


function initMap() {
    var mapHandler = new MapHandler();
    mapHandler.init('map');

    var mainViewModel = new MainViewModel(mapHandler);
    ko.applyBindings(mainViewModel);
}
