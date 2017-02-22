var numPoints = 20;

var mainInterval = null;
var points = [];

function onLoad() {
	gameCanvas = document.getElementById("game-canvas");
	gameContext = gameCanvas.getContext("2d");

	for (var i = 0; i < numPoints; i++) {
		var point = {
			x : Math.random(),
			y : Math.random(),
			vel : {
				x : (Math.random() - 0.5) / 100,
				y : (Math.random() - 0.5) / 100,
			},
		};
		points.push(point);
	}

	mainInterval = setInterval(step, 25);
	refreshDisplay();
}

function step() {
	for ( var i in points) {
		var point = points[i];
		point.x += point.vel.x;
		if (point.x >= 1) {
			point.x = 2 - point.x;
			point.vel.x *= -1;
		} else if (point.x < 0) {
			point.x *= -1;
			point.vel.x *= -1;
		}
		point.y += point.vel.y;
		if (point.y >= 1) {
			point.y = 2 - point.y;
			point.vel.y *= -1;
		} else if (point.y < 0) {
			point.y *= -1;
			point.vel.y *= -1;
		}

		//		point.vel.x += (Math.random() - 0.5) * 0.001;
		//		point.vel.y += (Math.random() - 0.5) * 0.001;
		point.vel.y += 0.00025;
	}
	refreshDisplay();
}

function refreshDisplay() {
	gameContext.fillStyle = "#eeeeee";
	gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

	for ( var i in points) {
		var point = points[i];

		var minDistSq = null;
		var minDistPoint = null;
		for ( var j in points) {
			var point2 = points[j];
			var distSq = Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2);
			if (!minDistSq || distSq < minDistSq) {
				minDistSq = distSq;
				minDistPoint = point2;
			}
		}

		var x = point.x * gameCanvas.width;
		var y = point.y * gameCanvas.height;
		var x2 = minDistPoint.x * gameCanvas.width;
		var y2 = minDistPoint.y * gameCanvas.height;

		gameContext.fillStyle = "#008844";
		gameContext.beginPath();
		gameContext.moveTo(x, y);
		gameContext.lineTo(x2, y2);
		gameContext.stroke();

		gameContext.fillStyle = "#008800";
		gameContext.beginPath();
		gameContext.arc(x, y, 5, 0, 2 * Math.PI);
		gameContext.fill();
	}
}
