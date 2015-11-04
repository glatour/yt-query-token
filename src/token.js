(function() {
  angular
    .module('yt-query-token')
    .directive('token', ['$timeout',
      function($timeout) {
        return {
          restrict: 'E',
          scope: {
            token: '='
          },
          require: '^query',
          templateUrl: 'token.html',
          controller: ['$scope', tokenController],
          link: function(scope, ele, attrs, queryCtrl) {
            scope.queryCtrl = queryCtrl;
            queryCtrl.registerToken(scope);
            scope.ui = {
              isValueFocused: false
            };

            scope.selectIfEmpty = function() {
              if (scope.token.key === '') {
                scope.ui.isKeyFocused = true;
                scope.$apply();
                return true;
              } else if (scope.token.value === '') {
                scope.ui.isValueFocused = true;
                scope.$apply();
                return true;
              }
              return false;
            }

            scope.removeToken = function() {
              queryCtrl.removeToken(scope);
            }

            $timeout(function() {
              if (scope.token.manuallyAdded)
                $(ele).find('.query-token-key')[0].focus();
            }, 1);

            $(ele.children('.query-token-value')[0])
              .asEventStream('focus')
              .onValue(function(it) {
                if (it.target.innerHTML === '')
                  it.target.innerHTML = '&nbsp;';
              });

            $(ele.find('.query-token-value')[0])
              .asEventStream('keydown')
              .onValue(function(it) {
                if (it.target.innerHTML === '&nbsp;')
                  it.target.innerHTML = '';
                else if (it.target.innerHTML.length === 1 && it.keyCode === 8)
                  it.target.innerHTML = '&nbsp;';
                else if (((it.keyCode === 9 && !it.shiftKey) || it.keyCode === 13) && it.target.innerHTML.length > 0) {
                  queryCtrl.addToken(true);
                  queryCtrl.selectNextToken(scope);
                  it.preventDefault();
                  it.stopPropagation();
                } else
                  queryCtrl.addToken(false);
              });
          }
        }
    }]);

  function tokenController($scope) {
    var vm = this;
    $scope.$watchAsProperty('token.key', true)
      .filter(function(it) {
        return it.length > 0;
      })
      .filter(function(it) {
        return it.match(/(test|val|1|2|3)$/i);
      })
      .onValue(function(it) {
        $scope.token.value = '&nbsp;';
        $scope.ui.isValueFocused = true;
      })
  }
})();