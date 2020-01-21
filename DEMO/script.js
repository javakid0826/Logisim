"use strict";

//region VARIABLES
//region CONSTANTS
//Get the canvas
const canv = document.getElementById("mainCanvas");
//Get the context (for actual drawing)
const context = canv.getContext("2d");

//Width and Height of the area we are actually going to draw to
const width = 500;
const height = 500;
//The area for the "toolbar"
const drawerHeight = CS * 3;

//The images for the different gates
// TODO: Do this procedurally
const OR = new Image();
OR.src = "DEMO/res/OR_ANSI.svg";
const AND = new Image();
AND.src = "DEMO/res/AND_ANSI.svg";
const XOR = new Image();
XOR.src = "DEMO/res/XOR_ANSI.svg";
const NOR = new Image();
NOR.src = "DEMO/res/NOR_ANSI.svg";
const NAND = new Image();
NAND.src = "DEMO/res/NAND_ANSI.svg";
const XNOR = new Image();
XNOR.src = "DEMO/res/XNOR_ANSI.svg";

//The minimum distance the mouse has to move to register as being dragged
const minMouseMove = 5;

//The colors for the states of the wires
const offWire = "#004";
const onWire = "#00F";

const buttonTypes = [
	"INPUT",
	"AND",
	"OR",
	"XOR",
	"NAND",
	"NOR",
	"XNOR"
];
//endregion CONSTANTS

//Components
let comps = [];

let buttonFuncs = [];

let buttons = [];

let wires = [];

let mousePos; //The rounded version of the mouse position, to the nearest cell
let realPos; //The actual position of the mouse, unrounded

let mouseDown = false;
let mouseDragged = false;

let clickPos = null; //Where the mouse was when you clicked
let newComp = null; //The new component that is created when you click a button in the toolbar
let currWire = null; //The current wire you creating by dragging
//What you clicked on (if anything)
let selObject = null;
let selCon = null;
//endregion VARIABLES

//Don't worry about any of this.
//region INIT
for(let type of buttonTypes){
	let clas = type == "INPUT" ? Input : Gate;
	buttonFuncs.push((x, y) => (() => newComp = new clas([x, y], type)));
}

for(let i in buttonFuncs){
	let x = drawerHeight * i;
	buttons[i] = new Button(buttonFuncs[i](x, height), x, height, drawerHeight, drawerHeight);
}

canv.width = width;
canv.height = height + drawerHeight;

context.lineWidth = 5;
//endregion INIT

//Functions that are just functions so I have less repeated code
//A.K.A. these do one thing and one thing only
//region HelpFuncs
//Draw one wire
const renderWire = wire => {
	context.strokeStyle = wire.state ? onWire : offWire;
	for(let path of wire.paths){
		context.beginPath();
		let point = path[0];
		context.moveTo(point.x, point.y);
		for(let i = 1; i < path.length; i++){
			context.lineTo(path[i].x, path[i].y);
		}
		context.stroke();
	}
}

//Return the actual position of the mouse
const getrealPos = (canv, event) => {
    let rect = canv.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
	}
}

//Get the mouse position (rounded to the nearest cell)
const getMousePos = (canv, event) => {
	let pos = getrealPos(canv, event);
    return {
		x: Math.floor(pos.x / CS) * CS,
		y: Math.floor(pos.y / CS) * CS
	}
}

//Check if you clicked a wire
const checkWireClick = (mousePos, wire) => {
	let mouseCol = new Collider(mousePos.x, mousePos.y, CS, CS);
	for(let path of wire.paths){
		for(let i = 0; i < path.length - 1; i++){
			let SX = path[i].x;
			let SY = path[i].y;
			let EX = path[i + 1].x;
			let EY = path[i + 1].y;
			let a = (SX < EX ? SX : EX) - CS / 2;
			let b = (SY < EY ? SY : EY) - CS / 2;
			let w = (SX < EX ? EX - SX : SX - EX) + CS;
			let h = (SY < EY ? EY - SY : SY - EY) + CS;
			//console.log(a, b, w, h, SX, SY, EX, EY);
			if(overlap(mouseCol, new Collider(a, b, w, h))){
				return true;
			}
		}
	}
}

//Return the corresponding image given a gate type
const gateImg = type => {
	let img = null;
	switch (type) {
		case "AND":
			img = AND;
			break;
		case "OR":
			img = OR;
			break;
		case "XOR":
			img = XOR;
			break;
		case "NAND":
			img = NAND;
			break;
		case "NOR":
			img = NOR;
			break;
		case "XNOR":
			img = XNOR;
			break;
	}
	return img;
}
//endregion HelpFuncs

