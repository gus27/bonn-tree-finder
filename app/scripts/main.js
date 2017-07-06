// Model class for a district
function District(name, filename, countTrees, coordinates) {
    var self = this;
    self.name = name || '';
    self.filename = filename || '';
    self.countTrees = countTrees || '0';
    self.coordinates = coordinates || [];
    self.displayText = function() {
        return self.name + ' (' + self.countTrees + ')';
    };
    self.setCoordinates = function(coordinates) {
        self.coordinates = coordinates;
    };
}

// Model class for a tree
function Tree(id, name, latin_name, facility, age, position) {
    var self = this;
    self.id = parseInt(id || '0');
    self.name = name || '';
    self.latin_name = latin_name || '';
    self.age = parseInt(age || '0');
    self.facility = facility || '';
    self.position = position || [];
}

// ViewModel class
function MainViewModel(mapHandler) {
    var self = this;

    self.test = ko.observable(false);
    
    self.mapHandler = mapHandler;
    self.shouldShowSidebar = ko.observable(true);
    self.selectedDistrict = ko.observable();
    self.selectedTreeType = ko.observable();
    self.selectedTreeAge = ko.observable();
    
    self.districts = ko.observableArray().extend({ rateLimit: 50 });
    self.trees = [];
    self.visibleTrees = ko.observableArray().extend({ rateLimit: 50 });
    self.treeTypes = ko.observableArray().extend({ rateLimit: 50 });    
    self.treeAges = ko.observableArray(['< 50', '50 - 99', '100 - 149', '150 - 199', '>= 200']);
    
    // Gets called when either tree age or tree type changed
    ko.computed(function() {
        if (self.treeTypes().length<=0) 
            return;
        var params = { treeAge: self.selectedTreeAge(), treeType: self.selectedTreeType() };
        console.log('computed age n treetype ', params);
        self.test(!self.test());
    }).extend({ deferred: true, rateLimit: 100 });
    
    // Gets called when selected district changed
    ko.computed(function() {
        var district = self.selectedDistrict();
        if (self.loadTrees) {
            self.selectedTreeType(null);
            self.selectedTreeAge(null);
            self.loadTrees(district);
        }
    }).extend({ deferred: true, rateLimit: 100 });

    $(window).on('resize', function() {
        var win = $(window);
        /* If there is enough space (> 600px), we open the sidebar. */
        self.shouldShowSidebar(win.width() > 600);
    });

    self.toggleSidebar = function() {
        self.shouldShowSidebar(!self.shouldShowSidebar());
        // TODO: does not seem to work correctly. Switch to sidebar as overlay.
        self.mapHandler.checkResize();
    }

    self.loadDistricts = function(completeCallback) {
        console.log('loadDistricts');
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
            if (completeCallback) 
                completeCallback();
        })
        .fail(function(err) {
            // TODO: show error message to user
            console.log('loadDistricts - data cannot be loaded '+err);
        });
    };
    
    self.loadTrees = function() {
        console.log('_loadTrees');
        if (!self.selectedDistrict() || !self.selectedDistrict().filename)
            return;
        $.getJSON('./data/'+self.selectedDistrict().filename)
        .done(function(result) {
            console.log('loadTrees - data loaded');
            self.selectedDistrict().setCoordinates(result.coordinates);
            self.treeTypes.removeAll();
            self.trees = [];
            for (var i=0; i<result.trees.length; i++) {
                var data = result.trees[i];
                self.trees.push(new Tree(
                    data.id,
                    data.german_name,
                    data.latin_name,
                    data.facility,
                    data.age,
                    data.coordinates
                ));
                if (self.treeTypes.indexOf(data.latin_name)<0)
                    self.treeTypes.push(data.latin_name);
            }
            self.treeTypes.sort();
            
            self.mapHandler.changeDistrict(self.selectedDistrict().coordinates);
            console.log('loadTrees - end');
        })
        .fail(function(err) {
            // TODO: show error message to user
            console.log('loadTrees - data cannot be loaded '+err);
        });
    };
    
    self.loadDistricts();
}


function initMap() {
    var mapHandler = new MapHandler();
    mapHandler.init();

    //ko.options.deferUpdates = true;
    var mainViewModel = new MainViewModel(mapHandler);
    ko.applyBindings(mainViewModel);

    //myViewModel.setMapHandler(mapHandler);
}
