var app = angular.module("myapp", ["ngRoute"]);

app.factory('authservice',function($location){
  return {
    checkUserStatus: function(){
      // ("inside function");
      if (sessionStorage.loggedin == "false") {
        $location.url("/login");
      }
    }
  }
});

app.directive("navbar", function () {
  return {
    template: `  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
      aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-item nav-link active" href="#/">Home
          <span class="sr-only">(current)</span>
        </a>
        <a class="nav-item nav-link" href="#/login" ng-if="login">Login</a>
        <a class="nav-item nav-link" href="#/register" ng-if="register">Register</a>
        <a class="nav-item nav-link" href="#/profile" ng-if="profile">profile</a>
        <a class="nav-item nav-link" href="#/messages" ng-if="messages">messages</a>
        <a class="nav-item nav-link" href="#/logout" ng-if="logout">logout</a>
      </div>
    </div>
  </nav>`
  };
});

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/main.html",
      controller: "mainController"
    })
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "loginController"
    })
    .when("/logout", {
      templateUrl: "views/main.html",
      controller: "logoutController"
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "registerController"
    })
    .when("/profile", {
      templateUrl: "views/profile.html",
      controller: "profileController"
    })
    .when("/detailmsg/:id", {
      templateUrl: "views/detailedMsg.html",
      controller: "detailmsgController",
      resolve:{
        // authservice.checkUserStatus();
        // $scope.$emit('singlemessage', {});
        getMessage: function($http,$route){
          return $http.get(`http://localhost:3000/msg/${$route.current.params.id}`).then(function (res) {
            return res.data;
          });
        }
      }
    })
    .when("/messages", {
      templateUrl: "views/msg.html",
      controller: "msgController",
      resolve:{
        allMessages: function($http){
          return $http.get(`http://localhost:3000/msgs/${sessionStorage.user}`).then(function (res) {
            return res.data;
          });
        }
      }
    });
});

app.controller("indexController", function ($scope) {
  $scope.$on('main', (event, obj) => {
    if (obj.loggedin) {
      $scope.login = false;
      $scope.register = false;
      $scope.profile = true;
      $scope.messages = true;
      $scope.logout = true;
    } else {
      $scope.login = true;
      $scope.register = true;
      $scope.profile = false;
      $scope.messages = false;
      $scope.logout = false;
    }
  });

  $scope.$on('login', (event, obj) => {
    $scope.login = false;
    $scope.register = true;
    $scope.profile = false;
    $scope.messages = false;
    $scope.logout = false;
  });

  $scope.$on('register', (event, obj) => {
    $scope.login = true;
    $scope.register = false;
    $scope.profile = false;
    $scope.messages = false;
    $scope.logout = false;
  });

  $scope.$on('messages', (event, obj) => {
    $scope.login = false;
    $scope.register = false;
    $scope.profile = true;
    $scope.messages = false;
    $scope.logout = true;
  });

  $scope.$on('singlemessage', (event, obj) => {
    $scope.login = false;
    $scope.register = false;
    $scope.profile = true;
    $scope.messages = true;
    $scope.logout = true;
  });

  $scope.$on('profile', (event, obj) => {
    $scope.login = false;
    $scope.register = false;
    $scope.profile = false;
    $scope.messages = true;
    $scope.logout = true;
  });

});

app.controller("mainController", function ($scope) {
  if (sessionStorage.loggedin == "true") {
    $scope.$emit('main', { loggedin: true });
  } else {
    $scope.$emit('main', { loggedin: false });
  }

  if (sessionStorage.loggedin == "true") {
    $scope.logdin = true;
    $scope.username = sessionStorage.user;
  } else {
    $scope.logdin = false;
  }

});

app.controller("msgController", function (authservice,allMessages,$scope) {
  authservice.checkUserStatus();
  $scope.$emit('message', {});
  $scope.messages = allMessages;
});