//Function that gets called when you release the mouse and it had been dragged
const dragged = (start, end) => {
	if(!selObject){ //No selected object so we making a wire
		let coords = [new Vector2(start.x, end.y), new Vector2(end)];

		if(start.x == end.x || start.y == end.y) {
			coords = [new Vector2(end)];
		}
		if(start.x == end.x && start.y == end.y){
			return;
		}

		coords = coords.map(elem => elem.addBoth(CS / 2));

		currWire.points.push(...coords);
		currWire.paths.push([new Vector2(start).addBoth(CS / 2), ...coords]);

		if(selCon){
			selCon.wire = currWire;
			currWire.connections.push(selCon);
		}

		let mouseCol = new Collider(end.x, end.y, CS, CS);

		for(let comp of comps){
			for(let i of comp.cons){
				for(let j of i){
					if(overlap(mouseCol, j.col)){
						j.wire = currWire;
						currWire.connections.push(j);
					}
				}
			}
		}

		wires.push(currWire);
	} else {
		if(selObject instanceof Input){
			for(let i in comps){
				if(comps[i] == selObject){
					comps.splice(i, 1);
				}
			}
		}
	}
}

//region EventListeners
canv.addEventListener("mousemove", e => {
	mousePos = getMousePos(canv, e);
	realPos = getrealPos(canv, e);
});

canv.addEventListener("mouseup", e => {
	if(mouseDragged){
		for(let i in wires){
			if(checkWireClick(realPos, wires[i])){
				currWire = wires[i];
				wires.splice(i, 1);
			}
		}
		dragged(clickPos, mousePos);
	} else {
		if(selObject != null){
			if(selObject instanceof Input){
				selObject.click();
			} else {
				for(let i in comps){
					if(comps[i] == selObject){
						comps.splice(i, 1);
					}
				}
			}
		}
		for(let i in wires){
			if(checkWireClick(mousePos, wires[i])){
				wires.splice(i, 1);
			}
		}
	}

	mouseDown = false;
	mouseDragged = false;

	currWire = null;
	clickPos = null;
	selObject = null;
	selCon = null;
});

canv.addEventListener("mousedown", e => {
	mouseDown = true;
	clickPos = mousePos;

	if(newComp != null){
		console.log(newComp);
		newComp.updatePos(new Vector2(mousePos));
		comps.push(newComp);
		newComp = null;
		return;
	}

	for(let button of buttons){
		if(button.wasClicked(realPos)){
			button.onClick();
			return;
		}
	}

	let mouseCol = new Collider(mousePos.x, mousePos.y, CS, CS);

	for(let comp of comps){
		if(overlap(mouseCol, comp.col)){
			selObject = comp;
			return;
		}
		for(let i of comp.cons){
			for(let j of i){
				if(overlap(mouseCol, j.col)){
					selCon = j;
				}
			}
		}
	}

	for(let i in wires){
		let wire = wires[i];
		if(checkWireClick(mousePos, wire)){
			currWire = wire;
			wires.splice(i, 1);
			return;
		}
	}

	currWire = new Wire([[mousePos.x + CS / 2, mousePos.y + CS / 2]]);
});
//endregion EventListeners

setInterval(e => {
	if(mouseDown){
		if(dist(clickPos, mousePos) > minMouseMove){
			mouseDragged = true;
		}
	}

	context.fillStyle = "#EEE";
	context.fillRect(0, 0, width, height + drawerHeight);

	context.fillStyle = "#000";
	for(let i = 0; i <= width; i+= CS){
		for(let j = 0; j <= height; j+= CS){
			context.fillRect(i - 1, j - 1, 2, 2);
		}
	}

	for(let wire of wires){
		renderWire(wire);
	}

	if(currWire != null){
		let pathCoords = [
			new Vector2(clickPos),
			new Vector2(clickPos.x, mousePos.y),
			new Vector2(mousePos)
		];
		pathCoords = pathCoords.map(elem => elem.addBoth(CS / 2));
		currWire.paths.push(pathCoords);

		renderWire(currWire);

		currWire.paths.pop();
	}

	for(let comp of comps){
		context.fillStyle = comp.state ? "#AAA" : "#444";
		let img = gateImg(comp.type);
		if(img != null){
			context.drawImage(img, comp.col.pos.x, comp.col.pos.y, comp.col.size.x, comp.col.size.y);
		} else {
			comp.col.show(context);
		}

		for(let i of comp.cons){
			for(let j of i){
				context.fillStyle = "#000";
				j.col.show(context);
			}
		}
	}

	if(newComp != null){
		let img = gateImg(newComp.type);
		if(img != null){
			context.drawImage(img, mousePos.x, mousePos.y, newComp.col.size.x, newComp.col.size.y);
		} else {
			context.fillStyle = "#444";
			context.fillRect(mousePos.x, mousePos.y, newComp.col.size.x, newComp.col.size.y);
		}
	}

	for(let i = 0; i < buttonTypes.length; i++){
		let button = buttons[i];
		let img = gateImg(buttonTypes[i]);
		if(img != null){
			context.drawImage(img, button.pos.x, button.pos.y, button.size.x, button.size.y);
		} else {
			context.fillStyle = "#F00";
			context.fillRect(button.pos.x, button.pos.y, button.size.x, button.size.y);
		}
	}
}, 1000 / 60);
