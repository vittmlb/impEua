'use strict';

describe('example services - module test', function() {

    beforeEach(angular.mock.module('ui.footable'));

    var elem;
    beforeEach(inject(function($rootScope, $compile) {
        elem = $compile('<table class="footable table" data-sort="false">')($rootScope);
    }));

    it('should have a "example" services', function() {
        expect(elem.hasClass('footable')).toBeTruthy();
    });
});