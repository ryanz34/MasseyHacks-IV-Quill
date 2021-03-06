angular.module('reg')
  .controller('DashboardCtrl', [
    '$rootScope',
    '$scope',
    '$sce',
    '$http',
    'currentUser',
    'settings',
    'Utils',
    'AuthService',
    'UserService',
    'EVENT_INFO',
    'DASHBOARD',
    function($rootScope, $scope, $sce, $http, currentUser, settings, Utils, AuthService, UserService, DASHBOARD){
      var Settings = settings.data;
      var user = currentUser.data;
      $scope.user = user;
      $scope.Settings = Settings;
      $scope.classAmount = Utils.getAcceptedreimbAmount(user, Settings);
      $scope.DASHBOARD = DASHBOARD;
      $scope.Utils = Utils;

      //console.log(user);

      for (var msg in $scope.DASHBOARD) {
        if ($scope.DASHBOARD[msg].includes('[APP_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[APP_DEADLINE]', Utils.formatTime(Settings.timeClose));
        }
        if ($scope.DASHBOARD[msg].includes('[CONFIRM_DEADLINE]')) {
          $scope.DASHBOARD[msg] = $scope.DASHBOARD[msg].replace('[CONFIRM_DEADLINE]', Utils.formatTime(user.status.confirmBy));
        }
      }
      
      //icon tooltip popup
      $('.icon')
      .popup({
        on: 'hover'
      });

      // Is registration open?
      var regIsOpen = $scope.regIsOpen = Utils.isRegOpen(Settings);

      // Is it past the user's confirmation time?
      var pastConfirmation = $scope.pastConfirmation = Utils.isAfter(user.status.confirmBy);

      $scope.dashState = function(status){
        var user = $scope.user;

        switch (status) {
          case 'unverified':
            return !user.verified;
          case 'openAndIncomplete':
            return regIsOpen && user.verified && !user.status.completedProfile;
          case 'submitted':
            return user.status.completedProfile && !user.status.admitted && !(user.status.rejected) && !(user.status.waitlisted);
          case 'closedAndIncomplete':
            return !regIsOpen && !user.status.completedProfile && !user.status.admitted &&
            !(user.status.rejected);
          case 'waitlisted': // Waitlisted State [no ur bad mit]
            return user.status.completedProfile && !user.status.admitted && !(user.status.rejected) && user.status.waitlisted;
          case 'admittedAndCanConfirm':
            return !pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'admittedAndCannotConfirm':
            return pastConfirmation &&
              user.status.admitted &&
              !user.status.confirmed &&
              !user.status.declined;
          case 'confirmed':
            return user.status.admitted && user.status.confirmed && !user.status.declined;
          case 'declined':
            return user.status.declined;
          case 'reviewed':
            return user.status.rejected;
        }
        return false;
      };
    
      $scope.showWaitlist = !regIsOpen && user.status.completedProfile && !user.status.admitted && !user.status.rejected;

      $scope.resendEmail = function(){
        AuthService
          .resendVerificationEmail()
          .then(function(){
            sweetAlert('Your email has been sent.');
          });
      };

      // -----------------------------------------------------
      // Text!
      // -----------------------------------------------------
      var converter = new showdown.Converter();
      $scope.acceptanceText = $sce.trustAsHtml(converter.makeHtml(Settings.acceptanceText));
      $scope.confirmationText = $sce.trustAsHtml(converter.makeHtml(Settings.confirmationText));
      $scope.waitlistText = $sce.trustAsHtml(converter.makeHtml(Settings.waitlistText));

      $scope.getWaiver = function() {
          sweetAlert({
              title: 'Notice',
              showCancelButton: true,
              html:true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: $(window).width() > 400 ? "Continue to HelloSign" : "Continue",
              text: 'MasseyHacks reserves the right to revoke admission if any false and/or incorrect information is submitted on the waiver.<br><br>If you do not want to e-sign, you can bring in the <a style="color: #0A1939" href="https://mh4.masseyhacks.ca/waiver" target="_blank"><b>hardcopy</b></a> to the registration desk on the day of the event.',
              type: $(window).width() > 400 ? 'warning' : ''
          }, function () {
              window.open('https://app.hellosign.com/s/8504f209','_blank');
          });
      }

      $scope.inviteToSlack = function() {

          UserService.inviteToSlack(user._id)
              .success(function(){
              sweetAlert({
                  title: "Woo!",
                  text: "Please check your email for the invitation!\n(" + user.email+ ")",
                  type: "success",
                  confirmButtonColor: "#5ABECF"
              })
          })
          .error(function(res){
              swal({title:"Uh oh!", text: res + "\n\nFeel free to contact us at hello@masseyhacks.ca for further assistance.", type:"error"});
          });
      }

      $scope.declineAdmission = function(){

        swal({
          title: "Whoa!",
          text: "Are you sure you would like to decline your admission? \n\n You can't go back!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, I can't make it.",
          closeOnConfirm: true
          }, function(){

            UserService
              .declineAdmission(user._id)
              .success(function(user){
                $rootScope.currentUser = user;
                $scope.user = user;
                location.reload();
              });
        });
      };

      $scope.checkStatus = function() {
        if(user.status.rejected){
          return 'Reviewed';
        }
        if(user.volunteer){
          return 'Organizer';
        }
        return user.status.name;
      };
      //QR
      /*$scope.getQRCode = function(id){
        if($scope.user.status.confirmed){
          $http.get('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + id)
          .then(function(response){
            //console.log(response.data)
            document.getElementById('QRContainer').innerHTML = response.data;
          });
        }
      };*/

      $scope.qr = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=H&data=' + $scope.user.id
      //$scope.getQRCode($scope.user.id);

      var confettiActivate = function() {
        var frameRate = 30;
        var dt = 1.0 / frameRate;
        var DEG_TO_RAD = Math.PI / 180;
        var RAD_TO_DEG = 180 / Math.PI;
        var colors = [
          ["#df0049", "#660671"],
          ["#00e857", "#005291"],
          ["#2bebbc", "#05798a"],
          ["#ffd200", "#b06c00"]
        ];

        function Vector2(_x, _y) {
          this.x = _x, this.y = _y;
          this.Length = function() {
            return Math.sqrt(this.SqrLength());
          }
          this.SqrLength = function() {
            return this.x * this.x + this.y * this.y;
          }
          this.Equals = function(_vec0, _vec1) {
            return _vec0.x == _vec1.x && _vec0.y == _vec1.y;
          }
          this.Add = function(_vec) {
            this.x += _vec.x;
            this.y += _vec.y;
          }
          this.Sub = function(_vec) {
            this.x -= _vec.x;
            this.y -= _vec.y;
          }
          this.Div = function(_f) {
            this.x /= _f;
            this.y /= _f;
          }
          this.Mul = function(_f) {
            this.x *= _f;
            this.y *= _f;
          }
          this.Normalize = function() {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
              var factor = 1.0 / Math.sqrt(sqrLen);
              this.x *= factor;
              this.y *= factor;
            }
          }
          this.Normalized = function() {
            var sqrLen = this.SqrLength();
            if (sqrLen != 0) {
              var factor = 1.0 / Math.sqrt(sqrLen);
              return new Vector2(this.x * factor, this.y * factor);
            }
            return new Vector2(0, 0);
          }
        }
        Vector2.Lerp = function(_vec0, _vec1, _t) {
          return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
        }
        Vector2.Distance = function(_vec0, _vec1) {
          return Math.sqrt(Vector2.SqrDistance(_vec0, _vec1));
        }
        Vector2.SqrDistance = function(_vec0, _vec1) {
          var x = _vec0.x - _vec1.x;
          var y = _vec0.y - _vec1.y;
          return (x * x + y * y + z * z);
        }
        Vector2.Scale = function(_vec0, _vec1) {
          return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
        }
        Vector2.Min = function(_vec0, _vec1) {
          return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
        }
        Vector2.Max = function(_vec0, _vec1) {
          return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
        }
        Vector2.ClampMagnitude = function(_vec0, _len) {
          var vecNorm = _vec0.Normalized;
          return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
        }
        Vector2.Sub = function(_vec0, _vec1) {
          return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
        }

        function EulerMass(_x, _y, _mass, _drag) {
          this.position = new Vector2(_x, _y);
          this.mass = _mass;
          this.drag = _drag;
          this.force = new Vector2(0, 0);
          this.velocity = new Vector2(0, 0);
          this.AddForce = function(_f) {
            this.force.Add(_f);
          }
          this.Integrate = function(_dt) {
            var acc = this.CurrentForce(this.position);
            acc.Div(this.mass);
            var posDelta = new Vector2(this.velocity.x, this.velocity.y);
            posDelta.Mul(_dt);
            this.position.Add(posDelta);
            acc.Mul(_dt);
            this.velocity.Add(acc);
            this.force = new Vector2(0, 0);
          }
          this.CurrentForce = function(_pos, _vel) {
            var totalForce = new Vector2(this.force.x, this.force.y);
            var speed = this.velocity.Length();
            var dragVel = new Vector2(this.velocity.x, this.velocity.y);
            dragVel.Mul(this.drag * this.mass * speed);
            totalForce.Sub(dragVel);
            return totalForce;
          }
        }

        function ConfettiPaper(_x, _y) {
          this.pos = new Vector2(_x, _y);
          this.rotationSpeed = Math.random() * 600 + 800;
          this.angle = DEG_TO_RAD * Math.random() * 360;
          this.rotation = DEG_TO_RAD * Math.random() * 360;
          this.cosA = 1.0;
          this.size = 5.0;
          this.oscillationSpeed = Math.random() * 1.5 + 0.5;
          this.xSpeed = 40.0;
          this.ySpeed = Math.random() * 60 + 50.0;
          this.corners = new Array();
          this.time = Math.random();
          var ci = Math.round(Math.random() * (colors.length - 1));
          this.frontColor = colors[ci][0];
          this.backColor = colors[ci][1];
          for (var i = 0; i < 4; i++) {
            var dx = Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
            var dy = Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
            this.corners[i] = new Vector2(dx, dy);
          }
          this.Update = function(_dt, reset) {
            this.time += _dt;
            this.rotation += this.rotationSpeed * _dt;
            this.cosA = Math.cos(DEG_TO_RAD * this.rotation);
            this.pos.x += Math.cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
            this.pos.y += this.ySpeed * _dt;
            if (this.pos.y > ConfettiPaper.bounds.y && reset) {
              this.pos.x = Math.random() * ConfettiPaper.bounds.x;
              this.pos.y = 0;
            }
          }
          this.Draw = function(_g) {
            if (this.cosA > 0) {
              _g.fillStyle = this.frontColor;
            } else {
              _g.fillStyle = this.backColor;
            }
            _g.beginPath();
            _g.moveTo(this.pos.x + this.corners[0].x * this.size, this.pos.y + this.corners[0].y * this.size * this.cosA);
            for (var i = 1; i < 4; i++) {
              _g.lineTo(this.pos.x + this.corners[i].x * this.size, this.pos.y + this.corners[i].y * this.size * this.cosA);
            }
            _g.closePath();
            _g.fill();
          }
        }
        ConfettiPaper.bounds = new Vector2(0, 0);

        function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
          this.particleDist = _dist;
          this.particleCount = _count;
          this.particleMass = _mass;
          this.particleDrag = _drag;
          this.particles = new Array();
          var ci = Math.round(Math.random() * (colors.length - 1));
          this.frontColor = colors[ci][0];
          this.backColor = colors[ci][1];
          this.xOff = Math.cos(DEG_TO_RAD * _angle) * _thickness;
          this.yOff = Math.sin(DEG_TO_RAD * _angle) * _thickness;
          this.position = new Vector2(_x, _y);
          this.prevPosition = new Vector2(_x, _y);
          this.velocityInherit = Math.random() * 2 + 4;
          this.time = Math.random() * 100;
          this.oscillationSpeed = Math.random() * 2 + 2;
          this.oscillationDistance = Math.random() * 40 + 40;
          this.ySpeed = Math.random() * 40 + 80;
          for (var i = 0; i < this.particleCount; i++) {
            this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
          }
          this.Update = function(_dt, reset) {
            var i = 0;
            this.time += _dt * this.oscillationSpeed;
            this.position.y += this.ySpeed * _dt;
            this.position.x += Math.cos(this.time) * this.oscillationDistance * _dt;
            this.particles[0].position = this.position;
            var dX = this.prevPosition.x - this.position.x;
            var dY = this.prevPosition.y - this.position.y;
            var delta = Math.sqrt(dX * dX + dY * dY);
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            for (i = 1; i < this.particleCount; i++) {
              var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
              dirP.Normalize();
              dirP.Mul((delta / _dt) * this.velocityInherit);
              this.particles[i].AddForce(dirP);
            }
            for (i = 1; i < this.particleCount; i++) {
              this.particles[i].Integrate(_dt);
            }
            for (i = 1; i < this.particleCount; i++) {
              var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
              rp2.Sub(this.particles[i - 1].position);
              rp2.Normalize();
              rp2.Mul(this.particleDist);
              rp2.Add(this.particles[i - 1].position);
              this.particles[i].position = rp2;
            }
            if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount && reset) {
              this.Reset();
            }
          }
          this.Reset = function() {
            this.position.y = -Math.random() * ConfettiRibbon.bounds.y;
            this.position.x = Math.random() * ConfettiRibbon.bounds.x;
            this.prevPosition = new Vector2(this.position.x, this.position.y);
            this.velocityInherit = Math.random() * 2 + 4;
            this.time = Math.random() * 100;
            this.oscillationSpeed = Math.random() * 2.0 + 1.5;
            this.oscillationDistance = Math.random() * 40 + 40;
            this.ySpeed = Math.random() * 40 + 80;
            var ci = Math.round(Math.random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.particles = new Array();
            for (var i = 0; i < this.particleCount; i++) {
              this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
          }
          this.Draw = function(_g) {
            for (var i = 0; i < this.particleCount - 1; i++) {
              var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
              var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
              if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                _g.fillStyle = this.frontColor;
                _g.strokeStyle = this.frontColor;
              } else {
                _g.fillStyle = this.backColor;
                _g.strokeStyle = this.backColor;
              }
              if (i == 0) {
                _g.beginPath();
                _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                _g.closePath();
                _g.stroke();
                _g.fill();
                _g.beginPath();
                _g.moveTo(p1.x, p1.y);
                _g.lineTo(p0.x, p0.y);
                _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                _g.closePath();
                _g.stroke();
                _g.fill();
              } else if (i == this.particleCount - 2) {
                _g.beginPath();
                _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                _g.closePath();
                _g.stroke();
                _g.fill();
                _g.beginPath();
                _g.moveTo(p1.x, p1.y);
                _g.lineTo(p0.x, p0.y);
                _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                _g.closePath();
                _g.stroke();
                _g.fill();
              } else {
                _g.beginPath();
                _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                _g.lineTo(p1.x, p1.y);
                _g.lineTo(p0.x, p0.y);
                _g.closePath();
                _g.stroke();
                _g.fill();
              }
            }
          }
          this.Side = function(x1, y1, x2, y2, x3, y3) {
            return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
          }

          this.onScreen = function() {
            return this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount;
          }
        }
        ConfettiRibbon.bounds = new Vector2(0, 0);
        confetti = {};
        confetti.Context = function(parent) {
          var i = 0;
          var canvasParent = document.getElementById(parent);
          var canvas = document.createElement('canvas');
          canvas.width = canvasParent.offsetWidth;
          canvas.height = canvasParent.offsetHeight;
          canvasParent.appendChild(canvas);
          var context = canvas.getContext('2d');
          var interval = null;
          var confettiRibbonCount = 7;
          var rpCount = 30;
          var rpDist = 8.0;
          var rpThick = 8.0;
          var confettiRibbons = new Array();
          this.reset = true;
          ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
          for (i = 0; i < confettiRibbonCount; i++) {
            confettiRibbons[i] = new ConfettiRibbon(Math.random() * canvas.width, -Math.random() * canvas.height * 2, rpCount, rpDist, rpThick, 45, 1, 0.05);
          }
          var confettiPaperCount = 25;
          var confettiPapers = new Array();
          ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
          for (i = 0; i < confettiPaperCount; i++) {
            confettiPapers[i] = new ConfettiPaper(Math.random() * canvas.width, Math.random() * canvas.height);
          }
          this.resize = function() {
            canvas.width = canvasParent.offsetWidth;
            canvas.height = canvasParent.offsetHeight;
            ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
            ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
          }
          this.start = function() {
            this.stop()
            var context = this
            this.interval = setInterval(function() {
              confetti.update();
            }, 1000.0 / frameRate)
          }
          this.stop = function() {
            clearInterval(this.interval);
          }
          this.update = function() {
            var i = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            var clearParticles = [];
            for (i = 0; i < confettiPaperCount; i++) {
              confettiPapers[i].Update(dt, this.reset);
              confettiPapers[i].Draw(context);

              if (confettiPapers[i].pos.y > ConfettiPaper.bounds.y && !this.reset) {
                clearParticles.push(i);
              }
            }

            for (i = 0; i < clearParticles.length; i++) {
              confettiPapers.slice(clearParticles[i]-i, 1);
              confettiPaperCount -= 1;
            }

            clearParticles = [];

            for (i = 0; i < confettiRibbonCount; i++) {
              confettiRibbons[i].Update(dt, this.reset);
              confettiRibbons[i].Draw(context);

              if (confettiRibbons[i].onScreen() && !this.reset) {
                clearParticles.push(i);
              }
            }

            for (i = 0; i < clearParticles.length; i++) {
              confettiRibbons.slice(clearParticles[i]-i, 1);
              confettiRibbonCount -= 1;
            }

            if (confettiPaperCount === 0 && confettiRibbonCount == 0) {
              this.stop();
            }
          }
        }
        var confetti = new confetti.Context('confetti');
        confetti.start();
        $(window).resize(function() {
          confetti.resize();
        });

        return confetti;
      }

      if (user.status.admitted && !user.status.rejected && !user.status.declined && !user.volunteer &&!$scope.dashState('admittedAndCannotConfirm')){
        $scope.cf = confettiActivate();

        $scope.timer = setInterval(function () {
          $scope.cf.reset = false;
          clearInterval($scope.timer);
        }, 3000);


      }
    }]);

