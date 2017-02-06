angular.module('myApp').controller('privateMessages', function($rootScope, $scope, $location) {
    function escapeEmailAddress(email) {
        if (!email) return false

        // Replace '.' (not allowed in a Firebase key) with ',' (not allowed in an email address)
        email = email.toLowerCase();
        email = email.replace(/\./g, ',');
        return email;
    }

    $scope.sendMessage = function (message, username) {
        message = $scope.message;
        username = $rootScope.userCredentials.email.slice(0, $rootScope.userCredentials.email.indexOf('@'));
        console.log(username);
        console.log($scope.target);
        var databaseKey = escapeEmailAddress($scope.target);
        firebase.database().ref().child('privateMessages/' + databaseKey).push({
            message: message,
            sender: username,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        console.log('sent message!');
        $scope.message = "";
        $scope.target = "";
    }
    $scope.goHome = function () {
        $rootScope.accessProfile = false;
        $location.path('/map');
    }
});