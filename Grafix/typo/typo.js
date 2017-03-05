var config = {
	maxTime : 40, // secs	
	newBallProbability : 0.025,
	levels : [
		{
			name : "Beginner",
			gravity : 0.00001,
			grams : [ "a", "s", "d", "f", "j", "k", "l", "g", "h" ],
		},
		{
			name : "Level 2",
			gravity : 0.000012,
			grams : [ "aq", "sw", "de", "fr", "ju", "ki", "lo", "p", "ft", "jh", "fg" ],
		},
		{
			name : "Level 3",
			gravity : 0.000012,
			grams : [ "ay", "sx", "dc", "fv", "gv", "jn", "jm", "k,", "l.", "jh", "fg" ],
		},
		{
			name : "Intermediate",
			gravity : 0.000015,
			grams : [ "papa", "haha", "lol", "mama", "rar", "dada", "fifi", "fofo", "nana", "popo", "tata", "toto", "fyfy", "gogo", "gaga" ],
		},
		{
			name : "Advanced",
			gravity : 0.00002,
			grams : [ "jun", "jul", "may", "jan", "ver", "sew", "wet", "pol", "nop", "fre", "nuh", "vop", "dee", "boo", "oop", "bin", "hex", "dec",
				"ibm", "ocr", "fra", "usa", "the", "une", "dog", "cat", "big", "pig", "sun", "eat", "dot", "dig", "pup", "hen", "vat", "ici", "moi",
				"ton", "nos", "him", "his", "her", "she", "out", "our" ],
		},
		{
			name : "Hardcore",
			gravity : 0.000025,
			grams : [ "the", "quick", "brown", "fox", "jumped", "over", "lazy", "kangaroo", "dog", "monkey", "duck", "jump", "troll", "giant",
				"zulu", "boat", "ship", "work", "play", "rain", "cloud", "west", "north", "south", "east", "atom", "quark", "mouse", "bunny" ],
		},
		{
			name : "Ludicrous",
			gravity : 0.00006,
			grams : [ "this", "here", "omg", "wtf", "madness", "wow", "r5zq", "please", "stop", "321go", "words", "fast", "very", "8px32", "dd6gv",
				"bq992" ],
		}, ]
};

var interval = 25; // ms
var balls = [];
var t = 0;
var typedKeys = [];
var bgSaturation = 0;
var currId = 0;
var isPaused = false;
var score = 0;
var hiScore = 0;
var mainInterval;
var level = 0;
var isGameOver = false;
var maxSteps;

var badKeySound = new Audio("audio/Funny-noise.mp3");
var ballAtBottomSound = new Audio("audio/ball-at-bottom.mp3");
var keyPressSound = new Audio("audio/Button-click-sound.mp3");
var ballCompleteSound = new Audio("audio/Spinning-sound.mp3");

function onLoad() {
	gameCanvas = document.getElementById("game-canvas");
	gameContext = gameCanvas.getContext("2d");
	progressBar = document.getElementById("game-progress");

	setup();
	selectLevel(2);
}

function setup() {
	var html = "<ul>";
	for ( var i in config.levels) {
		html += "<li><a href=\"#\" id=\"level-" + i + "\" onClick=\"selectLevel(" + i + ");\">" + config.levels[i].name + "</a></li>";
	}
	html += "</ul>";
	var levelSelectionDiv = document.getElementById("level-selection");
	levelSelectionDiv.innerHTML = html;

	var storedConfig = localStorage.getItem("config");
	if (storedConfig) {
		config = JSON.parse(storedConfig);
	}
}

function start() {
	maxSteps = config.maxTime * (1000 / interval);
	isGameOver = false;
	isPaused = false;
	typedKeys = [];
	balls = [];
	score = 0;
	t = 0;
	currId = 0;
	bgSaturation = 0;
	addScore(0);
	if (mainInterval) {
		clearInterval(mainInterval);
	}
	mainInterval = setInterval(step, interval);
}

