/**
 * @name lazy-tree-list for KnockoutJS
 * @version version 1.0
 * @author Guido Schoepp
 * @fileoverview
 * This Knockout component implements a list which content
 * will be shown only when requested - for large amount of rows.
 * It first shows 20 entries and when scrolled to the end
 * of the list it displays the next 20 entries.
 */

// Lazy list inspiration from http://jsfiddle.net/adrienne/Y2WUN/

var lazyTreeListId = 1;

ko.components.register('lazy-tree-list', {
    viewModel: function(params) {
        var self = this;

        self.completeList = params.mylist;
        self.classname = params.class;
        self.currentCount = 20;
        self.maxCount = (self.completeList ? self.completeList().length : 0);
        self.visibleList = ko.observableArray([]);
        self.elemid = 'lazy-tree-list-'+lazyTreeListId;

        self.refreshVisibleList = function() {
            var count = Math.min(self.currentCount, self.maxCount);
            self.visibleList(self.completeList ? self.completeList.slice(0, count) : []);
        }

        self.listScrolled = function(data, event) {
            var elem = event.target;
            if ( 
                (elem.scrollTop > (elem.scrollHeight - elem.offsetHeight - 200)) &&
                (self.currentCount<self.maxCount)
            ) {
                self.currentCount += 20;
                self.refreshVisibleList();
            }
        },

        ko.computed(function() {
            self.currentCount = 20;
            self.maxCount = (self.completeList ? self.completeList().length : 0);
            $('#'+self.elemid).scrollTop(0);
            self.refreshVisibleList();
        });

        lazyTreeListId += 1;
    },
    template:
        "<div data-bind=\"event: { scroll: listScrolled }, attr: { class: classname, id: elemid }\">"+
        "    <div data-bind=\"foreach: { data: visibleList, as: 'item' }\">"+
        "    <!-- ko template: { nodes: $componentTemplateNodes, data: item } --><!-- /ko -->"+
        "    </div>"+
        "</div>"
});
