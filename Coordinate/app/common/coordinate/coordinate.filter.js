(function () {
    'use strict';

    /**
     * A filter to assist with the display coordinates in different formats.
     * @example
     * // In markup.
     * {{ <model latitude value> | coordinate: 'DMS': 'lat'}}
     */
    angular
        .module('common.coordinate')
        .filter('coordinate', coordinate);

    coordinate.$inject = ['$sce', 'coordinateFormats', 'CoordinateConverter'];

    function coordinate($sce, coordinateFormats, CoordinateConverter) {

        return formatCoordinate;

        function formatCoordinate(input, format, type) {
            if (angular.isUndefined(input)) {
                return '';
            }

            input = input.toString();

            // Check for user input that is a positive or negative number with the option
            // that it is a float. Match only the numbers and not the white space or other characters
            var pattern = /[-+]?[0-9]*\.?[0-9]+/g;
            var match = input.match(pattern);
            input = Number(match[0]);

            if (!CoordinateConverter.isValidCoordinate(input, type)) {
                return "Invalid coordinate!";
            }

            switch (format) {
                case coordinateFormats.Degrees_Minutes_Seconds:
                    var dms = CoordinateConverter.DecimalDegreesToDegreesMinutesSeconds(input, type);
                    return $sce.trustAsHtml(dms.degrees + '° ' + dms.minutes + '\' ' + dms.seconds + '" ' + dms.direction);
                case coordinateFormats.Degrees_Decimal_Minutes:
                    var ddm = CoordinateConverter.DecimalDegreesToDegreesDecimalMinutes(input, type);
                    return $sce.trustAsHtml(ddm.degrees + '° ' + ddm.minutes + '\' ' + ddm.direction);
                case coordinateFormats.Decimal_Degrees:
                default:
                    return input.toFixed(6);
            }
        }
    }
})();
