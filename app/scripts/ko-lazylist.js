/**
 * @name lazy-tree-list for KnockoutJS
 * @version version 1.0
 * @author Guido Schoepp
 * @fileoverview
 * This Knockout component implements a list which content
 * will be shown only when requested - for large amount of rows.
 * It first shows 20 entries and when scrolled to the end
 * of the list it displays the next 20 entries.
 * Inspiration from http://jsfiddle.net/adrienne/Y2WUN/
 */

/**
 * @description Number for the id of the next lazy-tree-list.
 *     Used to generate the "id" attribute for the list,
 *     e.g. 'lazy-tree-list-5'.
 *
 * @type {number}
 * @private
 */
var lazyTreeListId_ = 1;

/**
 * @description Registers the lazy-tree-list component for the Knockout framework.
 */
ko.components.register('lazy-tree-list', {
    /**
     * @description Generates the view model for the list component.
     *
     * @param {Object} params - supports the following options:
     *      'mylist': (Array) observableArray containing all list items
     *      'class': (string) The classname for the <lazy-tree-list> html element
     */
    viewModel: function(params) {
        var self = this;

        self.completeList = params.mylist;
        self.classname = params.class;
        self.currentCount = 20;
        self.maxCount = (self.completeList ? self.completeList().length : 0);
        self.visibleList = ko.observableArray([]);
        self.elemid = 'lazy-tree-list-'+lazyTreeListId_;

        /**
         * @description Refresh the html list by updating the visibleList observableArray
         *
         * @private
         */
        self.refreshVisibleList_ = function() {
            var count = Math.min(self.currentCount, self.maxCount);
            self.visibleList(self.completeList ? self.completeList.slice(0, count) : []);
        };

        /**
         * @description Gets called when the list is scrolled. If the end of the
         *      list is reached, the next items will be loaded (if available).
         *
         * @private
         */
        self.listScrolled_ = function(data, event) {
            var elem = event.target;
            if (
                (elem.scrollTop > (elem.scrollHeight - elem.offsetHeight - 200)) &&
                (self.currentCount<self.maxCount)
            ) {
                self.currentCount += 20;
                self.refreshVisibleList_();
            }
        };

        /**
         * @description Gets called when the completeList observableArray gets updated.
         *      Resets the current displayed entries (currentCount=20) and scrolls
         *      the list to the top.
         *
         * @private
         */
        ko.computed(function() {
            self.currentCount = 20;
            self.maxCount = (self.completeList ? self.completeList().length : 0);
            $('#'+self.elemid).scrollTop(0);
            self.refreshVisibleList_();
        });

        lazyTreeListId_ += 1;
    },
    /**
     * @description The template for the list component.
     */
    template:
        '<div data-bind="event: { scroll: listScrolled_ }, attr: { class: classname, id: elemid }">' +
        '    <div data-bind="foreach: { data: visibleList, as: \'item\' }">' +
        '    <!-- ko template: { nodes: $componentTemplateNodes, data: item } --><!-- /ko -->' +
        '    </div>' +
        '</div>'
});
