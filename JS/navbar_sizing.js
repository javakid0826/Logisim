//NOTHING IN HERE IS USED PLEASE DON'T TAKE IT INTO ACCOUNT TOO MUCH

//Get all the navbars
const nav = document.getElementsByClassName("startNav")[0];

//This is basically just String.length but it treats &xxxx; character codes as one character
const findLen = innerHTML => {
	let len = 0;
	for(let i = 0; i < innerHTML.length; i++){
		if(innerHTML.charAt(i) == "&"){
			while(innerHTML.charAt(i) != ";"){
				i++;
			}
		}
		len++;
	}
	return len;
}

const findArrLength = arr => {
	let totalSize = 0;
	arr.forEach(child => totalSize+= findLen(child));
	return totalSize;
}

//Resize the navbars with the window
const resize = () => {
	//region Text
	//Store the total size of the contents of the nav bar
	let totalSize = findArrLength(Array.from(nav.children).map(child => child.innerHTML));

	let windWidth = Math.floor((window.innerWidth / window.innerHeight) * 1080 / 50);

	let windSize = window.innerWidth / totalSize;

	let size = windSize > 20 ? 20 : windSize;

	//Style the height of the navbar items
	//nav.style.height = size * 1.5 + "px";
	for(let i = 0; i < nav.children.length; i++){
		//Style the height of the navbar items font
		//nav.children[i].style.fontSize = size + "px";
	}
	//endregion Text

	//region WhatTheHell
	// let coords = [];
	//
	// let currIndex = 0;
	//
	// for(let i = 0; i < nav.children.length; i++){
	// 	coords[currIndex] = [];
	// 	while(findArrLength(coords[currIndex]) < Math.floor(window.innerWidth / 50) && i < nav.children.length){
	// 		coords[currIndex].push(nav.children[i].innerHTML);
	// 		i++;
	// 	}
	// 	i--;
	// 	currIndex++;
	// }
	//
	// console.log(coords);
	//
	// let totalCols = 1;
	// coords.map(coord => totalCols*= findArrLength(coord));
	// let colsArr = [];
	// for(let i = 0; i < totalCols; i++){
	// 	colsArr[i] = "auto";
	// }
	//
	// nav.style.gridTemplateColumns = colsArr.join(" ");
	// nav.style.gridTemplateRows = coords.map(elem => "auto").join(" ");
	//
	// let i = 0;
	// for(let j in coords){
	// 	let arr = coords[j];
	// 	let scalar = 1;
	// 	coords.map(elem => scalar*= elem == arr ? 1 : findArrLength(elem));
	// 	console.log(scalar);
	// 	let runningTotal = 0;
	// 	for(let item of arr){
	// 		let num = findLen(item) * scalar;
	// 		nav.children[i].style.gridColumnStart = runningTotal;
	// 		nav.children[i].style.gridColumnEnd = runningTotal + num;
	// 		nav.children[i].style.gridRowStart = +j + 1;
	// 		runningTotal+= num;
	// 		i++;
	// 	}
	// }
	//endregion WhatTheHell

	let navs = [];

	let coords = [];

	let currIndex = 0;

	document.getElementById("acNav").innerHTML = "";

	for(let i = 0; i < nav.children.length; i++){
		coords[currIndex] = [];
		while(findArrLength(coords[currIndex]) < windWidth && i < nav.children.length){
			coords[currIndex].push(nav.children[i].innerHTML);
			i++;
		}
		i--;
		let div = document.createElement("nav");
		for(let n in coords[currIndex]){
			let newNav = document.createElement("a");
			newNav.className = nav.children[i - n].className;
			newNav.innerHTML = coords[currIndex][n];
			div.appendChild(newNav);
		}
		document.getElementById("acNav").appendChild(div);
		navs.push(div);
		currIndex++;
	}

	console.log(windWidth);

	for(let nav of navs){
		nav.className = "nav";
		nav.style.gridTemplateColumns = Array.from(nav.children)
			.map(child => findLen(child.innerHTML))
			.join("fr ") + "fr";
	}
}

// resize();
//
// window.onresize = resize;
