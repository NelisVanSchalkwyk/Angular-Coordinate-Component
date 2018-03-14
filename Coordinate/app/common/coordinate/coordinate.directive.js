(function () {
    'use strict';

    /**
     * A directive to display coordinates in different formats.
     * @example
     * // As an element.
     * <coordinate data-coordinate-format="DMS" data-coordinate-type="lng" data-ng-model="<model longitude value>"></coordinate>
     * // As an attribute.
     * <input type="text" data-coordinate data-coordinate-format="DD" data-coordinate-type="lat" data-ng-model="<model latitude value>" />
     */
    angular
        .module('common.coordinate')
        .directive('coordinate', coordinate);

    coordinate.$inject = ['coordinateFormats', 'CoordinateConverter'];

    function coordinate(coordinateFormats, CoordinateConverter) {
        var directive = {
            restrict: 'EA',
            replace: true,
            require: '?ngModel',
            scope: {
                coordinateFormat: '@',
                coordinateType: '@'
            },
            template: getTemplate,
            link: link
        };

        return directive;

        function getTemplate(element, attr) {
            var format = attr.coordinateFormat || coordinateFormats.Decimal_Degrees;
            var type = attr.coordinateType || 'lat';
            var options = getDirectionOptions(type);
            var range = getRange(type);

            switch (format) {
                case coordinateFormats.Degrees_Minutes_Seconds:
                    return getDegreesMinutesSecondsTemplate(options, range);
                case coordinateFormats.Degrees_Decimal_Minutes:
                    return getDegreesDecimalMinutesTemplate(options, range);
                case coordinateFormats.Decimal_Degrees:
                default:
                    return getDecimalDegreesTemplate(range);
            }
        }

        function link(scope, element, attr, ngModelCtrl) {
            if (!ngModelCtrl) return; // do nothing if no ng-model

            var format = scope.coordinateFormat || coordinateFormats.Decimal_Degrees;
            var type = scope.coordinateType || 'lat';

            // Executes whenever the control reads value from the DOM i.e. whenever the user changes an input value.
            function parser(viewValue) {
                if (ngModelCtrl.$isEmpty(viewValue)) {
                    return undefined;
                }

                var decimalDegrees;

                // Here we need to return the decimal degree value.
                switch (format) {
                    case coordinateFormats.Degrees_Minutes_Seconds:
                        return CoordinateConverter.DegreesMinutesSecondsToDecimalDegrees(viewValue.degrees, viewValue.minutes, viewValue.seconds, viewValue.direction);
                    case coordinateFormats.Degrees_Decimal_Minutes:
                        return CoordinateConverter.DegreesDecimalMinutesToDecimalDegrees(viewValue.degrees, viewValue.decimalMinutes, viewValue.direction);
                    default:
                        return viewValue.decimalDegrees;
                }
            }

            ngModelCtrl.$parsers.push(parser);

            // Executes when the model changes. Used to format/convert values for display in the control.
            function formatter(modelValue) {
                if (ngModelCtrl.$isEmpty(modelValue)) {
                    return null;
                }

                return {
                    decimalDegrees: modelValue,
                    degrees: CoordinateConverter.getDegrees(modelValue),
                    minutes: CoordinateConverter.getMinutes(modelValue),
                    seconds: CoordinateConverter.getSeconds(modelValue),
                    decimalMinutes: CoordinateConverter.getDecimalMinutes(modelValue),
                    direction: CoordinateConverter.getDirection(modelValue, type)
                };
            }

            ngModelCtrl.$formatters.push(formatter);

            // When the model changes, update our view.
            ngModelCtrl.$render = function () {
                scope.decimalDegrees = ngModelCtrl.$viewValue.decimalDegrees;
                scope.degrees = ngModelCtrl.$viewValue.degrees;
                scope.minutes = ngModelCtrl.$viewValue.minutes;
                scope.seconds = ngModelCtrl.$viewValue.seconds;
                scope.decimalMinutes = ngModelCtrl.$viewValue.decimalMinutes;
                scope.direction = ngModelCtrl.$viewValue.direction;
            }

            scope.$watch('degrees + minutes + seconds + decimalMinutes + direction + decimalDegrees', function () {
                ngModelCtrl.$setViewValue({
                    decimalDegrees: scope.decimalDegrees,
                    degrees: scope.degrees,
                    minutes: scope.minutes,
                    seconds: scope.seconds,
                    decimalMinutes: scope.decimalMinutes,
                    direction: scope.direction
                });
            });
        }

        function getDecimalDegreesTemplate(range) {
            return ['<div><input type="number" data-ng-model="decimalDegrees" step="any" min="',
                range.min,
                '" max="',
                range.max,
                '" /></div>'].join('');
        }

        function getDegreesMinutesSecondsTemplate(options, range) {
            return ['<div>',
                '<input type="number" data-ng-model="degrees" step="1" min="',
                range.min,
                '" max="',
                range.max,
                '"/>&deg;&nbsp;',
                '<input type="number" data-ng-model="minutes" step="1" min="0" max="59"/>&prime;&nbsp;',
                '<input type="number" data-ng-model="seconds" step="any" min="0" max="59.999"/>&Prime;&nbsp;',
                '<select data-ng-model="direction">',
                options,
                '</select>',
                '</div>'].join('');
        }

        function getDegreesDecimalMinutesTemplate(options, range) {
            return ['<div>',
                '<input type="number" data-ng-model="degrees" step="1" min="',
                range.min,
                '" max="',
                range.max,
                '"/>&deg;&nbsp;',
                '<input type="number" data-ng-model="decimalMinutes" step="any" min="0" max="59.99999"/>&prime;&nbsp;',
                '<select data-ng-model="direction">',
                options,
                '</select>',
                '</div>'].join('');
        }

        function getDirectionOptions(type) {
            var options = [];
            switch (type) {
                case 'lng':
                    options.push('<option value="E">E</option>');
                    options.push('<option value="W">W</option>');
                    break;
                default:
                    options.push('<option value="N">N</option>');
                    options.push('<option value="S">S</option>');
                    break;
            }
            return options;
        }

        function getRange(type) {
            var min = -90,
                max = 90;

            if (type === 'lng') {
                min = -180;
                max = 180;
            }

            return { min: min, max: max };
        }
    }
})();
