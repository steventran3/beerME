 //Initialize Firebase
 var config = {
  apiKey: "AIzaSyBf63vOsiOcfJbUYOzGNNSO85ZGf9MyzJc",
  authDomain: "uci-bootcamp.firebaseapp.com",
  databaseURL: "https://uci-bootcamp.firebaseio.com",
  projectId: "uci-bootcamp",
  storageBucket: "uci-bootcamp.appspot.com",
  messagingSenderId: "290327709584"
};

firebase.initializeApp(config);
var database = firebase.database();


$('#results,#previous,.nav-hide').hide()


$(document).ready(function(){
  $('.btn').on('click', function(){
        // const client = filestack.init('ACvWqWhqT0uESSK94Rojtz');
        // client.pick();
        $('.current-match').empty()
        

        var fsClient = filestack.init('ACvWqWhqT0uESSK94Rojtz');


        function openPicker() {
          fsClient.pick({
            fromSources:["local_file_system","webcam","url"],
            accept:["image/*"]
          }).then(function(response) {       
            console.log(response);
            var img = response.filesUploaded[0].url
            var zipCode = $('#zipcode').val()
            var personName = $('#name').val()
            // Ajax call for Face++
            $.ajax({
              url:'https://api-us.faceplusplus.com/facepp/v3/detect?api_key=ymxM1PfpEkuIniAcXSR6o9tUFCk1Uqo4&api_secret=n6KLZyFDrjsbFycCzxBs-ifyTNuyjZf8&image_url='+img+'&return_attributes=age,gender,smiling,emotion,ethnicity,eyestatus',
              method: 'POST'
            }).done(function(results){
              console.log(results)
              
              var age = results.faces[0].attributes.age.value
              var happy = Math.round(results.faces[0].attributes.emotion.happiness) 
              var anger = Math.round(results.faces[0].attributes.emotion.anger)
              var sad = Math.round(results.faces[0].attributes.emotion.sadness)             
              
              // Ajax call for google lng & lat
              $.ajax({
                url:'https://maps.googleapis.com/maps/api/geocode/json?address='+zipCode+'&key=AIzaSyAH9tIVsJmQ37qrU7b3NY3smmAtUmCrgIs',
                method: 'GET'
              }).done(function(zip){
                //console.log(zip)
                
                var lat = zip.results[0].geometry.bounds.northeast.lat
                var lng = zip.results[0].geometry.bounds.northeast.lng
                $.ajax({
                  url:'https://cors-anywhere.herokuapp.com/http://api.brewerydb.com/v2/search/geo/point?lat='+lat+'&lng='+lng+'&key=9ec4dd555b05addcdc32bc600a2dd1f2&unit=mi&format=json',
                  method: 'GET'
                }).done(function(response){
                  console.log(response)
                  var brewery = response.data
                  function randomBrew(){
                    var check = false;
                    
                    while (check === false) {
                      var random = brewery[Math.floor(Math.random() * brewery.length)];
                      console.log(random);
                      if (random.phone != undefined && random.brewery.images != undefined) {
                        check = true;
                      }
                    }
                    var breweryName = random.brewery.name
                    var address = random.streetAddress
                    var city = random.locality
                    var phone = random.phone
                    var website = random.brewery.website
                    var img = random.brewery.images.medium
                    
                    // Pushing to database
                    var breweryData = {
                      breweryName: breweryName,
                      address: address,
                      city: city,
                      phone: phone,
                      website: website,
                      img: img,
                    };
                    database.ref().push(breweryData)
                    var newBrew = {
                      'card': [{
                        'image-url': img,
                        'card_title': breweryName,
                        'card_subtitle': 'Address: '+address+'<br>City: '+city+'<br>Phone: '+phone+'<br>Website: '+website,
                      }]
                    }
                    $.each(newBrew.card, function (key,data){
                      console.log(data);
                      $('.current-match').append('<div class="content col s12 m6 l6" >'+'<div class="card"><div class="card-image"><img src="' + data['image-url'] + '"></div>'+'<div class="card-content">'+'<span class="card-title grey-text text-darken-4">' + data.card_title + '</span>'+'<p class="card-subtitle grey-text text-darken-2">' + data.card_subtitle + '</p>'+'</div></div></div>');
                    }) 
                    $('#zipcode').val('')
                    $('#name').val('')
                    $('#results,#previous,.nav-hide').show()
                  }
                  var person = {
                    'card': [{
                      'image-url': img,
                      'card_title': personName,
                      'card_subtitle': 'Age: '+age+'<br>Happy: '+happy+'%'+'<br>Anger: '+anger+'%'+'<br>Sad: '+sad+'%',         
                    }]
                  };
                  $.each(person.card, function (key,data){
                    console.log(data);
                    $('.current-match').append('<div class="content col s12 m6 l6" >'+'<div class="card"><div class="card-image"><img src="' + data['image-url'] + '"></div>'+'<div class="card-content">'+'<span class="card-title grey-text text-darken-4">' + data.card_title + '</span>'+'<p class="card-subtitle grey-text text-darken-2">' + data.card_subtitle + '</p>'+'</div></div></div>');
                  })
                  randomBrew()
                  
                })
              })
            })
          })
        }
      openPicker();        
    });
      // Pull from database and displaying on website 
      database.ref().on('child_added', function(childSnapshot, prevChildKey){
        console.log(childSnapshot.val());
        var breweryName = childSnapshot.val().breweryName
        var address = childSnapshot.val().address
        var city = childSnapshot.val().city
        var phone = childSnapshot.val().phone
        var website = childSnapshot.val().website
        var img = childSnapshot.val().img
        var newBrew = {
          'card': [{
            'image-url': img,
            'card_title': breweryName,
            'card_subtitle': 'Address: '+address+'<br>City: '+city+'<br>Phone: '+phone+'<br>Website: '+website,          
          }]
        }
        $.each(newBrew.card, function (key,data){
          console.log(data);
          $('.prev_match').append('<div class="content col s12 m3 l3" >'+'<div class="card area"><div class="card-image"><img src="' + data['image-url'] + '"></div>'+'<div class="card-content">'+'<span class="card-title grey-text text-darken-4">' + data.card_title + '</span>'+'<p class="card-subtitle grey-text text-darken-2">' + data.card_subtitle + '</p>'+'</div></div></div>');
        }) 
     });

    });