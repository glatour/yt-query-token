(function() {

  angular
    .module('yt-query-token')
    .directive('contenteditable', ['$sce',
    function($sce) {
        return {
          restrict: 'A',
          require: '?ngModel',
          link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return;
            ngModel.$render = function() {
              element.html($sce.trustAsHtml(ngModel.$viewValue || ''));
            };
            element.on('blur keyup change', function() {
              scope.$evalAsync(read);
            });
            read();

            function read() {
              var html = element.html();
              if (attrs.stripBr && html == '<br>') {
                html = '';
              }
              ngModel.$setViewValue(html);
            }
          }
        };
}])
})();