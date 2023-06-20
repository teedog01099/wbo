/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */


(function () { //Code isolation

	var end = false,
		curId = "",
		curUpdate = { //The data of the message that will be sent for every new point
			'type': 'update',
			'id': "",
			'path': "",
			'x': 0,
			'y': 0,
			'x2': 0,
			'y2': 0
		},
		lastTime = performance.now(); //The time at which the last point was drawn





	console.log("we call image:init")


	function draw(data) {
		Tools.drawingEvent = true;
		switch (data.type) {
			case "image":
				createShape(data);
				break;
			case "update":
				var shape = svg.getElementById(data['id']);
				if (!shape) {
					console.error("Straight shape: Hmmm... I received a point of a rect that has not been created (%s).", data['id']);
					createShape({ //create a new shape in order not to loose the points
						"id": data['id'],
						"x": data['x2'],
						"y": data['y2']
					});
				}
				updateShape(shape, data);
				break;
			default:
				console.error("Straight shape: Draw instruction with unknown type. ", data);
				break;
		}
	}

	function handleFileSelection(event) {
		const file = event.target.files[0];
		// Do something with the selected file
		console.log('Selected file:', file);

		const formData = new FormData();
		formData.append('file', file);
		formData.append('token', Tools.token);

		const xhr = new XMLHttpRequest();
		xhr.open('POST', Tools.server_config.STEM + '/upload', true);

		// Set the authorization header
		xhr.setRequestHeader('Authorization', `${Tools.token}`);



		xhr.onload = function () {
			if (xhr.status === 200) {
				// File uploaded successfully
				console.log('File uploaded!');

				var baseUrl = window.location.protocol + "//" + window.location.host + Tools.server_config.STEM

				// Fetch the image path from server
				var imagePath = baseUrl + xhr.responseText;




				// Create a new JavaScript Image object
				var img = new Image();
				img.onload = function() {
					// Assuming 'svgCanvas' is your SVG element
					var svgCanvas = document.getElementById('canvas');


					//var svgCanvas = document.getElementById('canvas');
					var drawingArea = document.getElementById('drawingArea');
					var rect = drawingArea.getBoundingClientRect();

					var centerX = rect.left + window.pageXOffset + rect.width / 2;
					var centerY = rect.top + window.pageYOffset + rect.height / 2;

					curId = Tools.generateUID("y");

					var msg = {
						'type': 'image',
						'id': curId,

						'path': imagePath,

						'centerX': centerX,
						'centerY': centerY,

						'x': centerX,
						'y': centerY,
						'x2': centerX+img.naturalWidth,
						'y2': centerY+img.naturalHeight
					}

					Tools.drawAndSend(msg, Tools.list["Image"]);

					curUpdate.id = curId;
					curUpdate.x = centerX-600;
					curUpdate.y = centerY-600;


				}
				img.src = imagePath;




			} else {
				// Error uploading file
				console.error('Error uploading file:', xhr.responseText);
			}
		};

		xhr.onerror = function () {
			console.error('Request failed');
		};

		xhr.send(formData);




	}


	function openImage() {

		console.log("we open Image")

		var filePicker = document.getElementById("filePicker");

		filePicker.addEventListener('change', handleFileSelection);

		filePicker.click()


	}



	function move(x, y, evt) {
		/*Wait 70ms before adding any point to the currently drawing shape.
		This allows the animation to be smother*/

		console.log(curUpdate)


		if (curId !== "") {

			curUpdate['x2'] = x;
			curUpdate['y2'] = y;


			if (performance.now() - lastTime > 70 || end) {
				Tools.drawAndSend(curUpdate);
				lastTime = performance.now();
			} else {
				draw(curUpdate);
			}
		}
		if (evt) evt.preventDefault();
	}





	var svg = Tools.svg;
	function createShape(data) {
		//Creates a new shape on the canvas, or update a shape that already exists with new information
		var shape = svg.getElementById(data.id) || Tools.createSVGElement("image");
		shape.id = data.id;
		updateShape(shape, data);
		//If some data is not provided, choose default value. The shape may be updated later


		//shape.setAttribute("stroke", data.color || "black");
		//shape.setAttribute("stroke-width", data.size || 10);
		//shape.setAttribute("opacity", Math.max(0.1, Math.min(1, data.opacity)) || 1);



		//shape.setAttributeNS(null, 'x', data.centerX - 600);  // set x
		//shape.setAttributeNS(null, 'y', data.centerY - 600);  // set y

		//shape.setAttributeNS(null, 'height', '1200');  // set height
		//shape.setAttributeNS(null, 'width', '1200');  // set width

		shape.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

		shape.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', data.path);



		Tools.drawingArea.appendChild(shape);
		return shape;
	}



	function updateShape(shape, data) {
		shape.x.baseVal.value = Math.min(data['x2'], data['x']);
		shape.y.baseVal.value = Math.min(data['y2'], data['y']);
		shape.width.baseVal.value = Math.abs(data['x2'] - data['x']);
		shape.height.baseVal.value = Math.abs(data['y2'] - data['y']);
	}


	var imageTool = {
		"name": "Image",
		"shortcut": "y",
		"listeners": {
			//"press": start,
			"move": move,
			"release": stop,
		},

		"oneTouch": true,
		"onstart": openImage,
		"draw": draw,

		"mouseCursor": "crosshair",
		"icon": "tools/image/icon.svg",
		"stylesheet": "tools/image/image.css"
	};
	Tools.add(imageTool);

})(); //End of code isolation
