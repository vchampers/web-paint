var canvas = document.getElementById("canvas");
var bar = document.getElementById("bar");
//bar.style.width = window.screen.width + "px";
//canvas.style.marginLeft = (window.screen.width - canvas.width - 4) / 2 + "px";

/*实现二级菜单的隐藏与弹出*/
var barOption = document.getElementsByClassName("level1");
for(var i = 0; i < barOption.length; i++) {
	barOption[i].onmouseover = function() {
		this.className += (this.className.length > 0 ? " " : "") + "listshow";
	}
	barOption[i].onmouseout = function() {
		this.className = this.className.replace("listshow", "");
	}
	barOption[i].onclick = function() {
		if(this.id != "saveMenu" && this.id != "colorMenu")
			this.className = this.className.replace("listshow", "");
	}
}
//初始化一些属性
var shap = "曲线";
var orignalX, orignalY;
var lastX, lastY;
var isMouseDown = false;
var context = canvas.getContext('2d');
var width = canvas.width,
	height = canvas.height;
var data;
context.strokeStyle = "black";
context.lineWidth = 2;
var isEraser = false;


var jsonarr = new Array(); //存储矢量图的对象数组
var curvearr = new Array();//存储一条曲线的对象数组

//检测localStorage，是否有已保存的图像
if(localStorage.saveName) {
	if(localStorage.saveName != "") {
		var tag_ul = document.createElement("ul");
		var tag_li = document.createElement("li");
		var tag_a = document.createElement("a");
		tag_a.innerText = localStorage.saveName;
		tag_a.style.color = "white";
		document.getElementById("open").appendChild(tag_ul);
		tag_ul.appendChild(tag_li);
		tag_li.appendChild(tag_a);
	}
}

/*保存图像*/
var saveButton = document.getElementById("savaName");
saveButton.addEventListener("change", save);
function save() {
	isEraser = false;
	//创建打开按钮的子菜单
	localStorage.saveName = saveButton.value;
	if(localStorage.saveName != "") {
		if(document.getElementById("open").children.length <= 1) {
			var tag_ul = document.createElement("ul");
			var tag_li = document.createElement("li");
			var tag_a = document.createElement("a");
			tag_a.innerText = localStorage.saveName;
			tag_a.style.color = "white";
			document.getElementById("open").appendChild(tag_ul);
			tag_ul.appendChild(tag_li);
			tag_li.appendChild(tag_a);
		} else {
			var openName = document.getElementById("open").children[1].children[0];
			openName.innerText = localStorage.saveName;
			openName.style.color = "white";
		}
	}
	//保存图形对象至localStorage中
	var json = '';
	for(var i=0;i<jsonarr.length;i++){
		json = json + JSON.stringify(jsonarr[i]);
		if(i!=jsonarr.length-1)
			json+="/";
	}
	localStorage.gragh = json;
}
/*打开图像*/
var openButton = document.getElementById("open");
if(openButton.children.length>1){
	openButton.children[1].addEventListener("click", open);
}
function open(){
	isEraser = false;
	clearCanvas();
	var json = localStorage.gragh;
	jsonarr = json.split('/');
	drawAll();
}
//画出数组中所有对象
function drawAll(){
	for(var i=0;i<jsonarr.length;i++){
		context.beginPath();
		if(arguments.callee.caller.name=="open")
			jsonarr[i] = JSON.parse(jsonarr[i]);
		var temp = [context.strokeStyle,context.lineWidth];
		if(jsonarr[i].type != "Curve"){
			orignalX = jsonarr[i].orignalX;
			orignalY = jsonarr[i].orignalY;
			lastX = jsonarr[i].lastX;
			lastY = jsonarr[i].lastY;
			context.strokeStyle = jsonarr[i].color;
			context.lineWidth = jsonarr[i].lineWidth;
			eval("draw" + jsonarr[i].type + "()");
			context.stroke();
		}
		else {
			for(var j in jsonarr[i].curvearr){
				orignalX = jsonarr[i].curvearr[j].orignalX;
				orignalY = jsonarr[i].curvearr[j].orignalY;
				lastX = jsonarr[i].curvearr[j].lastX;
				lastY = jsonarr[i].curvearr[j].lastY;
				context.strokeStyle = jsonarr[i].color;
				context.lineWidth = jsonarr[i].lineWidth;
				drawCurve();
				context.stroke();
			}
		}
		context.strokeStyle = temp[0];
		context.lineWidth = temp[1];
	}
}

