    $(document).ready(function(){


      $('.btn').on('click', function(){
        // const client = filestack.init('ACvWqWhqT0uESSK94Rojtz');
        // client.pick();
        
        var fsClient = filestack.init('ACvWqWhqT0uESSK94Rojtz');
        
        function openPicker() {
          fsClient.pick({
            fromSources:["local_file_system","webcam","url"],
            accept:["image/*"]
          }).then(function(response) {       
            console.log(response);

            var img = response.filesUploaded[0].url
            var zipCode = $('#zipcode').val()
            var name = $('#name').val()

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
                    random = brewery[Math.floor(Math.random() * brewery.length)];
                    console.log(random)

                    var name = random.brewery.name
                    var address = random.streetAddress
                    var city = random.locality
                    var phone = random.phone
                    var website = random.brewery.website
                    var img = random.brewery.images.medium

                    var newBrew = {
                      'card': [{
                        'group': ['class1', 'class2'],
                        'image-url': img,
                        'card_title': name,
                        'card_subtitle': 'Address: '+address+'<br>City: '+city+'<br>Phone: '+phone+'<br>Website: '+website,
                        'badge': ['hot','win'],
                      }]
                    }
                    $.each(newBrew.card, function (key,data){
                        console.log(data);
                        $('#results').append('<div class="content col s12 m4 l4" >'+'<div class="card"><div class="card-image"><img src="' + data['image-url'] + '"></div>'+'<div class="card-content">'+'<span class="card-title grey-text text-darken-4">' + data.card_title + '</span>'+'<p class="card-subtitle grey-text text-darken-2">' + data.card_subtitle + '</p>'+'</div></div></div>');
                      }) 
                  }

                    var person = {
                      'card': [{
                        'group': ['class1', 'class2'],
                        'image-url': img,
                        'card_title': name,
                        'card_subtitle': 'Age: '+age+'<br>Happy: '+happy+'%'+'<br>Anger: '+anger+'%'+'<br>Sad: '+sad+'%',
                        "badge": ["hot", "win"],         
                      }]
                    };

                    $.each(person.card, function (key,data){
                      console.log(data);
                      $('#results').append('<div class="content col s12 m4 l4" >'+'<div class="card"><div class="card-image"><img src="' + data['image-url'] + '"></div>'+'<div class="card-content">'+'<span class="card-title grey-text text-darken-4">' + data.card_title + '</span>'+'<p class="card-subtitle grey-text text-darken-2">' + data.card_subtitle + '</p>'+'</div></div></div>');
                    })

                  randomBrew()
                })
              })
            })
          })
  }
  openPicker();        
});
  });









