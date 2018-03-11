; (function () {
    'use strict';

    /**
     * Enum for coordinate formats.
     * @readonly
     * @enum {string}
     */
    angular
        .module('common.coordinate')
        .constant('coordinateFormats', {
            Decimal_Degrees: 'DD',
            Degrees_Minutes_Seconds: 'DMS',
            Degrees_Decimal_Minutes: 'DDM'
        });
})();