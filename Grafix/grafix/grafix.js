var maxX = 100;
var xIncrement = 0.1;

var x = 0;
var mainInterval = null;
var expressions = [ {
	expression : "x",
	display : "x"
}, {
	expression : "Math.pow(x, 2)",
	display : "x<sup>2</sup>"
}, {
	expression : "3*Math.pow(x, 2)",
	display : "3x<sup>2</sup>"
}, {
	expression : "2*Math.sin(x)",
	display : "2 sin x"
} ];
var terms = [];
var points = [];
var yAdjustment = 0;

function onLoad() {
	expressionsDiv = document.getElementById("expressions");
	equationDiv = document.getElementById("equation");
	gameCanvas = document.getElementById("game-canvas");
	gameContext = gameCanvas.getContext("2d");

	mainInterval = setInterval(step, 25);

	setInterval(function() {
		Tesseract.recognize(gameCanvas).then(function(result) {
			console.log("result " + result);
		});
	}, 1000);

	refreshDisplay();
}

function step() {
	x += xIncrement;

	var posX = x * (gameCanvas.width / maxX);
	var posY = eval(getExpression()) + yAdjustment;
	points.push({
		x : posX,
		y : posY
	});

	//	console.log(posX + ", " + posY + "  yAdjustment  " + yAdjustment);
	var maxY = -999999999, minY = 999999999;
	for ( var i in points) {
		var point = points[i];
		maxY = Math.max(maxY, point.y);
		minY = Math.min(minY, point.y, 0);
	}

	var yZero = 0.5;
	if (minY < maxY) {
		yZero = 1 - (minY / (minY - maxY));
	}

	gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

	gameContext.beginPath();
	for ( var i in points) {
		var point = points[i];
		var yPos = gameCanvas.height * (yZero - point.y / (1.1 * (maxY - minY)))
		var xPos = point.x - points[0].x;
		gameContext.fillStyle = "#004000";
		if (i == 0) {
			gameContext.moveTo(xPos, yPos);
		} else {
			gameContext.lineTo(xPos, yPos);
		}
	}
	gameContext.stroke();

	// y axis
	gameContext.fillStyle = "#000000";
	gameContext.beginPath();
	gameContext.moveTo(0, 0);
	gameContext.lineTo(0, gameCanvas.height);
	gameContext.stroke();

	// x axis
	gameContext.beginPath();
	gameContext.moveTo(0, gameCanvas.height * yZero);
	gameContext.lineTo(gameCanvas.width, gameCanvas.height * yZero);
	gameContext.stroke();

	if (maxY - minY > 0) {
		gameContext.font = "10px sans-serif";
		for (var y = minY; y <= maxY; y += (maxY - minY) / 10) {
			var yPos = gameCanvas.height * (yZero - y / (1.1 * (maxY - minY)))
			gameContext.beginPath();
			gameContext.moveTo(5, yPos);
			gameContext.lineTo(15, yPos);
			gameContext.stroke();

			var yFormatted = y.toFixed(2);
			gameContext.fillText(yFormatted, 5, yPos - 20);
		}
	}

	if (x >= maxX) {
		//		clearInterval(mainInterval);
		points.splice(0, 1);
	}
}

function getExpression() {
	if (terms.length == 0) {
		return 0;
	}
	var expression = "";
	for ( var i in terms) {
		if (expression.length > 0) {
			expression += " + ";
		}
		expression += terms[i].expression;
	}
	return expression;
}

function refreshDisplay() {
	var equationHtml = "";
	for ( var i in terms) {
		if (equationHtml.length > 0 && !terms[i].display.startsWith(" -")) {
			equationHtml += " + "
		}
		equationHtml += '<a href="#" onClick="removeTerm(' + i + ');">' + terms[i].display + '</a>';
	}

	equationDiv.innerHTML = "y = ";
	if (terms.length == 0) {
		equationDiv.innerHTML += 0;
	} else {
		equationDiv.innerHTML += equationHtml;
	}

	var expressionsHtml = "";
	for ( var i in expressions) {
		expressionsHtml += '<a href="#" onClick="addTerm(' + i + ');">' + expressions[i].display + '</a>';
	}
	expressionsDiv.innerHTML = expressionsHtml;
}

function removeTerm(termIndex) {
	var prevY = eval(getExpression());
	terms.splice(termIndex, 1);
	x += xIncrement;
	var nextY = eval(getExpression());
	x -= xIncrement;
	yAdjustment += prevY - nextY;
	refreshDisplay();
}

function addTerm(expressionIndex) {
	var prevY = eval(getExpression());
	terms.push(expressions[expressionIndex]);
	expressions.splice(expressionIndex, 1);

	var exponent = parseInt(Math.random() * 3) + 1;
	var coefficient = 0;
	while (coefficient == 0) {
		coefficient = parseInt(Math.random() * 9) - 4;
	}
	var coefficientDisplay = coefficient;
	if (coefficient == 1) {
		coefficientDisplay = "";
	} else if (coefficient == -1) {
		coefficientDisplay = " - ";
	} else if (coefficient < 0) {
		coefficientDisplay = " - " + Math.abs(coefficient);
	}

	var expression = {
		expression : coefficient + "*Math.pow(x, " + exponent + ")",
		display : coefficientDisplay + " x" + (exponent == 1 ? "" : ("<sup>" + exponent + "</sup>"))
	};
	expressions.push(expression);
	x += xIncrement;
	var nextY = eval(getExpression());
	x -= xIncrement;
	yAdjustment += prevY - nextY;
	refreshDisplay();
}
