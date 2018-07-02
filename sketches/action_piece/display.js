var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed
*/
socket.on('reload', function(piecename) {
  location.reload();
});

function showError(errId, errMsg) {
   alert('An error occured: ' + errId + ', ' + errMsg);
}

function patchInitialized() {
   // You can now access the patch object (CABLES.patch), register variable watchers and so on
   setInterval(function() {
      for (var i = 0; i < 8; i++) {
         var arr = [0, 0, 0];
         arr[0] = Math.random();
         arr[1] = Math.random();
         arr[2] = Math.random();
         CABLES.patch.setVariable("pointIndex",i);
         CABLES.patch.setVariable("pointPosition", arr);
         CABLES.patch.config.setPoint();
      }
   }, 2);
}

function patchFinishedLoading() {
   // The patch is ready now, all assets have been loaded
}

document.addEventListener('DOMContentLoaded', function(event) {
   CABLES.patch = new CABLES.Patch({
       patchFile: 'js/OST_test01.json',
       prefixAssetPath: '',
       glCanvasId: 'glcanvas',
       glCanvasResizeToWindow: true,
       onError: showError,
       onPatchLoaded: patchInitialized,
       onFinishedLoading: patchFinishedLoading,
   });
});


