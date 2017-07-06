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
function Tree(name, latin_name, age, position) {
    var self = this;
    self.name = name || '';
    self.latin_name = latin_name || '';
    self.age = age || '0';
    self.position = position || [];
}

// ViewModel class
function MainViewModel(mapHandler) {
    var self = this;

    self.mapHandler = mapHandler;
    self.subscriptionPaused = true;
    self.shouldShowSidebar = ko.observable(true);
    self.selectedDistrict = ko.observable();
    self.selectedTreeType = ko.observable();
    self.selectedTreeAge = ko.observable();
    self.districts = ko.observableArray().extend({ rateLimit: 50 });
    self.trees = [];
    self.visibleTrees = ko.observableArray().extend({ rateLimit: 50 });
    self.treeTypes = ko.observableArray().extend({ rateLimit: 50 });
    self.treeAges = ko.observableArray(['<all>', '< 50', '50 - 99', '100 - 149', '150 - 199', '>= 200']);
    self.treeMapTimer = null;

    $(window).on('resize', function() {
        var win = $(window);
        /* If there is enough space (> 600px), we open the sidebar. */
        self.shouldShowSidebar(win.width() > 600);
    });

    self.selectedDistrict.subscribe(function(newValue) {
        console.log("the new district is " + newValue.name);
        self.loadTrees();
    });
    
    self.subscribeTreeType = function() {
        self.subscriptionTreeType = self.selectedTreeType.subscribe(function(newValue) {
            console.log(self.subscriptionPaused);
            if (self.subscriptionPaused)
                return;
            console.log("the new tree type is " + newValue);
            self.loadTrees();
        });
    };
    /*self.selectedTreeType.subscribe(function(newValue) {
        console.log(self.subscriptionPaused);
        if (self.subscriptionPaused)
            return;
        console.log("the new tree type is " + newValue);
        self.loadTrees();
    });*/
    
    self.toggleSidebar = function() {
        self.shouldShowSidebar(!self.shouldShowSidebar());
        // TODO: does not seem to work correctly. Switch to sidebar as overlay.
        self.mapHandler.checkResize();
    }

    self.loadDistricts = function(completeCallback) {
        console.log('loadDistricts');
        $.getJSON("./data/districts.json")
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
    
    self._loadTrees = function() {
        console.log('_loadTrees');
        console.log('' + self.selectedDistrict());
        if (!self.selectedDistrict() || !self.selectedDistrict().filename)
            return;
        console.log('./data/'+self.selectedDistrict().filename);
        $.getJSON('./data/'+self.selectedDistrict().filename)
        .done(function(result) {
            if (self.subscriptionTreeType)
                self.subscriptionTreeType.dispose();
            self.subscriptionPaused = true;
            console.log('loadTrees - data loaded');
            console.log('./data/'+self.selectedDistrict().filename);
            self.selectedDistrict().setCoordinates(result.coordinates);
            self.treeTypes.removeAll();
            for (var i=0; i<result.trees.length; i++) {
                var data = result.trees[i];
                self.trees.push(new District(
                    data.name,
                    data.filename,
                    data.totalTreeCount
                ));
                if (self.treeTypes.indexOf(data.latin_name)<0)
                    self.treeTypes.push(data.latin_name);
            }
            self.treeTypes.sort();
            self.treeTypes.unshift('<all>');

            self.mapHandler.changeDistrict(self.selectedDistrict().coordinates);
            console.log('loadTrees - end');
            self.subscriptionPaused = false;            
            self.subscribeTreeType();
        })
        .fail(function(err) {
            // TODO: show error message to user
            console.log('loadTrees - data cannot be loaded '+err);
        });
    };

    self.timer = null;
    self.loadTrees = function() {
        self._loadTrees();
    };
    
    
    self.loadDistricts(function() {
        /*console.log('self.districts()[0] = ');
        console.log(self.districts()[0]);
        self.selectedDistrict(self.districts()[0]);
        console.log('self.selectedDistrict() = ');
        console.log(self.selectedDistrict());
        self._loadTrees();*/
    });
}


function initMap() {
    var mapHandler = new MapHandler();
    mapHandler.init();

    var mainViewModel = new MainViewModel(mapHandler);
    ko.applyBindings(mainViewModel);

    //myViewModel.setMapHandler(mapHandler);
}
