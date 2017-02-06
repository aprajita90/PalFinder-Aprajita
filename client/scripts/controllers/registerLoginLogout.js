angular.module('myApp').controller('registerLogInLogOut', function($rootScope, $scope, $location, databaseAndAuth, runListeners) {
  $scope.register = function() {
    var register = databaseAndAuth.auth.createUserWithEmailAndPassword($scope.email, $scope.password);
    //add user to the database so we can add/update their locaion as it's being montiored
    register.then(function(user) {
      databaseAndAuth.database.ref('users/' + user.uid).set({
        username: $scope.email.slice(0, $scope.email.indexOf('@')),
        email: $scope.email,
      });
      $rootScope.loggedIn = true;
      $location.path('/map');
    })
    register.catch(function(error) {
      console.log(error.message);
    });
  };
  $scope.logIn = function() {
    var login = databaseAndAuth.auth.signInWithEmailAndPassword($scope.email, $scope.password);
    login.then(function(user) {
      $scope.email = '';
      $scope.password = '';
      $scope.badLogin = '';
      $scope.$apply();

      $rootScope.loggedIn = true;
      $location.path('/map');
    });
    login.catch(function(error) {
      console.log(error.message);
      $scope.badLogin = error.message + ' If you don\'t have an account, please sign up!'
      $scope.$apply();
      $rootScope.loggedIn = false;
      $location.path('/');
    })
  };
  $scope.logOut = function() {
    //on logout remove the user's coordinates from database
    var logout = databaseAndAuth.database.ref('users/' + $scope.userId + '/coordinates').remove();
    //then sign them out
    logout.then(function(){
      console.log('logged out');
      $rootScope.$broadcast('user:loggedOut', '');
      databaseAndAuth.auth.signOut();
      console.log('user logged out: ', $scope.userId);
      $rootScope.loggedIn = false;
      $location.path('/');
      $scope.$apply();
    });
  };
  $scope.showPartial = function() {
    $rootScope.showMessages = true;
  }
  $rootScope.attemptSignup = false;
  $scope.signUp = function () {
    console.log($rootScope.attemptSignup);
    $rootScope.attemptSignup = !$rootScope.attemptSignup;
    $location.path('/signup');
  }
  //listen for authentication state change (user logged in or logged out)
  databaseAndAuth.auth.onAuthStateChanged(function(databaseUser) {
    if (databaseUser) {
      //run databse listener every time there is a login/logout/page refresh
      runListeners.childChanged();
      runListeners.childAdded();
      runListeners.childRemoved();
      //broadcast the unique user id so it can watchCurrentLocation controller
      //can update the database with the most recent location
      $rootScope.$broadcast('user:logIn', databaseUser.uid);
      //attach the current user ID to scope so it can be used in logout to remove
      //the user's coordinates
      $scope.userId = databaseUser.uid;
      //show logout button on homepage
      $rootScope.loggedIn = true;
      $location.path('/map');
      $scope.$apply();
    } else {
      //hide logout button (user is not logged in)
      $rootScope.loggedIn = false;
      $scope.$apply();
      //$location.path('/login');
    }
  });
});