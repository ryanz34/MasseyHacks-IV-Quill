angular.module('reg')
  .factory('SettingsService', [
  '$http',
  function($http){

    var base = '/api/settings/';

    return {
      getPublicSettings: function(){
        return $http.get(base);
      },
      getPrivateSettings: function(){
          return $http.get('/api/settingsPrivate/');
      },
      updateRegistrationTimes: function(open, close){
        return $http.put(base + 'times', {
          timeOpen: open,
          timeClose: close,
        });
      },
      updateConfirmationTime: function(time){
        return $http.put(base + 'confirm-by', {
          time: time
        });
      },
      updateTRTime: function(time){
        return $http.put(base + 'tr-by', {
          time: time
        });
      },
      getWhitelistedEmails: function(){
        return $http.get(base + 'whitelist');
      },
      updateWhitelistedEmails: function(emails){
        return $http.put(base + 'whitelist', {
          emails: emails
        });
      },
      updateWaitlistText: function(text){
        return $http.put(base + 'waitlist', {
          text: text
        });
      },
      updateAcceptanceText: function(text){
        return $http.put(base + 'acceptance', {
          text: text
        });
      },
      updateParticipantCount: function(participants){
        return $http.put(base + 'participants', {
          participants: participants
        })
      },
      addSchool: function(text){
        return $http.put(base + 'addschool', {
          school: text
        });
      },
      updateConfirmationText: function(text){
        return $http.put(base + 'confirmation', {
          text: text
        });
      },
      updateReimbClasses: function(reimbClasses){
        return $http.put(base + 'reimbClasses', {
          reimbClasses: reimbClasses
        });
      },
      updateWave: function(data, num) {
        return $http.put(base + 'updateWave', {
          waveNum: num,
          data: data
        });
      }
    };

  }
  ]);
