function MarkerClusterer(e,t,r){this.extend(MarkerClusterer,google.maps.OverlayView),this.map_=e,this.markers_=[],this.clusters_=[],this.sizes=[53,56,66,78,90],this.styles_=[],this.ready_=!1;var o=r||{};this.gridSize_=o.gridSize||60,this.minClusterSize_=o.minimumClusterSize||2,this.maxZoom_=o.maxZoom||null,this.styles_=o.styles||[],this.imagePath_=o.imagePath||this.MARKER_CLUSTER_IMAGE_PATH_,this.imageExtension_=o.imageExtension||this.MARKER_CLUSTER_IMAGE_EXTENSION_,this.zoomOnClick_=!0,void 0!=o.zoomOnClick&&(this.zoomOnClick_=o.zoomOnClick),this.averageCenter_=!1,void 0!=o.averageCenter&&(this.averageCenter_=o.averageCenter),this.setupStyles_(),this.setMap(e),this.prevZoom_=this.map_.getZoom();var s=this;google.maps.event.addListener(this.map_,"zoom_changed",function(){var e=s.map_.getZoom();s.prevZoom_!=e&&(s.prevZoom_=e,s.resetViewport())}),google.maps.event.addListener(this.map_,"idle",function(){s.redraw()}),t&&t.length&&this.addMarkers(t,!1)}function Cluster(e){this.markerClusterer_=e,this.map_=e.getMap(),this.gridSize_=e.getGridSize(),this.minClusterSize_=e.getMinClusterSize(),this.averageCenter_=e.isAverageCenter(),this.center_=null,this.markers_=[],this.bounds_=null,this.clusterIcon_=new ClusterIcon(this,e.getStyles(),e.getGridSize())}function ClusterIcon(e,t,r){e.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView),this.styles_=t,this.padding_=r||0,this.cluster_=e,this.center_=null,this.map_=e.getMap(),this.div_=null,this.sums_=null,this.visible_=!1,this.setMap(this.map_)}function WikipediaPage(){var e=this;e.pageUrl=null,e.pageImage=null,e.pageImageUrl=null,e.pageExtract=null,e.queryImage_=function(t,r){var o=WIKIPEDIA_IMG_QUERY_URL_+encodeURIComponent(t);$.getJSON(o).done(function(t){if(t.query.pages)for(var o in t.query.pages){var s=t.query.pages[o];if(s.imageinfo){e.pageImageUrl=s.imageinfo[0].thumburl;break}}r&&r(e,!0,"")}).fail(function(t){r(e,!1,"Data from Wikipedia image query cannot be loaded")})},e.queryInfo_=function(t,r){var o=WIKIPEDIA_QUERY_URL_+encodeURIComponent(t);$.getJSON(o).done(function(t){if(t.query.pages)for(var o in t.query.pages)if(t.query.pages.hasOwnProperty(o)){var s=t.query.pages[o];e.pageImage=s.pageprops.page_image_free,e.pageExtract=s.extract,e.pageImage?e.queryImage_(e.pageImage,r):r&&r(e,!0,"");break}}).fail(function(t){r(e,!1,"Data from Wikipedia query cannot be loaded")})},e.search_=function(t,r){var o=WIKIPEDIA_SEARCH_URL_+encodeURIComponent(t);$.getJSON(o).done(function(o){var s=o[1][0];e.pageUrl=o[3][0],s&&e.pageUrl?e.queryInfo_(s,r):t.indexOf("(")>0||t.indexOf("'")>0?(t=t.replace(/\s*[('].*/,""),e.search_(t,r)):r(e,!1,'Wikipedia page for "'+t+'" not found')}).fail(function(t){r(e,!1,"Data from Wikipedia search cannot be loaded")})},e.load=function(t,r){e.search_(t,r)}}function MapHandler(){var e=this;e.map=null,e.markerClusterer=null,e.currentDistrictPolygon=null,e.currentDistrictBounds=null,e.markers={},e.visibleMarkers=[],e.markerIconCache={},e.largeInfowindow=new google.maps.InfoWindow({maxWidth:400}),e.ageColors=["7CFC33","63CA29","54AC22","47921D","397517"];var t=[{featureType:"poi",elementType:"geometry",stylers:[{visibility:"on"},{color:"#f0e4d3"}]}];e.init=function(r){e.map=new google.maps.Map(document.getElementById(r),{center:{lat:50.703556,lng:7.0459461},zoom:13,styles:t,mapTypeControl:!0,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:google.maps.ControlPosition.TOP_RIGHT}}),e.markerClusterer=new MarkerClusterer(e.map,[],{imagePath:"./images/m",gridSize:30,maxZoom:17})},e.addMarker_=function(t){var r=new google.maps.Marker(t);r.addListener("click",function(t){e.showInfoWindowForMarker_(r)}),r.addListener("mouseover",function(e){return function(){r.setIcon(e)}}(t.highlightedIcon)),r.addListener("mouseout",function(e){return function(){r.setIcon(e)}}(t.icon)),e.markers[t.index]=r},e.addMarkers_=function(t){for(var r=0;r<t.length;r++){var o=t[r],s=Math.min(Math.floor(o.age/50),e.ageColors.length-1),i=e.makeMarkerIcon_(e.ageColors[s],o.age),n=e.makeMarkerIcon_("FFFF24",o.age),a=o.name+" ("+o.age+")\n"+o.facility;e.addMarker_({index:o.index,latin_name:o.latin_name,position:o.position,title:a,icon:i,highlightedIcon:n,optimized:!1})}},e.signalMarkerWithInfoWindow=function(t){e.largeInfowindow.close();var r=e.markers[t.index];e.checkResize(),e.map.setZoom(18),e.map.panTo(r.getPosition()),setTimeout(function(){e.showInfoWindowForMarker_(r),r.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){r.setAnimation(null)},3e3)},500)},e.changeDistrict=function(t,r){e.deleteMarkers_(),e.currentDistrictPolygon&&e.currentDistrictPolygon.setMap(null),e.currentDistrictPolygon=new google.maps.Polygon({paths:t,strokeColor:"#FF0000",strokeOpacity:.8,strokeWeight:2,fillColor:"#FFFF00",fillOpacity:.1}),e.currentDistrictPolygon.setMap(e.map),e.currentDistrictBounds=e.getBoundsFromPolygon_(e.currentDistrictPolygon),e.map.fitBounds(e.currentDistrictBounds),e.addMarkers_(r)},e.checkResize=function(){google.maps.event.trigger(e.map,"resize")},e.getBoundsFromPolygon_=function(e){for(var t=new google.maps.LatLngBounds,r=e.getPaths(),o=0;o<r.getLength();o++)for(var s=r.getAt(o),i=0;i<s.getLength();i++)t.extend(s.getAt(i));return t},e.makeMarkerIcon_=function(t,r){r=r||"%E2%80%A2";var o=t+r;if(e.markerIconCache.hasOwnProperty(o))return e.markerIconCache[o];var s=new google.maps.MarkerImage("http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|"+t+"|24|_|"+r,new google.maps.Size(21,34),new google.maps.Point(0,0),new google.maps.Point(10,34),new google.maps.Size(21,34));return e.markerIconCache[o]=s,s},e.populateInfoWindow_=function(t,r,o){if(r.marker!=t){if(r.marker=t,"object"==typeof o){var s=o,i='<div>%%IMG%% %%PAGEEXTRACT%%</div><div>Source: <a href="%%PAGEURL%%" target="_blank">Wikipedia</a></div>';i=i.replace("%%IMG%%",s.pageImageUrl?'<img src="%%PAGEIMGURL%%" style="float:right;margin-left:10px;">'.replace("%%PAGEIMGURL%%",s.pageImageUrl):""),i=i.replace("%%PAGEEXTRACT%%",s.pageExtract),i=i.replace("%%PAGEURL%%",s.pageUrl)}else i="<div>"+o+"</div>";r.setContent(i),r.open(e.map,t),r.addListener("closeclick",function(){r.marker=null})}},e.showInfoWindowForMarker_=function(t){(new WikipediaPage).load(t.latin_name,function(r,o,s){o?e.populateInfoWindow_(t,e.largeInfowindow,r):e.populateInfoWindow_(t,e.largeInfowindow,s)})},e.setMapForAllMarkers_=function(t){for(var r in e.markers)e.markers.hasOwnProperty(r)&&e.markers[r].setMap(t);e.visibleMarkers=t?Object.keys(e.markers).map(function(t){return e.markers[t]}):[],e.mapBounds=e.districtBounds},e.setMapOnForMarkers_=function(t){e.visibleMarkers=[],e.mapBounds=new google.maps.LatLngBounds;for(var r=0;r<t.length;r++)e.markers[t[r].index].setMap(e.map),e.visibleMarkers.push(e.markers[t[r].index]),e.mapBounds.extend(t[r].position)},e.showMarkerCluster_=function(){e.visibleMarkers.length>=100&&e.markerClusterer.addMarkers(e.visibleMarkers)},e.clearMarkers_=function(){e.setMapForAllMarkers_(null),e.markerClusterer.clearMarkers()},e.showMarkers_=function(t){t?(e.clearMarkers_(),e.setMapOnForMarkers_(t)):e.setMapForAllMarkers_(e.map),e.showMarkerCluster_(),void 0!==t&&t.length>0?e.map.fitBounds(e.mapBounds):e.map.fitBounds(e.currentDistrictBounds)},e.showAllMarkers=function(){e.showMarkers_()},e.showMarkers=function(t){e.showMarkers_(t)},e.deleteMarkers_=function(){e.clearMarkers_(),e.markers={},e.markerIconCache={}}}function District(e,t,r,o){var s=this;s.name=e||"",s.filename=t||"",s.countTrees=r||"0",s.coordinates=o||[],s.displayText=function(){return s.name+" ("+s.countTrees+")"},s.setCoordinates=function(e){s.coordinates=e}}function Tree(e,t,r,o,s,i,n){var a=this;a.index=parseInt(e||"0"),a.id=parseInt(t||"0"),a.name=r||"",a.latin_name=o||"",a.age=parseInt(i||"0"),a.facility=s||"",a.position=n||{}}function MainViewModel(e){var t=this;t.nameFieldname="latin_name",t.mapHandler=e,t.initialized=ko.observable(!1),t.windowWidth=ko.observable($(window).width()),t.showSidebar=ko.observable(!1),t.selectedDistrict=ko.observable(),t.selectedTreeType=ko.observable(),t.selectedTreeAge=ko.observable(),t.inputStreetName=ko.observable(),t.showErrorDialog=ko.observable(!1),t.errorMessage=ko.observable(""),t.districts=ko.observableArray(),t.visibleTrees=ko.observableArray(),t.treeTypes=ko.observableArray(),t.treeAges=ko.observableArray(["< 50","50 - 99","100 - 149","150 - 199",">= 200"]),t.db=new loki("example.db"),t.dbTrees=t.db.addCollection("trees"),t.visibleTreesFound=ko.computed(function(){return t.visibleTrees().length>1?t.visibleTrees().length+" trees found":1==t.visibleTrees().length?"1 tree found":"No tree found"}),$(window).on("resize",function(){var e=$(window);t.windowWidth(e.width())}),t.toggleSidebar=function(){t.showSidebar(!t.showSidebar()),setTimeout(t.mapHandler.checkResize,1e3)},t.listClicked=function(e,r){t.mapHandler.signalMarkerWithInfoWindow(e)},t.filterTrees_=function(e){var r,o,s;if(e.treeType=e.treeType||t.selectedTreeType(),e.treeAge=e.treeAge||t.selectedTreeAge(),e.streetName=e.streetName||t.inputStreetName(),o=[],(r=t.treeAges.indexOf(e.treeAge))>=0){var i=null;switch(r){case 1:i={$between:[50,99]};break;case 2:i={$between:[100,149]};break;case 3:i={$between:[150,199]};break;case 4:i={$gte:200};break;default:i={$lt:50}}o.push({age:i})}e.treeType&&o.push({name:{$eq:e.treeType}}),e.streetName&&o.push({facility:{$regex:[e.streetName,"i"]}}),s=t.dbTrees.chain().find({$and:o}).compoundsort(["facility","id"]).data(),t.mapHandler.showMarkers(s),t.visibleTrees(s)},t.loadDistricts_=function(e){$.getJSON(e).done(function(e){t.districts.removeAll();for(var r=0;r<e.districts.length;r++){var o=e.districts[r];t.districts.push(new District(o.name,o.filename,o.totalTreeCount))}t.districts.sort(function(e,t){return e.name==t.name?0:e.name<t.name?-1:1})}).fail(function(e){t.showError("Data cannot be loaded ("+e.responseText+"). Please try again later.")})},t.loadTrees_=function(){t.selectedDistrict()&&t.selectedDistrict().filename&&$.getJSON("./data/"+t.selectedDistrict().filename).done(function(e){t.selectedDistrict().setCoordinates(e.coordinates),t.treeTypes.removeAll(),t.dbTrees.removeDataOnly();for(var r=0;r<e.trees.length;r++){var o=e.trees[r];t.dbTrees.insert(new Tree(r,o.id,o[t.nameFieldname],o.latin_name,o.facility,o.age,o.coordinates)),t.treeTypes.indexOf(o[t.nameFieldname])<0&&t.treeTypes.push(o[t.nameFieldname])}t.treeTypes.sort(),t.mapHandler.changeDistrict(t.selectedDistrict().coordinates,t.dbTrees.find()),t.initialized(!0)}).fail(function(e){t.showError("Data cannot be loaded ("+e.responseText+"). Please try again later.")})},t.showError=function(e){t.errorMessage(e),t.showErrorDialog(!0)},ko.computed(function(){t.initialized()&&t.filterTrees_({treeType:t.selectedTreeType(),treeAge:t.selectedTreeAge(),streetName:t.inputStreetName()})}).extend({deferred:!0,rateLimit:400,method:"notifyWhenChangesStop"}),ko.computed(function(){var e=t.selectedDistrict();t.loadTrees_&&(t.selectedTreeType(null),t.selectedTreeAge(null),t.inputStreetName(null),t.loadTrees_(e))}).extend({deferred:!0,rateLimit:100}),setTimeout(function(){t.loadDistricts_("./data/districts.json")},300)}function initMap(){var e=new MapHandler;e.init("map");var t=new MainViewModel(e);ko.applyBindings(t)}MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_="../images/m",MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_="png",MarkerClusterer.prototype.extend=function(e,t){return function(e){for(var t in e.prototype)this.prototype[t]=e.prototype[t];return this}.apply(e,[t])},MarkerClusterer.prototype.onAdd=function(){this.setReady_(!0)},MarkerClusterer.prototype.draw=function(){},MarkerClusterer.prototype.setupStyles_=function(){if(!this.styles_.length)for(var e,t=0;e=this.sizes[t];t++)this.styles_.push({url:this.imagePath_+(t+1)+"."+this.imageExtension_,height:e,width:e})},MarkerClusterer.prototype.fitMapToMarkers=function(){for(var e,t=this.getMarkers(),r=new google.maps.LatLngBounds,o=0;e=t[o];o++)r.extend(e.getPosition());this.map_.fitBounds(r)},MarkerClusterer.prototype.setStyles=function(e){this.styles_=e},MarkerClusterer.prototype.getStyles=function(){return this.styles_},MarkerClusterer.prototype.isZoomOnClick=function(){return this.zoomOnClick_},MarkerClusterer.prototype.isAverageCenter=function(){return this.averageCenter_},MarkerClusterer.prototype.getMarkers=function(){return this.markers_},MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length},MarkerClusterer.prototype.setMaxZoom=function(e){this.maxZoom_=e},MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_},MarkerClusterer.prototype.calculator_=function(e,t){for(var r=0,o=e.length,s=o;0!==s;)s=parseInt(s/10,10),r++;return r=Math.min(r,t),{text:o,index:r}},MarkerClusterer.prototype.setCalculator=function(e){this.calculator_=e},MarkerClusterer.prototype.getCalculator=function(){return this.calculator_},MarkerClusterer.prototype.addMarkers=function(e,t){for(var r,o=0;r=e[o];o++)this.pushMarkerTo_(r);t||this.redraw()},MarkerClusterer.prototype.pushMarkerTo_=function(e){if(e.isAdded=!1,e.draggable){var t=this;google.maps.event.addListener(e,"dragend",function(){e.isAdded=!1,t.repaint()})}this.markers_.push(e)},MarkerClusterer.prototype.addMarker=function(e,t){this.pushMarkerTo_(e),t||this.redraw()},MarkerClusterer.prototype.removeMarker_=function(e){var t=-1;if(this.markers_.indexOf)t=this.markers_.indexOf(e);else for(var r,o=0;r=this.markers_[o];o++)if(r==e){t=o;break}return-1!=t&&(e.setMap(null),this.markers_.splice(t,1),!0)},MarkerClusterer.prototype.removeMarker=function(e,t){var r=this.removeMarker_(e);return!(t||!r)&&(this.resetViewport(),this.redraw(),!0)},MarkerClusterer.prototype.removeMarkers=function(e,t){for(var r,o=!1,s=0;r=e[s];s++){var i=this.removeMarker_(r);o=o||i}if(!t&&o)return this.resetViewport(),this.redraw(),!0},MarkerClusterer.prototype.setReady_=function(e){this.ready_||(this.ready_=e,this.createClusters_())},MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length},MarkerClusterer.prototype.getMap=function(){return this.map_},MarkerClusterer.prototype.setMap=function(e){this.map_=e},MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_},MarkerClusterer.prototype.setGridSize=function(e){this.gridSize_=e},MarkerClusterer.prototype.getMinClusterSize=function(){return this.minClusterSize_},MarkerClusterer.prototype.setMinClusterSize=function(e){this.minClusterSize_=e},MarkerClusterer.prototype.getExtendedBounds=function(e){var t=this.getProjection(),r=new google.maps.LatLng(e.getNorthEast().lat(),e.getNorthEast().lng()),o=new google.maps.LatLng(e.getSouthWest().lat(),e.getSouthWest().lng()),s=t.fromLatLngToDivPixel(r);s.x+=this.gridSize_,s.y-=this.gridSize_;var i=t.fromLatLngToDivPixel(o);i.x-=this.gridSize_,i.y+=this.gridSize_;var n=t.fromDivPixelToLatLng(s),a=t.fromDivPixelToLatLng(i);return e.extend(n),e.extend(a),e},MarkerClusterer.prototype.isMarkerInBounds_=function(e,t){return t.contains(e.getPosition())},MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport(!0),this.markers_=[]},MarkerClusterer.prototype.resetViewport=function(e){for(var t,r=0;t=this.clusters_[r];r++)t.remove();for(var o,r=0;o=this.markers_[r];r++)o.isAdded=!1,e&&o.setMap(null);this.clusters_=[]},MarkerClusterer.prototype.repaint=function(){var e=this.clusters_.slice();this.clusters_.length=0,this.resetViewport(),this.redraw(),window.setTimeout(function(){for(var t,r=0;t=e[r];r++)t.remove()},0)},MarkerClusterer.prototype.redraw=function(){this.createClusters_()},MarkerClusterer.prototype.distanceBetweenPoints_=function(e,t){if(!e||!t)return 0;var r=(t.lat()-e.lat())*Math.PI/180,o=(t.lng()-e.lng())*Math.PI/180,s=Math.sin(r/2)*Math.sin(r/2)+Math.cos(e.lat()*Math.PI/180)*Math.cos(t.lat()*Math.PI/180)*Math.sin(o/2)*Math.sin(o/2);return 2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))*6371},MarkerClusterer.prototype.addToClosestCluster_=function(e){for(var t,r=4e4,o=null,s=(e.getPosition(),0);t=this.clusters_[s];s++){var i=t.getCenter();if(i){var n=this.distanceBetweenPoints_(i,e.getPosition());n<r&&(r=n,o=t)}}if(o&&o.isMarkerInClusterBounds(e))o.addMarker(e);else{var t=new Cluster(this);t.addMarker(e),this.clusters_.push(t)}},MarkerClusterer.prototype.createClusters_=function(){if(this.ready_)for(var e,t=new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),this.map_.getBounds().getNorthEast()),r=this.getExtendedBounds(t),o=0;e=this.markers_[o];o++)!e.isAdded&&this.isMarkerInBounds_(e,r)&&this.addToClosestCluster_(e)},Cluster.prototype.isMarkerAlreadyAdded=function(e){if(this.markers_.indexOf)return-1!=this.markers_.indexOf(e);for(var t,r=0;t=this.markers_[r];r++)if(t==e)return!0;return!1},Cluster.prototype.addMarker=function(e){if(this.isMarkerAlreadyAdded(e))return!1;if(this.center_){if(this.averageCenter_){var t=this.markers_.length+1,r=(this.center_.lat()*(t-1)+e.getPosition().lat())/t,o=(this.center_.lng()*(t-1)+e.getPosition().lng())/t;this.center_=new google.maps.LatLng(r,o),this.calculateBounds_()}}else this.center_=e.getPosition(),this.calculateBounds_();e.isAdded=!0,this.markers_.push(e);var s=this.markers_.length;if(s<this.minClusterSize_&&e.getMap()!=this.map_&&e.setMap(this.map_),s==this.minClusterSize_)for(var i=0;i<s;i++)this.markers_[i].setMap(null);return s>=this.minClusterSize_&&e.setMap(null),this.updateIcon(),!0},Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_},Cluster.prototype.getBounds=function(){for(var e,t=new google.maps.LatLngBounds(this.center_,this.center_),r=this.getMarkers(),o=0;e=r[o];o++)t.extend(e.getPosition());return t},Cluster.prototype.remove=function(){this.clusterIcon_.remove(),this.markers_.length=0,delete this.markers_},Cluster.prototype.getSize=function(){return this.markers_.length},Cluster.prototype.getMarkers=function(){return this.markers_},Cluster.prototype.getCenter=function(){return this.center_},Cluster.prototype.calculateBounds_=function(){var e=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(e)},Cluster.prototype.isMarkerInClusterBounds=function(e){return this.bounds_.contains(e.getPosition())},Cluster.prototype.getMap=function(){return this.map_},Cluster.prototype.updateIcon=function(){var e=this.map_.getZoom(),t=this.markerClusterer_.getMaxZoom();if(t&&e>t)for(var r,o=0;r=this.markers_[o];o++)r.setMap(this.map_);else{if(this.markers_.length<this.minClusterSize_)return void this.clusterIcon_.hide();var s=this.markerClusterer_.getStyles().length,i=this.markerClusterer_.getCalculator()(this.markers_,s);this.clusterIcon_.setCenter(this.center_),this.clusterIcon_.setSums(i),this.clusterIcon_.show()}},ClusterIcon.prototype.triggerClusterClick=function(e){var t=this.cluster_.getMarkerClusterer();google.maps.event.trigger(t,"clusterclick",this.cluster_,e),t.isZoomOnClick()&&this.map_.fitBounds(this.cluster_.getBounds())},ClusterIcon.prototype.onAdd=function(){if(this.div_=document.createElement("DIV"),this.visible_){var e=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(e),this.div_.innerHTML=this.sums_.text}this.getPanes().overlayMouseTarget.appendChild(this.div_);var t=this,r=!1;google.maps.event.addDomListener(this.div_,"click",function(e){r||t.triggerClusterClick(e)}),google.maps.event.addDomListener(this.div_,"mousedown",function(){r=!1}),google.maps.event.addDomListener(this.div_,"mousemove",function(){r=!0})},ClusterIcon.prototype.getPosFromLatLng_=function(e){var t=this.getProjection().fromLatLngToDivPixel(e);return"object"==typeof this.iconAnchor_&&2===this.iconAnchor_.length?(t.x-=this.iconAnchor_[0],t.y-=this.iconAnchor_[1]):(t.x-=parseInt(this.width_/2,10),t.y-=parseInt(this.height_/2,10)),t},ClusterIcon.prototype.draw=function(){if(this.visible_){var e=this.getPosFromLatLng_(this.center_);this.div_.style.top=e.y+"px",this.div_.style.left=e.x+"px"}},ClusterIcon.prototype.hide=function(){this.div_&&(this.div_.style.display="none"),this.visible_=!1},ClusterIcon.prototype.show=function(){if(this.div_){var e=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(e),this.div_.style.display=""}this.visible_=!0},ClusterIcon.prototype.remove=function(){this.setMap(null)},ClusterIcon.prototype.onRemove=function(){this.div_&&this.div_.parentNode&&(this.hide(),this.div_.parentNode.removeChild(this.div_),this.div_=null)},ClusterIcon.prototype.setSums=function(e){this.sums_=e,this.text_=e.text,this.index_=e.index,this.div_&&(this.div_.innerHTML=e.text),this.useStyle()},ClusterIcon.prototype.useStyle=function(){var e=Math.max(0,this.sums_.index-1);e=Math.min(this.styles_.length-1,e);var t=this.styles_[e];this.url_=t.url,this.height_=t.height,this.width_=t.width,this.textColor_=t.textColor,this.anchor_=t.anchor,this.textSize_=t.textSize,this.backgroundPosition_=t.backgroundPosition,this.iconAnchor_=t.iconAnchor},ClusterIcon.prototype.setCenter=function(e){this.center_=e},ClusterIcon.prototype.createCss=function(e){var t=[];t.push("background-image:url("+this.url_+");");var r=this.backgroundPosition_?this.backgroundPosition_:"0 0";t.push("background-position:"+r+";"),"object"==typeof this.anchor_?("number"==typeof this.anchor_[0]&&this.anchor_[0]>0&&this.anchor_[0]<this.height_?t.push("height:"+(this.height_-this.anchor_[0])+"px; padding-top:"+this.anchor_[0]+"px;"):"number"==typeof this.anchor_[0]&&this.anchor_[0]<0&&-this.anchor_[0]<this.height_?t.push("height:"+this.height_+"px; line-height:"+(this.height_+this.anchor_[0])+"px;"):t.push("height:"+this.height_+"px; line-height:"+this.height_+"px;"),"number"==typeof this.anchor_[1]&&this.anchor_[1]>0&&this.anchor_[1]<this.width_?t.push("width:"+(this.width_-this.anchor_[1])+"px; padding-left:"+this.anchor_[1]+"px;"):t.push("width:"+this.width_+"px; text-align:center;")):t.push("height:"+this.height_+"px; line-height:"+this.height_+"px; width:"+this.width_+"px; text-align:center;");var o=this.textColor_?this.textColor_:"black",s=this.textSize_?this.textSize_:11;return t.push("cursor:pointer; top:"+e.y+"px; left:"+e.x+"px; color:"+o+"; position:absolute; font-size:"+s+"px; font-family:Arial,sans-serif; font-weight:bold"),t.join("")},window.MarkerClusterer=MarkerClusterer,MarkerClusterer.prototype.addMarker=MarkerClusterer.prototype.addMarker,MarkerClusterer.prototype.addMarkers=MarkerClusterer.prototype.addMarkers,MarkerClusterer.prototype.clearMarkers=MarkerClusterer.prototype.clearMarkers,MarkerClusterer.prototype.fitMapToMarkers=MarkerClusterer.prototype.fitMapToMarkers,MarkerClusterer.prototype.getCalculator=MarkerClusterer.prototype.getCalculator,MarkerClusterer.prototype.getGridSize=MarkerClusterer.prototype.getGridSize,MarkerClusterer.prototype.getExtendedBounds=MarkerClusterer.prototype.getExtendedBounds,MarkerClusterer.prototype.getMap=MarkerClusterer.prototype.getMap,MarkerClusterer.prototype.getMarkers=MarkerClusterer.prototype.getMarkers,MarkerClusterer.prototype.getMaxZoom=MarkerClusterer.prototype.getMaxZoom,MarkerClusterer.prototype.getStyles=MarkerClusterer.prototype.getStyles,MarkerClusterer.prototype.getTotalClusters=MarkerClusterer.prototype.getTotalClusters,MarkerClusterer.prototype.getTotalMarkers=MarkerClusterer.prototype.getTotalMarkers,MarkerClusterer.prototype.redraw=MarkerClusterer.prototype.redraw,MarkerClusterer.prototype.removeMarker=MarkerClusterer.prototype.removeMarker,MarkerClusterer.prototype.removeMarkers=MarkerClusterer.prototype.removeMarkers,MarkerClusterer.prototype.resetViewport=MarkerClusterer.prototype.resetViewport,MarkerClusterer.prototype.repaint=MarkerClusterer.prototype.repaint,MarkerClusterer.prototype.setCalculator=MarkerClusterer.prototype.setCalculator,MarkerClusterer.prototype.setGridSize=MarkerClusterer.prototype.setGridSize,MarkerClusterer.prototype.setMaxZoom=MarkerClusterer.prototype.setMaxZoom,MarkerClusterer.prototype.onAdd=MarkerClusterer.prototype.onAdd,MarkerClusterer.prototype.draw=MarkerClusterer.prototype.draw,Cluster.prototype.getCenter=Cluster.prototype.getCenter,Cluster.prototype.getSize=Cluster.prototype.getSize,Cluster.prototype.getMarkers=Cluster.prototype.getMarkers,ClusterIcon.prototype.onAdd=ClusterIcon.prototype.onAdd,ClusterIcon.prototype.draw=ClusterIcon.prototype.draw,ClusterIcon.prototype.onRemove=ClusterIcon.prototype.onRemove;var lazyTreeListId_=1;ko.components.register("lazy-tree-list",{viewModel:function(e){var t=this;t.completeList=e.mylist,t.classname=e.class,t.currentCount=20,t.maxCount=t.completeList?t.completeList().length:0,t.visibleList=ko.observableArray([]),t.elemid="lazy-tree-list-"+lazyTreeListId_,t.refreshVisibleList_=function(){var e=Math.min(t.currentCount,t.maxCount);t.visibleList(t.completeList?t.completeList.slice(0,e):[])},t.listScrolled_=function(e,r){var o=r.target;o.scrollTop>o.scrollHeight-o.offsetHeight-200&&t.currentCount<t.maxCount&&(t.currentCount+=20,t.refreshVisibleList_())},ko.computed(function(){t.currentCount=20,t.maxCount=t.completeList?t.completeList().length:0,$("#"+t.elemid).scrollTop(0),t.refreshVisibleList_()}),lazyTreeListId_+=1},template:'<div data-bind="event: { scroll: listScrolled_ }, attr: { class: classname, id: elemid }">    <div data-bind="foreach: { data: visibleList, as: \'item\' }">    \x3c!-- ko template: { nodes: $componentTemplateNodes, data: item } --\x3e\x3c!-- /ko --\x3e    </div></div>'}),ko.bindingHandlers.modal={init:function(e,t){$(e).modal({show:!1});var r=t();"function"==typeof r&&$(e).on("hide.bs.modal",function(){r(!1)}),ko.utils.domNodeDisposal.addDisposeCallback(e,function(){$(e).modal("destroy")})},update:function(e,t){var r=t();ko.utils.unwrapObservable(r)?$(e).modal("show"):$(e).modal("hide")}};var WIKIPEDIA_BASE_URL_="https://en.wikipedia.org/w/api.php?",WIKIPEDIA_SEARCH_URL_=WIKIPEDIA_BASE_URL_+"action=opensearch&format=json&uselang=de&namespace=0&redirects=resolve&origin=*&search=",WIKIPEDIA_QUERY_URL_=WIKIPEDIA_BASE_URL_+"action=query&format=json&prop=info%7Cpageprops%7Cextracts&exintro=1&origin=*&titles=",WIKIPEDIA_IMG_QUERY_URL_=WIKIPEDIA_BASE_URL_+"action=query&format=json&prop=imageinfo&iilimit=50&iiurlwidth=200&iiprop=timestamp|user|url&origin=*&titles=File:";