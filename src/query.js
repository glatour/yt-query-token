(function() {
  angular
    .module('yt-query-token', ["angular-bacon"])
    .directive('query', function() {
      return {
        restrict: 'E',
        templateUrl: 'query.html',
        controller: ['$scope', queryController],
        scope: {
          tokens: '='
        },
        link: function(scope, ele, attrs, scope) {
          var queryInput = $(ele[0]).children()[0];
          $(ele)
            .asEventStream('click')
            .filter(function(it) {
              return queryInput === it.target;
            })
            .onValue(function(it) {
              for (var i = scope.childScopes.length - 1; i >= 0; i--) {
                var handled = scope.childScopes[i].selectIfEmpty();
                if (handled) return true;
              };
              return false;
            });
        }
      }
    });

  function queryController($scope) {
    $scope._tokens = [new Token(0)];
    $scope.tokens = [];
    this.childScopes = [];

    this.addToken = function(manuallyAdded) {
      if ($scope._tokens[$scope._tokens.length - 1].key != '' && $scope._tokens[$scope._tokens.length - 1].value != '') {
        var token = new Token($scope._tokens.length);
        token.manuallyAdded = manuallyAdded;
        $scope._tokens.push(token);
      }
    }

    this.selectNextToken = function(token) {
      for (var i = this.childScopes.length - 1; i >= 0; i--) {
        var handled = this.childScopes[i].selectIfEmpty();
        if (handled) return true;
      };
      return false;
    }

    this.removeToken = function(token) {
      Bacon
        .fromArray($scope._tokens)
        .filter(function(it) {
          return it !== token.token;
        }).scan([], function(a, b) {
          a.push(b);
          return a;
        }).digest($scope, '_tokens');
    }

    this.registerToken = function(tokenDirective) {
      this.childScopes.push(tokenDirective);
    }

    Bacon
      .fromBinder(function(sink) {
        $scope.$watchAsProperty('_tokens', true)
          .onValue(function(it) {
            var filteredArray = Bacon
              .fromArray(it)
              .filter(function(it) {
                return it.key !== '' && it.value !== '' && it.value !== '&nbsp;';
              });

            filteredArray
              .map(function(it) {
                return {
                  key: it.key,
                  value: it.value
                }
              })
              .digest($scope, 'tokens');

            filteredArray.scan('', function(a, b) {
              if (a !== '')
                a += ' and ';
              return a += b.key + ' is ' + b.value;
            }).onValue(function(it) {
              sink(it);
            });
          })
      })
      .digest($scope, 'searchQuery');
  }

  function Token(id) {
    this.id = id;
    this.key = '';
    this.value = '';
  }
})();