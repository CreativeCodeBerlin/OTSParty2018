# OTSParty2018
Code for the 2018 OpenTechSchool anniversary party at Spektrum Berlin



Install

```bash
$ npm install
```

Run

```bash
$ npm start
```



#### Sketches

All sketches are allocated under the **sketches** folder at the root directory of the project.
Each sketch should be self wrapped in his own directory.

The sketch runs in his own directory. All the files and assets can be called with a relative path and loaded also from subdirectories.

```bash
mySketch
  |- phone.html
  |- display.html
  - scripts
  |		|- myVisuals.js
  |		|- phoneInteraction.js
  |- styles
  |		|- mainStyle.css
  |- images
  |		|- background.png
```


The server automatically responses with the **phone.html** file when any client connects to the server. To display the visuals, the server sends the **display.html** file instead.

There are common libraries included on the project under the '/libs' path.
If you want, you can directly use them instead of include them on your project once again.

The projects counts with the following librarie:

- `/libs/socket.io.js` | the client
- `/libs/jquery.js`
- `/libs/p5.js` | p5js + p5doom and p5sound



To communicate the phones with the visuals on the display, the server provides an implementation of websockets.

There are 3 channels to send data through sockets. <u>You can use them as you want</u>.
For example, you can use one channel to send sensor data from the phone to the visuals,another channel to trigger events and the last one for communicating with other phones on the network.

* `dataChannel1`
* `dataChannel2`
* `dataChannel3`