function step() {
	if (isPaused) {
		setMessage("PAUSED");
		return;
	}
	t++;
	if (t > maxSteps) {
		clearInterval(mainInterval);

		isPaused = true;
		isGameOver = true;
		hiScore = Math.max(hiScore, score);
		document.getElementById("hi-score").innerHTML = Math.round(hiScore);

		setMessage("GAME OVER");
		return;
	}

	progressBar.style.width = (100 * t / maxSteps) + "%";

	if (Math.random() < config.newBallProbability) {
		var ball = {
			y : 0,
			x : Math.random(),
			vel : {
				x : (Math.random() - 0.5) * 0.01,
				y : Math.random() * 0.0012
			},
			gram : config.levels[level].grams[parseInt(Math.random() * config.levels[level].grams.length)],
			color : hsvToRgb(Math.random(), 0.4, 0.8),
			radius : 25 + (Math.random() * 15),
			radiusFreq : 8 + (Math.random() * 5),
			radiusAmplitude : 4 + (Math.random() * 2),
			typedLettersIndex : -1,
			id : currId++,
			isComplete : false,
			fontSize : 28
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
		if (ball.isComplete) {
			ball.radius *= 0.9;
			ball.fontSize--;
			ball.fontSize = Math.max(1, ball.fontSize);
			if (ball.radius < 0.05) {
				toRemove.push(ball);
			}
		} else {
			ball.vel.y += config.levels[level].gravity;
			ball.y += ball.vel.y;
			ball.x += ball.vel.x;
			if (ball.x < 0) {
				ball.x *= -1;
				ball.vel.x *= -1;
			} else if (ball.x >= 1) {
				ball.x = 2 - ball.x;
				ball.vel.x *= -1;
			}
			if (ball.y > 1) {
				toRemove.push(ball);
				addScore(-40);
				ballAtBottomSound.play();
			}
		}
		var radius = Math.max(0, ball.radius + (Math.sin(t / ball.radiusFreq) * ball.radiusAmplitude));

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

		gameContext.font = "bold " + ball.fontSize + "px Arial";
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

	removeBalls(toRemove);
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

function togglePause() {
	isPaused = !isPaused;
}

function onClick(e) {
	// e.detail == 1 means that the mouse was really clicked, not space bar
	if (e.detail) {
		if (e.target.id == "pause-button") {
			togglePause();
		} else if (e.target.id == "start-button") {
			start();
		} else if (e.target.id == "edit-config") {
			isPaused = true;
			document.getElementById("config").style.display = "block";
			document.getElementById("config-text").value = JSON.stringify(config, null, "\t") + "\n";
		} else if (e.target.id == "save-config") {
			var configStr = document.getElementById("config-text").value;
			try {
				config = JSON.parse(configStr);
			} catch (err) {
				alert("Failed to parse configuration!  Check again.");
				return;
			}
			document.getElementById("config").style.display = "none";
			localStorage.setItem("config", configStr);
			setup();
			selectLevel(level);
			start();
		} else if (e.target.id == "cancel-config") {
			document.getElementById("config").style.display = "none";
		}
	}
	//	console.log(JSON.stringify(e.target.id));
}

function onKeyPress(e) {
	var key = e.key.toLowerCase();
	if (key == " ") {
		if (isGameOver) {
			start();
		} else {
			togglePause();
		}
		return;
	}
	if (isPaused) {
		return;
	}
	typedKeys.push(key);

	var completedBalls = [];
	var isFound = false;
	for ( var i in balls) {
		var ball = balls[i];
		if (ball.isComplete) {
			continue;
		}
		if (ball.gram.charAt(ball.typedLettersIndex + 1) == key) {
			ball.typedLettersIndex++;
			isFound = true;
			if (ball.typedLettersIndex + 1 == ball.gram.length) {
				ball.isComplete = true;
				completedBalls.push(ball);
			}
			//			console.log(ball.gram + " " + ball.typedLettersIndex);
		}
	}

	if (isFound) {
		keyPressSound.play();
	} else {
		bgSaturation = 0.9;
		addScore(-10);
		badKeySound.play();
	}

	if (completedBalls.length > 0) {
		for ( var i in completedBalls) {
			var ball = completedBalls[i];
			addScore(40 * (1 - ball.y) * ball.gram.length);
		}
		//		removeBalls(completedBalls);
		ballCompleteSound.play();
	}
}

function setMessage(message) {
	gameContext.font = "bold 80px Arial";
	gameContext.textBaseline = "middle";
	gameContext.fillStyle = "#ee0000";
	var textWidth = gameContext.measureText(message).width;
	var y = gameCanvas.height / 2;
	gameContext.fillText(message, (gameCanvas.width - textWidth) / 2, y);
}

function selectLevel(l) {
	document.getElementById("level-" + level).className = "";
	level = l;
	document.getElementById("level-" + level).className = "selected";
	start();
}

function addScore(n) {
	score += n;
	score = Math.max(0, score);
	document.getElementById("score").innerHTML = Math.round(score);
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
