var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed
*/
socket.on('reload', function(piecename) {
  location.reload();
});

var phones = {};
var phonePoints = []; 

// get phones
socket.on('dataChannel3', function(data) {
   if (data.topic == 'request') {
      phones[data.id] = {id: data.id}
      if (phonePoints.length <= 8) {
         phonePoints.push( phones[data.id].id );
         socket.emit('dataChannel3', {
            'topic': 'accepted',
            'to': phones[data.id].id,
         });
      } else
         socket.emit('dataChannel3', {
            'topic': 'busy',
            'to': phones[data.id].id,
         });
   }
});

socket.on('dataChannel1', function(data) {
   if (data.topic == 'point' && phones[data.id] != undefined) {
      phones[data.id].point = data.point
      //CABLES.patch.setVariable("pointIndex", 0);
      //CABLES.patch.setVariable("pointPosition", [data.point.x, data.point.y, Math.sin(new Date().getTime()/1000.0)]);
      //CABLES.patch.config.setPoint();
   }
});


// TODO: save all connection in array,
// Use only 8 first ones and queue the rest.
// on dissconnect, rearange

function showError(errId, errMsg) {
   alert('An error occured: ' + errId + ', ' + errMsg);
}

function patchInitialized() {
   // You can now access the patch object (CABLES.patch), register variable watchers and so on
   setInterval(function() {
      for (var i in phonePoints) {
         var id = phonePoints[i];
         var phone = phones[id];
         if (phone.point != undefined) {
            var point = [phone.point.x, phone.point.y];
            point[2] = Math.sin(new Date().getTime()/1000.0);
            CABLES.patch.setVariable("pointIndex", i);
            CABLES.patch.setVariable("pointPosition", point);
            CABLES.patch.config.setPoint();
         }
      }
   }, 1);
}

function patchFinishedLoading() {
   // The patch is ready now, all assets have been loaded
}


//document.addEventListener('DOMContentLoaded', function(event) {
   CABLES.patch = new CABLES.Patch({
       patchFile: 'js/OST_test01.json',
       prefixAssetPath: '',
       glCanvasId: 'glcanvas',
       glCanvasResizeToWindow: true,
       onError: showError,
       onPatchLoaded: patchInitialized,
       onFinishedLoading: patchFinishedLoading,
   });
//});


