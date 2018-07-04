var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});

var config = {
	maxInputTime: 2500,
   maxOffCount: 80*3
}

var Phone = class Phone {
	constructor(data) {
   	this.id = data.id;
		this.status = 'default'
		this.lastInput = 0;
	}

	pushPoint(point) {
		this.lastInput = new Date().getTime();
  		this.point = [point.x * 2, point.y *2, 0];
	}

   update(now) {
      if (now > this.lastInput + config.maxInputTime) {
         this.status = 'death'
         assignPoints();
      }
   }

   setBusy() {
      socket.emit('dataChannel3', {
         'topic': 'busy',
         'to': this.id,
      });
   }

   acceptRequest() {
      socket.emit('dataChannel3', {
         'topic': 'accepted',
         'to': this.id,
      });
   }

   disconnect() {
      socket.emit('dataChannel3', {
         'topic': 'disconnected',
         'to': this.id,
      });
   }
};

var Point = class Point {
   constructor(i) {
      this.i = i;
      this.deathPoint = [
         (Math.sin(i/20.0) - .5)*1.4,
         (Math.cos(i/20.0) - .5)*1.4,
         5
      ];
      this.lastPoint = [0,0,0];

      this.removePhone();
   }

   assignPhone(phone) {
      this.phone = phone;
      this.phone.status = 'assigned';
      this.callUpdate = this._update;
      this.callUpload = this._upload;
   }

   removePhone() {
      this.phone = undefined;
      this.offCount = 0;
      this.callUpdate = this._updateOff;
      this.callUpload = this._uploadOff;
   }

   // instead of 'if' -> pointer to function
	update(now) { this.callUpdate(now); }
	upload() { this.callUpload(); }

   _updateOff(now) {
   }

   _uploadOff() {
      if(this.offCount < config.maxOffCount) {

         this.lastPoint = interpolate(this.lastPoint, this.deathPoint, 0.03);
         CABLES.patch.setVariable("pointIndex", this.i);
         CABLES.patch.setVariable("pointPosition", this.lastPoint);
         CABLES.patch.config.setPoint();

         this.offCount++;
      }
   }

   _update(now) {
      if (this.phone.lastInput != 0) {
         try {
            this.phone.update(now);

            var targetpoint = this.phone.point
         } catch (e) {
            var targetpoint = this.lastPoint;
         }

         //calculate z
         targetpoint[2] = Math.sin( (100 * this.i + now) / 1000.0 );

         // interpolate for a smoth movment
         this.lastPoint = interpolate(this.lastPoint, targetpoint, .3);
      }
   }

	_upload() {
		CABLES.patch.setVariable("pointIndex", this.i);
		CABLES.patch.setVariable("pointPosition", this.lastPoint);
		CABLES.patch.config.setPoint();
	}

}

var phones = {};

var points = [];
for (var i = 0; i < 8; i++)
   points.push(new Point(i));


var activePoints = [];


// get phones
socket.on('dataChannel3', function(data) {
   if (data.topic == 'request') {
		var phone = new Phone(data);
		phones[phone.id] = phone;

		assignPoints();
      
      var found = false;
      for(var i in points) {
         if (points[i].phone != undefined && points[i].phone.id === phone.id) {
            found = true;
            break;
         }
      }
      if (!found)
         phone.setBusy();
   }
});

socket.on('dataChannel1', function(data) {
   if (data.topic == 'point' && phones[data.id] != undefined) {
      phones[data.id].pushPoint(data.point);
   }
});

function showError(errId, errMsg) {
   alert('An error occured: ' + errId + ', ' + errMsg);
}

function patchInitialized() {
   // You can now access the patch object (CABLES.patch), register variable watchers and so on
}

function patchFinishedLoading() {
   // The patch is ready now, all assets have been loaded
	updatePatch();
}

function interpolate(a, b, frac) {
    var nx = a[0] + (b[0] - a[0]) * frac;
    var ny = a[1] + (b[1] - a[1]) * frac;
    var nz = a[2] + (b[2] - a[2]) * frac;
    return [nx, ny, nz];
}

function assignPoints() {
   activePoints = [];

	// clean death points
   for (var i in points) {
      var point = points[i];
      var phone = point.phone;
      if (phone != undefined) {
         if (phone.status === 'death') {
            point.removePhone();
            phone.disconnect();
         } else {
            activePoints.push(parseInt(i));
         }
      } else {

         var found = false;
         for (var id in phones) {
            if (phones.hasOwnProperty(id)) {
               if(phones[id].status == 'default') {
                  found = true;
                  break;
               }
            }
         }
         if (found) {
            point.assignPhone(phones[id]);
            phones[id].acceptRequest();
            activePoints.push(parseInt(i));
         }

      }
   }

   CABLES.patch.setVariable("activePoints", activePoints);
}

function updatePatch() {
   // loop
	window.requestAnimationFrame( updatePatch );

   var now = new Date().getTime();

   for (var i in points) {
      var point = points[i];
      point.update(now);
      point.upload(i)
   }
}

// init CABLES path
CABLES.patch = new CABLES.Patch({
	 patchFile: 'cables_OST_action-io/js/OST_action-io.json',
	 prefixAssetPath: '',
	 glCanvasId: 'glcanvas',
	 glCanvasResizeToWindow: true,
	 onError: showError,
	 onPatchLoaded: patchInitialized,
	 onFinishedLoading: patchFinishedLoading,
});

