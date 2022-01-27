

var ws = new WebSocket('wss://' + location.host + '/anaglyph');
var ws2 = new WebSocket('wss://' + location.host + '/anaglyph');
var videoInput1;
var videoOutput1;
var videoInput2;
var videoOutput2;
var webRtcPeer;
var webRtcPeer2;
var state = null;
var state2 = null;

const I_CAN_START = 0;
const I_CAN_STOP = 1;
const I_AM_STARTING = 2;

window.onload = function() {
	console.log("Page loaded ...");
	console = new Console('console', console);
	videoInput1 = document.getElementById('videoInput1');
	videoOutput1 = document.getElementById('videoOutput1');
	videoInput2 = document.getElementById('videoInput2');
	videoOutput2 = document.getElementById('videoOutput2');
	setState(I_CAN_START);
	setState2(I_CAN_START);
}

window.onbeforeunload = function() {
	ws.close();
	ws2.close();
}

ws.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
	case 'startResponse':
		startResponse(parsedMessage);
		break;
	case 'iceCandidate':
	    webRtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
        if (!error) return;
	      console.error("Error adding candidate: " + error);
	    });
	    break;
	case 'error':
		if (state == I_AM_STARTING) {
			setState(I_CAN_START);
		}
		onError("Error message from server: " + parsedMessage.message);
		break;
	default:
		if (state == I_AM_STARTING) {
			setState(I_CAN_START);
		}
		onError('Unrecognized message', parsedMessage);
	}
}

function start() {
	console.log("Starting video call ...")
	// Disable start button
	setState(I_AM_STARTING);
	showSpinner(videoInput1, videoOutput1);

	console.log("Creating WebRtcPeer and generating local sdp offer ...");

    var options = {
	      localVideo: videoInput1,
	      remoteVideo: videoOutput1,
	      onicecandidate: onIceCandidate
	    }
	webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
		function (error) {
		  if(error) {
			  return console.error(error);
		  }
		  webRtcPeer.generateOffer (onOffer);
	});
}

function onOffer(error, offerSdp) {
	if (error) return console.error ("Error generating the offer");
	console.info('Invoking SDP offer callback function ' + location.host);
	var message = {
		id : 'start',
		sdpOffer : offerSdp
	}
	sendMessage(message);
}

function onError(error) {
	console.error(error);
}

function onIceCandidate(candidate) {
	  console.log("Local candidate" + JSON.stringify(candidate));

	  var message = {
	    id: 'onIceCandidate',
	    candidate: candidate
	  };
	  sendMessage(message);
}

function windowIn(message) {
	console.log ("Window in detected in "+message.roiId);	
}

function windowOut(message) {
	console.log ("Window out detected in "+message.roiId);
}

function startResponse(message) {
	setState(I_CAN_STOP);
	console.log("SDP answer received from server. Processing ...");
	webRtcPeer.processAnswer (message.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function stop() {
	console.log("Stopping video call ...");
	setState(I_CAN_START);
	if (webRtcPeer) {
		webRtcPeer.dispose();
		webRtcPeer = null;

		var message = {
			id : 'stop'
		}
		sendMessage(message);
	}
	hideSpinner(videoInput1, videoOutput1);
}

function calibrate() {
	console.log("Calibrate color");

	var message = {
			id : 'calibrate'
		}
	sendMessage(message);
}

function setState(nextState) {
	switch (nextState) {
	case I_CAN_START:
		$('#start').attr('disabled', false);
		$('#stop').attr('disabled', true);
		break;

	case I_CAN_STOP:
		$('#start').attr('disabled', true);
		$('#stop').attr('disabled', false);
		break;

	case I_AM_STARTING:
		$('#start').attr('disabled', true);
		$('#stop').attr('disabled', true);
		break;

	default:
		onError("Unknown state " + nextState);
		return;
	}
	state = nextState;
}

function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Sending message: ' + jsonMessage);
	ws.send(jsonMessage);
}

function showSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].poster = './img/transparent-1px.png';
		arguments[i].style.background = "center transparent url('./img/spinner.gif') no-repeat";
	}
}

function hideSpinner() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].src = '';
		arguments[i].poster = './img/webrtc.png';
		arguments[i].style.background = '';
	}
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});

//SECOND INPUT
ws2.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);
	console.info('Received message: ' + message.data);

	switch (parsedMessage.id) {
		case 'startResponse':
			startResponse2(parsedMessage);
			break;
		case 'iceCandidate':
			webRtcPeer2.addIceCandidate(parsedMessage.candidate, function (error) {
				if (!error) return;
				console.error("Error adding candidate: " + error);
			});
			break;
		case 'error':
			if (state2 == I_AM_STARTING) {
				setState2(I_CAN_START);
			}
			onError("Error message from server: " + parsedMessage.message);
			break;
		default:
			if (state2 == I_AM_STARTING) {
				setState2(I_CAN_START);
			}
			onError('Unrecognized message', parsedMessage);
	}
}

function start2() {
	console.log("Starting video call ...")
	// Disable start button
	setState2(I_AM_STARTING);
	showSpinner(videoInput2, videoOutput2);

	console.log("Creating WebRtcPeer and generating local sdp offer ...");

	var options = {
		localVideo: videoInput2,
		remoteVideo: videoOutput2,
		onicecandidate: onIceCandidate2
	}
	webRtcPeer2 = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
		function (error) {
			if(error) {
				return console.error(error);
			}
			webRtcPeer2.generateOffer (onOffer2);
		});
}

function onOffer2(error, offerSdp) {
	if (error) return console.error ("Error generating the offer");
	console.info('Invoking SDP offer callback function ' + location.host);
	var message = {
		id : 'start2',
		sdpOffer : offerSdp
	}
	sendMessage2(message);
}

function onIceCandidate2(candidate) {
	console.log("Local candidate" + JSON.stringify(candidate));

	var message = {
		id: 'onIceCandidate',
		candidate: candidate
	};
	sendMessage2(message);
}

function startResponse2(message) {
	setState2(I_CAN_STOP);
	console.log("SDP answer received from server. Processing ...");
	webRtcPeer2.processAnswer (message.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function stop2() {
	console.log("Stopping video call ...");
	setState2(I_CAN_START);
	if (webRtcPeer2) {
		webRtcPeer2.dispose();
		webRtcPeer2 = null;

		var message = {
			id : 'stop'
		}
		sendMessage2(message);
	}
	hideSpinner(videoInput2, videoOutput2);
}

function setState2(nextState) {
	switch (nextState) {
		case I_CAN_START:
			$('#start2').attr('disabled', false);
			$('#stop2').attr('disabled', true);
			break;

		case I_CAN_STOP:
			$('#start2').attr('disabled', true);
			$('#stop2').attr('disabled', false);
			break;

		case I_AM_STARTING:
			$('#start2').attr('disabled', true);
			$('#stop2').attr('disabled', true);
			break;

		default:
			onError("Unknown state " + nextState);
			return;
	}
	state2 = nextState;
}

function sendMessage2(message) {
	var jsonMessage = JSON.stringify(message);
	console.log('Sending message: ' + jsonMessage);
	ws2.send(jsonMessage);
}