app.controller("profileController", function (authservice,$scope,$http,$window,$rootScope,$location) {

  authservice.checkUserStatus();
  $scope.$emit('profile', {});
  $rootScope.logout = function () {
    sessionStorage.loggedin = false;
    sessionStorage.user = undefined;
    $window.location.reload();
  };



  if (sessionStorage.user) {
    var url = "http://localhost:3000/users/" + sessionStorage.user;
    $http.get(url).then(function (res) {
      $scope.updateform = res.data;
    });
  }

  $scope.update = function () {
   // console.log("update method called");
    $http
      .post("http://localhost:3000/update", {
        username: $scope.updateform.username,
        password: $scope.updateform.password,
        firstname: $scope.updateform.firstname,
        lastname: $scope.updateform.lastname,
        email: $scope.updateform.email,
        phone: $scope.updateform.phone,
        location: $scope.updateform.location
      })
      .then(function (res) {
        if (res) {
          $scope.updateform = res.data;
          //alert("updated succesfully");
          $location.url("/");
        } else {
          alert("failed !!");
        }
      })
      .catch(() => {
        console.log(" request failed");
      });
  };
});


app.controller("loginController", function (
  $scope,
  $http,
  $location
) {

  $scope.$emit('login', {});

  sessionStorage.loggedin = false;
  sessionStorage.user = undefined;
  $scope.login = function () {
    $http
      .post("http://localhost:3000/login", {
        loginform: $scope.loginform
      })
      .then(function (res) {
        if (res) {
          $location.url("/");
          sessionStorage.loggedin = true;
          sessionStorage.user = res.data.username;
        } else {
          alert("incorrect username and password");
        }
      })
      .catch(() => {
        console.log("login request failed");
      });
  };
});

app.controller("logoutController", function ($location) {
  sessionStorage.loggedin = false;
  sessionStorage.user = undefined;
  $location.url('/');
});

app.controller("registerController", function (
  $scope,
  $http,
  $location,
  $rootScope
) {

  $scope.$emit('register', {});
  sessionStorage.loggedin = false;
  sessionStorage.user = null;

  $scope.register = function () {
    $http
      .post("http://localhost:3000/register", {
        registerform: $scope.registerform
      })
      .then(function (res) {
        //console.log(res);
        if (res.data == true) {
          $location.url("/login");
        } else {
          alert("registration failed");
        }
      })
      .error(() => {
        console.log("reg request failed");
      });
  };
});

app.controller("detailmsgController", function (authservice,$scope,$http,$location,$routeParams, getMessage) {
  authservice.checkUserStatus();
  $scope.$emit('singlemessage', {});
  //$scope.num = $routeParams.id;
  //console.log(getMessage);
  $scope.message = getMessage;
  $scope.num = getMessage._id;
  if ($scope.message.favorite == true) {
    $scope.favtrue = true;
  }else{
    $scope.favtrue = false;
  }
  //console.log($scope.num);

  // $http.get(`http://localhost:3000/msg/${$routeParams.id}`).then(function (res) {
  //   console.log(res.data);
  //   if (res.data.favorite == true) {
  //     $scope.favtrue = true;
  //   } else {
  //     $scope.favtrue = false;
  //   }
  //   $scope.message = res.data;

  // })
  $scope.delete = function (event) {
    var id = event.target.id;

    $http.get(`http://localhost:3000/delete/${id}`).then(function (res) {
      if (res.data) {
        $location.url('/messages');
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  $scope.replyOn = false;

  $scope.reply = function (event) {

    $scope.replyOn = true;
  }


  $scope.sendmessage = function (event) {
    var id = event.target.id;
    $http.post(`http://localhost:3000/sendreply/${id}`, {
      reply: $scope.newreply
    }).then(function (res) {
      if (res.data) {
        if (res.data.favorite == true) {
          $scope.favtrue = true;
        } else {
          $scope.favtrue = false;
        }
        $scope.message = res.data;
        //console.log($scope.message);
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  $scope.favorite = function (event) {
    var id = event.target.id;
    $http.get(`http://localhost:3000/favorite/${id}`).then(function (res) {
      if (res.data) {
        if (res.data.favorite == true) {
          $scope.favtrue = true;
        } else {
          $scope.favtrue = false;
        }
        $scope.message = res.data;
        //console.log($scope.message);
      }
    }).catch((err) => {
      console.log(err);
    })
  }


});
