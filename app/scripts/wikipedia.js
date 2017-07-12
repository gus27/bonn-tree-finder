var WikipediaBaseUrl = "https://en.wikipedia.org"
var WikipediaSearchUrl = WikipediaBaseUrl+"/w/api.php?action=opensearch&format=json&uselang=de&namespace=0&redirects=resolve&origin=*&search="
var WikipediaQueryUrl = WikipediaBaseUrl+"/w/api.php?action=query&format=json&prop=info%7Cpageprops%7Cextracts&exintro=1&origin=*&titles=";
var WikipediaImgQueryUrl = WikipediaBaseUrl+"/w/api.php?action=query&format=json&prop=imageinfo&iilimit=50&iiurlwidth=200&iiprop=timestamp|user|url&origin=*&titles=File:";

function WikipediaPage() {
    var self = this;
    self.pageUrl = null;
    self.pageImage = null;
    self.pageImageUrl = null;
    self.pageExtract = null;

    self.queryImage_ = function (imageFilename, callback) {
        var queryImgUrl = WikipediaImgQueryUrl+encodeURIComponent(imageFilename);
        $.getJSON(queryImgUrl)
        .done(function(result) {
            console.log('queryImage_', result);
            if (result.query.pages) {
                for (var pageNo in result.query.pages) {
                    var page = result.query.pages[pageNo];
                    if (page.imageinfo) {
                        self.pageImageUrl = page.imageinfo[0].thumburl;
                        break;
                    }
                }
            }
            if (callback) {
                callback(self, true, '');
            }
        })
        .fail(function (err) {
            // TODO: show error message to user
            console.log('Wikipedia image query - data cannot be loaded '+err);
            callback(self, false, err);
        });
    };

    self.queryInfo_ = function (pageName, callback) {
        var queryUrl = WikipediaQueryUrl+encodeURIComponent(pageName);

        $.getJSON(queryUrl)
        .done(function(result) {
            if (result.query.pages) {
                for (var pageNo in result.query.pages) {
                    if (result.query.pages.hasOwnProperty(pageNo)) {
                        console.log(result);
                        var page = result.query.pages[pageNo];
                        self.pageImage = page.pageprops.page_image_free;
                        self.pageExtract = page.extract;
                        if (self.pageImage) {
                            self.queryImage_(self.pageImage, callback);
                        } else if (callback) {
                            callback(self, true, '');
                        }
                        break;
                    }
                }
            }
        })
        .fail(function (err) {
            // TODO: show error message to user
            console.log('Wikipedia query - data cannot be loaded '+err);
            callback(self, false, err);
        });
    };

    self.search_ = function (searchTerm, callback) {
        console.log('search_', searchTerm);
        var searchUrl = WikipediaSearchUrl+encodeURIComponent(searchTerm);

        $.getJSON(searchUrl)
        .done(function(result) {
            console.log(result);
            var pageName = result[1][0];
            self.pageUrl = result[3][0];
            console.log('name', pageName, 'url', self.pageUrl);
            if (pageName && self.pageUrl) {
                self.queryInfo_(pageName, callback);
            } else {
                if (searchTerm.indexOf("(") > 0 || searchTerm.indexOf("'") > 0) {
                    searchTerm = searchTerm.replace(/\s*[('].*/, "");
                    self.search_(searchTerm, callback);
                } else {
                    callback(self, false, 'Wikipedia page for "' + searchTerm + '" not found');
                }
            }
        })
        .fail(function (err) {
            // TODO: show error message to user
            console.log('Wikipedia search - data cannot be loaded '+err);
            callback(self, false, err);
        });
    };

    self.load = function(searchTerm, callback) {
        self.search_(searchTerm, callback);
    };
}