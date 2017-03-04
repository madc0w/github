var interval = 25; // ms
var maxTime = 3 * 60 * 1000 / interval;
var gravity = 0.00003;
var grams = [ "juju", "frf", "ded", "kik", "r", "e", "sas", "lala", "sese", "fd" ];
var balls = [];
var t = 0;
var typedKeys = [];
var bgSaturation = 0;
var currId = 0;
var startTime;
var isPaused = false;

var badKeySound = new Audio("audio/Loud-train-horn.wav");
var ballAtBottomSound = new Audio("audio/ball-at-bottom.wav");
var keyPressSound = new Audio("audio/Button-click-sound.wav");
var ballCompleteSound = new Audio("audio/Spinning-sound.wav");

function onLoad() {
	startTime = +new Date();
	gameCanvas = document.getElementById("game-canvas");
	gameContext = gameCanvas.getContext("2d");

	mainInterval = setInterval(step, interval);
}

function pause() {
	isPaused = !isPaused;
}

function step() {
	if (isPaused) {
		return;
	}
	t++;
	if (t > maxTime) {
		clearInterval(mainInterval);

		gameContext.font = "bold 80px Arial";
		gameContext.textBaseline = "middle";
		gameContext.fillStyle = "#ee0000";
		var message = "GAME OVER";
		var textWidth = gameContext.measureText(message).width;
		var y = gameCanvas.height / 2;
		gameContext.fillText(message, (gameCanvas.width - textWidth) / 2, y);

		return;
	}
	if (Math.random() < 0.025) {
		var ball = {
			y : 0,
			x : Math.random(),
			vel : {
				x : (Math.random() - 0.5) * 0.01,
				y : Math.random() * 0.002
			},
			gram : grams[parseInt(Math.random() * grams.length)],
			color : hsvToRgb(Math.random(), 0.4, 0.8),
			radius : 25 + (Math.random() * 15),
			radiusFreq : 8 + (Math.random() * 5),
			radiusAmplitude : 4 + (Math.random() * 2),
			typedLettersIndex : -1,
			id : currId++
		};
		balls.push(ball);
	}

	if (bgSaturation > 0) {
		bgSaturation -= 0.1;
		bgSaturation = Math.max(0, bgSaturation);
	}
	gameContext.fillStyle = hsvToRgb(1, bgSaturation, 0.9);
	gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

	var toRemove = [];
	for ( var i in balls) {
		var ball = balls[i];
		ball.vel.y += gravity;
		ball.y += ball.vel.y;
		ball.x += ball.vel.x;
		var radius = ball.radius + (Math.sin(t / ball.radiusFreq) * ball.radiusAmplitude);
		if (ball.x < 0) {
			ball.x *= -1;
			ball.vel.x *= -1;
		} else if (ball.x >= 1) {
			ball.x = 2 - ball.x;
			ball.vel.x *= -1;
		}
		if (ball.y > 1) {
			toRemove.push(ball);
		}

		var x = ball.x * gameCanvas.width;
		var y = ball.y * gameCanvas.height + radius;
		var grd = gameContext.createRadialGradient(x, y, radius, x, y, 0);
		// light blue
		grd.addColorStop(0, ball.color);
		// dark blue
		grd.addColorStop(1, "white");

		gameContext.fillStyle = grd;
		//	      gameContext.fillStyle = ball.color;
		gameContext.beginPath();
		gameContext.arc(x, y, radius, 0, 2 * Math.PI);
		gameContext.fill();

		gameContext.font = "bold 28px Arial";
		gameContext.textBaseline = "middle";
		var typedLetters = ball.gram.substring(0, ball.typedLettersIndex + 1);
		var untypedLetters = ball.gram.substring(ball.typedLettersIndex + 1);
		//		if (typedLetters.length) {
		//			console.log(ball.gram + " " + typedLetters + " + " + untypedLetters);
		//		}
		var typedLettersWidth = gameContext.measureText(typedLetters).width;
		var untypedLettersWidth = gameContext.measureText(untypedLetters).width;
		var halfWidth = (typedLettersWidth + untypedLettersWidth) / 2;
		gameContext.fillStyle = "#ee0000";
		gameContext.fillText(typedLetters, x - halfWidth, y);
		gameContext.fillStyle = "#000000";
		gameContext.fillText(untypedLetters, x - halfWidth + typedLettersWidth, y);
	}

	if (toRemove.length > 0) {
		ballAtBottomSound.play();
		removeBalls(toRemove);
	}
}

function removeBalls(toRemove) {
	for ( var j in toRemove) {
		for ( var i in balls) {
			var ball = balls[i];
			if (ball.id == toRemove[j].id) {
				balls.splice(i, 1);
				break;
			}
		}
	}
}

function onKeyPress(e) {
	if (e.key == " ") {
		pause();
		return;
	}
	typedKeys.push(e.key);

	var completedBalls = [];
	var isFound = false;
	for ( var i in balls) {
		var ball = balls[i];
		if (ball.gram.charAt(ball.typedLettersIndex + 1) == e.key) {
			ball.typedLettersIndex++;
			isFound = true;
			if (ball.typedLettersIndex + 1 == ball.gram.length) {
				completedBalls.push(ball);
			}
			//			console.log(ball.gram + " " + ball.typedLettersIndex);
		}
	}

	if (isFound) {
		keyPressSound.play();
	} else {
		bgSaturation = 0.9;
		badKeySound.play();
	}

	if (completedBalls.length > 0) {
		removeBalls(completedBalls);
		ballCompleteSound.play();
	}
}

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function hsvToRgb(h, s, v) {
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
	case 0:
		r = v, g = t, b = p;
		break;
	case 1:
		r = q, g = v, b = p;
		break;
	case 2:
		r = p, g = v, b = t;
		break;
	case 3:
		r = p, g = q, b = v;
		break;
	case 4:
		r = t, g = p, b = v;
		break;
	case 5:
		r = v, g = p, b = q;
		break;
	}
	var rgb = {
		r : Math.round(r * 255),
		g : Math.round(g * 255),
		b : Math.round(b * 255)
	};
	return rgbToHex(rgb);
}

function rgbToHex(rgb) {
	var componentToHex = function(c) {
		var hex = c.toString(16);
		if (hex.length == 1) {
			hex = "0" + hex;
		}
		return hex;
	}

	return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}
