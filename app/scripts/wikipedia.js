/**
 * @name Wikipedia page information loader
 * @version version 1.0
 * @author Guido Schoepp
 * @fileoverview
 * Searches for a term and loads from the first hit the
 * page extract and image URL by using the Wikipedia API.
 */

/**
 * @description Base URL to Wikipedia API
 *
 * @type {string}
 * @private
 */
var WIKIPEDIA_BASE_URL_ = 'https://en.wikipedia.org/w/api.php?';

/**
 * @description URL for searching a Wikipedia page
 *
 * @type {string}
 * @private
 */
var WIKIPEDIA_SEARCH_URL_ = WIKIPEDIA_BASE_URL_+'action=opensearch&format=json&uselang=de&namespace=0&redirects=resolve&origin=*&search=';

/**
 * @description URL for querying information about a Wikipedia page
 *
 * @type {string}
 * @private
 */
var WIKIPEDIA_QUERY_URL_ = WIKIPEDIA_BASE_URL_+'action=query&format=json&prop=info%7Cpageprops%7Cextracts&exintro=1&origin=*&titles=';

/**
 * @description URL for requesting the image (thumbnail) URL for a given filename
 *
 * @type {string}
 * @private
 */
var WIKIPEDIA_IMG_QUERY_URL_ = WIKIPEDIA_BASE_URL_+'action=query&format=json&prop=imageinfo&iilimit=50&iiurlwidth=200&iiprop=timestamp|user|url&origin=*&titles=File:';

/**
 * @description Represents a Wikipedia page
 * @constructor
 */
function WikipediaPage() {
    var self = this;
    self.pageUrl = null;
    self.pageImage = null;
    self.pageImageUrl = null;
    self.pageExtract = null;

    /**
     * @description Requests the image (thumbnail) URL to a given Wikipedia image filename.
     *
     * @param {string} imageFilename - name of the filename as retrieved by a query request.
     * @param {function} callback - function that gets called after successful or failed request.
     * @private
     */
    self.queryImage_ = function (imageFilename, callback) {
        var queryImgUrl = WIKIPEDIA_IMG_QUERY_URL_+encodeURIComponent(imageFilename);
        $.getJSON(queryImgUrl)
        .done(function(result) {
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
            console.log('Wikipedia image query - data cannot be loaded ', err);
            callback(self, false, 'Data from Wikipedia image query cannot be loaded');
        });
    };

    /**
     * @description Requests page information about a Wikipedia page.
     *
     * @param {string} pageName - name of the Wikipedia page.
     * @param {function} callback - function that gets called after successful or failed request.
     * @private
     */
    self.queryInfo_ = function (pageName, callback) {
        var queryUrl = WIKIPEDIA_QUERY_URL_+encodeURIComponent(pageName);

        $.getJSON(queryUrl)
        .done(function(result) {
            if (result.query.pages) {
                for (var pageNo in result.query.pages) {
                    if (result.query.pages.hasOwnProperty(pageNo)) {
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
            console.log('Wikipedia query - data cannot be loaded '+err);
            callback(self, false, 'Data from Wikipedia query cannot be loaded');
        });
    };

    /**
     * @description Searches for Wikipedia pages to a given search term.
     *
     * @param {string} searchTerm - term to search for.
     * @param {function} callback - function that gets called after successful or failed request.
     * @private
     */
    self.search_ = function (searchTerm, callback) {
        var searchUrl = WIKIPEDIA_SEARCH_URL_+encodeURIComponent(searchTerm);

        $.getJSON(searchUrl)
        .done(function(result) {
            var pageName = result[1][0];
            self.pageUrl = result[3][0];
            if (pageName && self.pageUrl) {
                self.queryInfo_(pageName, callback);
            } else {
                if (searchTerm.indexOf('(') > 0 || searchTerm.indexOf('\'') > 0) {
                    searchTerm = searchTerm.replace(/\s*[('].*/, '');
                    self.search_(searchTerm, callback);
                } else {
                    callback(self, false, 'Wikipedia page for "' + searchTerm + '" not found');
                }
            }
        })
        .fail(function (err) {
            console.log('Wikipedia search - data cannot be loaded ', err);
            callback(self, false, 'Data from Wikipedia search cannot be loaded');
        });
    };

    /**
     * @description Searches for Wikipedia pages to a given search term.
     *
     * @param {string} searchTerm - term to search for.
     * @param {function} callback - function that gets called after successful or failed request.
     */
    self.load = function(searchTerm, callback) {
        self.search_(searchTerm, callback);
    };
}