function extend(Parent, Child) { //模拟继承
	var F = function() {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.uber = Parent.prototype;
}

var drawCircle = function() { //画圆方法
		context.beginPath();
		context.arc(orignalX+(lastX-orignalX)/2,orignalY+(lastY-orignalY)/2,Math.abs(lastX-orignalX)/2,0,Math.PI * 2,true);
	}
var drawRectangle = function() { //画矩形方法
		context.beginPath();
		context.moveTo(orignalX, orignalY)
		context.lineTo(lastX, orignalY);
		context.lineTo(lastX, lastY);
		context.lineTo(orignalX, lastY);
		context.closePath();		
	}
var drawLine = function() { //画直线方法
		context.beginPath();
		context.moveTo(orignalX, orignalY)
		context.lineTo(lastX, lastY);
	}
var drawOval = function() { //画椭圆方法
		var centerX = (lastX + orignalX) / 2;
		var centerY = (lastY + orignalY) / 2;
		var crossLength = Math.abs((lastX - orignalX) / 2);
		var vertiLength = Math.abs((lastY - orignalY) / 2);
		var step = (crossLength > vertiLength) ? 1 / crossLength : 1 / vertiLength;
		context.beginPath();
		context.moveTo(centerX + crossLength, centerY);
		for(var i = 0; i < 2 * Math.PI; i += step) {
			context.lineTo(centerX + crossLength * Math.cos(i), centerY + vertiLength * Math.sin(i));
		}
		context.closePath();
	}

var drawCurve = function(){  //画曲线方法
	context.lineTo(lastX, lastY);
}
/*图形父类构造器*/
function Shap(orignalX, orignalY, lastX, lastY) {
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = function() {};
}
/*点对象构造器*/
function Point(orignalX, orignalY, lastX, lastY) {
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
}
/*曲线对象构造器*/
function Curve(curvearr){
	this.type = "Curve";
	this.curvearr = curvearr;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = drawCurve;
}


/*矩形对象构造器*/
function Rectangle(orignalX, orignalY, lastX, lastY) {
	extend(Shap, Rectangle);
	this.type = "Rectangle";
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = drawRectangle;
}

/*圆构造器*/
function Circle(orignalX, orignalY, lastX, lastY) {
	extend(Shap, Circle);
	this.type = "Circle";
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = drawCircle;
}

/*直线构造器*/
function Line(orignalX, orignalY, lastX, lastY) {
	extend(Shap, Line);
	this.type = "Line";
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = drawLine;
}

/*椭圆构造器*/
function Oval(orignalX, orignalY, lastX, lastY) {
	extend(Shap, Oval);
	this.type = "Oval";
	this.orignalX = orignalX;
	this.orignalY = orignalY;
	this.lastX = lastX;
	this.lastY = lastY;
	this.color = context.strokeStyle;
	this.lineWidth = context.lineWidth;
	this.draw = drawOval;
}

var circleButton = document.getElementById("circle");
var rectangleButton = document.getElementById("rectangle");
var curveButton = document.getElementById("curve");
var lineButton = document.getElementById("line");
var ovalButton = document.getElementById("oval");


function selectShap() { //改变画笔形状方法
	shap = this.getElementsByTagName("a")[0].innerText;
	isEraser = false;
}

function setColor(){  //改变画笔颜色方法
	context.strokeStyle = this.value;
	console.log(this.value);
	isEraser = false;
}
function setWidth(){  //改变画笔粗细
	context.lineWidth = this.getElementsByTagName("a")[0].innerText;
	isEraser = false;
}
function myCanvasMouseDown(event) {
	if(event.button == 0 && isEraser == false) {
		orignalX = event.offsetX;
		orignalY = event.offsetY;
		data = context.getImageData(0, 0, width, height);
		isMouseDown = true;
		context.beginPath();
	}
	else if(event.button == 0 && isEraser == true){
		
		
		x = event.offsetX;
		y = event.offsetY;
		for(var i=0;i<jsonarr.length;i++){
			context.beginPath();
			if(jsonarr[i].type != "Curve"){
				orignalX = jsonarr[i].orignalX;
				orignalY = jsonarr[i].orignalY;
				lastX = jsonarr[i].lastX;
				lastY = jsonarr[i].lastY;
				context.lineWidth = jsonarr[i].lineWidth;
				eval("draw" + jsonarr[i].type + "()");
				if(context.isPointInStroke(x,y)){
					console.log("delete!")
					jsonarr.splice(i,1);
					i--;
				}
			}
			else {
				for(var j in jsonarr[i].curvearr){
					orignalX = jsonarr[i].curvearr[j].orignalX;
					orignalY = jsonarr[i].curvearr[j].orignalY;				
					lastX = jsonarr[i].curvearr[j].lastX;
					lastY = jsonarr[i].curvearr[j].lastY;
					drawCurve();
					if(context.isPointInStroke(x,y)){
						console.log("delete!")
						jsonarr.splice(i,1);
						i--;
						break;
					}
				}
			}
		}
		clearCanvas();
		drawAll();
	}
}

function myCanvasMouseMove(event) {
	if(isMouseDown && isEraser == false) {
		context.clearRect(0, 0, width, height);
		context.putImageData(data, 0, 0);
		lastX = event.offsetX;
		lastY = event.offsetY;
		switch(shap) {
			case "圆":
				var circle = new Circle(orignalX, orignalY, lastX, lastY);
				circle.draw();
				context.stroke();
				break;
			case "矩形":
				var rectangle = new Rectangle(orignalX, orignalY, lastX, lastY);
				rectangle.draw();
				context.stroke();
				break;
			case "直线":
				var line = new Line(orignalX, orignalY, lastX, lastY);
				line.draw();
				context.stroke();
				break;
			case "曲线":
				curvearr.push(new Point(orignalX, orignalY, lastX, lastY));
				drawCurve();
				context.stroke();
				break;
			case "椭圆":
				var oval = new Oval(orignalX, orignalY, lastX, lastY);
				oval.draw();
				context.stroke();
		}
	}
}

function myCanvasMouseUp(event) {  
	if(isMouseDown && isEraser == false) {
		context.clearRect(0, 0, width, height);
		context.putImageData(data, 0, 0);
		lastX = event.offsetX;
		lastY = event.offsetY;
		switch(shap) {
			case "圆":
				var circle = new Circle(orignalX, orignalY, lastX, lastY);
				circle.draw();
				context.stroke();
				jsonarr.push(circle);
				console.log(jsonarr);
				break;
			case "矩形":
				var rectangle = new Rectangle(orignalX, orignalY, lastX, lastY);
				rectangle.draw();
				context.stroke();
				jsonarr.push(rectangle);
				console.log(jsonarr);
				break;
			case "直线":
				var line = new Line(orignalX, orignalY, lastX, lastY);
				line.draw();
				context.stroke();
				jsonarr.push(line);
				console.log(jsonarr);
				break;
			case "曲线":
				var curve = new Curve(curvearr);
				curve.draw();
				context.stroke();
				curvearr = [];			
				jsonarr.push(curve);		
				console.log(jsonarr);
				break;
			case "椭圆":
				var oval = new Oval(orignalX, orignalY, lastX, lastY);
				oval.draw();
				context.stroke();
				jsonarr.push(oval);
				console.log(jsonarr);
				break;
		}
	}
	isMouseDown = false;
}
function erase(){ //橡皮擦按钮事件
	if(navigator.userAgent.indexOf("Edge") > -1){
		alert("Microsoft Edge不支持此功能！");
		return;
	}
	isEraser = true;
}
//清空画布
function clearCanvas() {
	context.clearRect(0, 0, width, height);
}

/*canvas画布事件监听*/
canvas.addEventListener("mousedown", myCanvasMouseDown, false);
canvas.addEventListener("mousemove", myCanvasMouseMove, false);
canvas.addEventListener("mouseup", myCanvasMouseUp, false);

/*画笔形状菜单事件监听*/
var shapButtons = document.getElementById("shap").getElementsByTagName("li");
for(i = 0; i < shapButtons.length; i++) {
	shapButtons[i].addEventListener("click", selectShap, false);
}
/*画笔颜色菜单事件监听*/
var colorButton = document.getElementById("colorSelect");
colorButton.addEventListener("change",setColor,false);
/*画笔粗细菜单事件监听*/
var widthButtons = document.getElementById("penWidth").getElementsByTagName("li");
for(i = 0; i < widthButtons.length; i++) {
	widthButtons[i].addEventListener("click", setWidth, false);
}
/*橡皮擦事件监听*/
var eraserButton = document.getElementById("eraser");
eraserButton.addEventListener("click",erase,false);