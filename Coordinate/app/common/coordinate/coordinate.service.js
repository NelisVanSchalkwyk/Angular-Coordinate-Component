(function () {
    'use strict';

    /**
     * A service to assist with the conversion of coordinates to different formats.
     * @example
     * // As an element.
     * <coordinate data-coordinate-format="DMS" data-coordinate-type="lng" data-ng-model="<model longitude value>"></coordinate>
     * // As an attribute.
     * <input type="text" data-coordinate data-coordinate-format="DD" data-coordinate-type="lat" data-ng-model="<model latitude value>" />
     */
    angular
        .module('common.coordinate')
        .factory('CoordinateConverter', CoordinateConverter);

    function CoordinateConverter() {
        var service = {
            DecimalDegreesToDegreesMinutesSeconds: DDtoDMS,
            DecimalDegreesToDegreesDecimalMinutes: DDtoDDM,
            DegreesMinutesSecondsToDecimalDegrees: DMStoDD,
            DegreesDecimalMinutesToDecimalDegrees: DDMtoDD,
            getDegrees: getDegrees,
            getMinutes: getMinutes,
            getSeconds: getSeconds,
            getDecimalMinutes: getDecimalMinutes,
            getDirection: getDirection,
            getDecimalDegrees: getDecimalDegrees,
            isValidCoordinate: isValidCoordinate
        };

        return service;

        /**
         * Converts Decimal Degrees to Degrees Minutes Seconds.
         * @param {Number} value - The decimal degree value.
         * @param {string} type - The type of the coordinate i.e. lat | lng
         * @returns {Object} - A DMS object.
         */
        function DDtoDMS(value, type) {
            return {
                degrees: getDegrees(value),
                minutes: getMinutes(value),
                seconds: getSeconds(value),
                direction: getDirection(value, type)
            };
        }

        /**
         * Converts Decimal Degrees to Degrees Decimal Minutes.
         * @param {Number} value - The decimal degree value.
         * @param {string} type - The type of the coordinate i.e. lat | lng
         * @returns {Object} - A DDM object.
         */
        function DDtoDDM(value, type) {
            return {
                degrees: getDegrees(value),
                minutes: getDecimalMinutes(value),
                direction: getDirection(value, type)
            };
        }

        /**
         * Converts Degrees Minutes Seconds to Decimal Degrees.
         * @param {Number} degrees - The degree value.
         * @param {Number} minutes - The minute value.
         * @param {Number} seconds - The second value.
         * @param {string} direction - The direction value.
         * @returns {Number} - A DD value.
         */
        function DMStoDD(degrees, minutes, seconds, direction) {
            return getDecimalDegrees({
                degrees: degrees,
                minutes: minutes,
                seconds: seconds,
                direction: direction
            });
        }

        /**
         * Converts Degrees Decimal Minutes to Decimal Degrees.
         * @param {Number} degrees - The degree value.
         * @param {Number} minutes - The minute value.
         * @param {string} direction - The direction value.
         * @returns {Number} - A DD value.
         */
        function DDMtoDD(degrees, minutes, direction) {
            return getDecimalDegrees({
                degrees: degrees,
                minutes: minutes,
                direction: direction
            });
        }

        /**
         * Gets the degree component of the Decimal Degree value as an absolute value.
         * @param {Number} value - The DD value.
         * @returns {Number} - An unsigned integer value.
         */
        function getDegrees(value) {
            return Math.abs(parseInt(value));
        }

        /**
         * Gets the minutes component of the Decimal Degree value.
         * @param {Number} value - The DD value.
         * @returns {Number} - An number beween 0 and 59.
         */
        function getMinutes(value) {
            return Math.floor(60 * (Math.abs(value) - getDegrees(value)));
        }

        /**
         * Gets the seconds component of the Decimal Degree value.
         * @param {Number} value - The DD value.
         * @returns {Number} - An float value beween 0 and 59.
         */
        function getSeconds(value) {
            return parseFloat((3600 * (Math.abs(value) - getDegrees(value) - Math.abs(getMinutes(value)) / 60)).toFixed(3));
        }

        /**
         * Gets the decimal minutes component of the Decimal Degree value.
         * @param {Number} value - The DD value.
         * @returns {Number} - An float value beween 0 and 59.
         */
        function getDecimalMinutes(value) {
            return parseFloat((60 * (Math.abs(value) - getDegrees(value))).toFixed(5));
        }

        /**
         * Gets the direction component of the Decimal Degree value.
         * @param {Number} value - The DD value.
         * @returns {string} - A string i.e. N|S|W|E.
         */
        function getDirection(value, type) {
            if (type === 'lng') {
                return value < 0 ? 'W' : 'E';
            }

            return value < 0 ? 'S' : 'N';
        }

        /**
         * Determines the Decimal Degree value.
         * @param {Object} value - Either a DMS or DDM object.
         * @returns {NUmber} - The DD value.
         */
        function getDecimalDegrees(value) {
            var decimalDegrees = 0;
            var degrees = value.degrees || 0;
            var minutes = value.minutes || 0;
            var seconds = value.seconds || 0;
            var direction = value.direction || 'N';

            if (isFloat(minutes)) {
                decimalDegrees = degrees + (minutes / 60);
            }
            else {
                decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
            }

            if (direction.toLowerCase() === 's' || direction.toLowerCase() === 'w') {
                decimalDegrees = -1 * decimalDegrees;
            }

            return decimalDegrees;
        }

        /**
         * Determines whether a coordinate is valid.
         * @param {Number} value - The DD value.
         * @returns {boolean} - True if the value is valid, else false.
         */
        function isValidCoordinate(value, type) {
            switch (type) {
                case 'lat':
                    return isBetween(value, -90, 90);
                case 'lng':
                    return isBetween(value, -180, 180);
                default:
                    return false;
            }
        }

        /**
         * Determines if a value is an integer.
         * @param {Number} value - The value to test.
         * @returns {boolean} True if the value is an integer, else false.
         */
        function isInteger(value) {
            return Number(value) === value && value % 1 === 0;
        }

        /**
         * Determines if a value is a float.
         * @param {Number} value - The value to test.
         * @returns {boolean} True if the value is a float, else false.
         */
        function isFloat(value) {
            return Number(value) === value && value % 1 !== 0;
        }

        /**
         * Determines whether a value is bewteen 2 other values.
         * @param {Number} value - The value to test.
         * @param {Number} a - The minimum value.
         * @param {Number} b - The maximum value.
         * @param {boolean} inclusive - Should the min and max values be included or not?
         * @returns {boolean} True if the value is between the minimum and maximum value, else false.
         */
        function isBetween(value, a, b, inclusive) {
            if (!angular.isNumber(value)) {
                return false;
            }

            var min = Math.min.apply(Math, [a, b]),
                max = Math.max.apply(Math, [a, b]);

            return inclusive ? value >= min && value <= max : value > min && value < max;
        }
    }
})();
