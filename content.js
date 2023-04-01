let profiles = [];
var apiKey = '';
var temperature = '1';
var maxToken = '512';
var topP = '1';
var models = 'gpt-3.5-turbo';
var autosubmit = '';
var autocontext = 'checked';
var contextmenuonly = '';
var isDragging = false;
var isResizing = false;
var mouseIsDown = false;
var isPinned = false;
var isStreaming = false;
var lastX, lastY;
var popup, icon;
if (typeof isPlayground === "undefined") {
	// isPlayground is not defined
	var isPlayground = false;
}

const fontSizeMin = 16; // minimum font size
const fontSizeMax = 24; // maximum font size
const formWidthMin = 400; // minimum form width
const formWidthMax = 800; // maximum form width

function updateFontSize() {
	// Get the current width of the form
	const formWidth = popup.offsetWidth;

	// Calculate the font size based on the current width
	const fontSize = Math.floor((formWidth - formWidthMin) / (formWidthMax - formWidthMin) * (fontSizeMax - fontSizeMin) + fontSizeMin);

	// Set the font size of the form elements
	popup.style.fontSize = `${fontSize}px`;
}


//console.log("content.js running");
loadProfiles();
loadOptions();
createContextIcons();
createPopupWindow();

function mouseIsAtResizeHolder(e) {
	var rect = popup.getBoundingClientRect();
	var cursorX = e.clientX;
	var cursorY = e.clientY;
	//console.log(cursorX,cursorY,rect.right,rect.bottom);
	if (cursorX > rect.right - 15 && cursorY > rect.bottom - 15) {
		return true;
	}
	else
		return false;
}

document.addEventListener('keydown', function(event) {
	if (event.key === 'Enter') {
	  let activeElement = document.activeElement;
	  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
		let value = activeElement.value;
		let gptIndex = value.indexOf('//gpt');
		if (gptIndex !== -1) {
		  event.preventDefault();
		  let textInput = value.slice(gptIndex + 5);
		  makeAPIcall(textInput).then(response => {
			activeElement.value = value.slice(0, gptIndex) + response;
		  }).catch(error => {
			console.log(error);
		  });
		}
	  }
	}
  });

function makeAPIcall(textInput) {

	const API_KEY = apiKey;
	const API_URL = "https://api.openai.com/v1/chat/completions";
	return new Promise((resolve, reject) => {
	  const xhr = new XMLHttpRequest();
	  xhr.open("POST", API_URL, true);
	  xhr.setRequestHeader("Content-Type", "application/json");
	  xhr.setRequestHeader("Authorization", `Bearer ${API_KEY}`);
	  xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
		  const assistant = JSON.parse(this.responseText);
		  const responsemessage = assistant.choices[0].message.content;		  
		  resolve(responsemessage);
		} else if (this.readyState === XMLHttpRequest.DONE && this.status !== 200) {
		  reject("API Call failed. Status code: " + this.status);
		}
	  };
	  const data = {
		messages: [
		{"role": "user", "content":textInput}],
		temperature: temperature,
		max_tokens: maxToken,
		model: models,
		top_p: topP
	  };  
	xhr.send(JSON.stringify(data));
	});
  }


document.addEventListener('mousedown', function (event) {
	if (mouseIsAtResizeHolder(event))
		return;

	if (event.target.className == 'GPTExtensionForm' || event.target.className == 'GPTExtensionbutton-container' || event.target.className == 'GPTExtensionresponse') {
		//	if (popup.contains(event.target)) {
		//		if(event.target.className!="GPTExtensioninput"&&event.target.className!="GPTExtensiontextarea"){
		isDragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
		//		  }
	}
});
document.addEventListener('mousemove', function (event) {
	if (isDragging) {
		var deltaX = event.clientX - lastX;
		var deltaY = event.clientY - lastY;
		var newX = popup.offsetLeft + deltaX;
		var newY = popup.offsetTop + deltaY;
		popup.style.left = newX + 'px';
		popup.style.top = newY + 'px';
		lastX = event.clientX;
		lastY = event.clientY;
	}
});

document.addEventListener("mouseup", function (event) {
	isDragging = false;
	if (popup.contains(event.target)) {
		return;
	}

	var selection = window.getSelection().toString();
	if (selection.length > 1) {
		if (popup.style.display === 'none') {
			if (contextmenuonly != 'checked') {
				icon.style.left = (event.pageX + 5) + "px";
				icon.style.top = (event.pageY + 5) + "px";
				icon.style.display = '';
			}
		}
		else {
			updateFontSize();
			const isinsidepopup = event.target.closest('.GPTExtensionForm');
			if (isinsidepopup) {
				return; // clicked element is inside the popup window, do nothing
			}
			loadOptions();
			document.getElementById("customizeEdit").value = selection; // set the value of the textarea to the selected text	
			//document.getElementById('status').innerHTML = "mouseup:"+autosubmit;
			if (autosubmit == 'checked')
				makeStreamApiCall();

		}

	}
	else {
		icon.style.display = 'none';
		if (isPinned)
			return;
		if (popup.contains(event.target)) {
			return; // clicked element is inside the popup window, do nothing
		}
		if (!isPlayground)
			popup.style.display = 'none';
	}
});


function switchProfile() {
	const selectElement = document.querySelector("#defaultselect");
	const selectedOptionValue = selectElement.value;

	profiles.forEach((profile) => {
		if (`${profile.savecustom}` === selectedOptionValue) {
			document.getElementById("user").value = profile.saveuser;
		}
	});

};

function showStatus(infostring) {
	document.getElementById('status').textContent = infostring;
	setTimeout(function () {
		document.getElementById('status').textContent = '';
	}, 3000);
}

function reloadProfileUI() {
	// Get the select element by its ID
	const selectElement = document.getElementById('defaultselect');
	selectElement.innerHTML = '';
	// Iterate over the profiles array and create an option element for each profile
	profiles.forEach(profile => {
		const optionElement = document.createElement('option');
		optionElement.setAttribute('value', profile.savecustom);
		optionElement.textContent = profile.savecustom;
		selectElement.appendChild(optionElement);
	});
	// set the first option as selected
	if (selectElement && selectElement.options.length > 0) {
		selectElement.options[0].setAttribute('selected', 'selected');
	}
	if (profiles.length > 0)
		document.getElementById("user").value = profiles[0].saveuser;


}

function createDefaultProfiles() {
	profiles = [];
	//console.log("create default profiles");
	// Define a new profile object
	const newProfile1 = {
		savecustom: 'translator',
		saveuser: 'Rewrite following content in authentic English:'
	};
	// Add the new profile to the profiles array
	profiles.push(newProfile1);
	// Define a new profile object
	const newProfile2 = {
		savecustom: 'proofreader',
		saveuser: 'Proofread following content using content\'s language:'
	};
	// Add the new profile to the profiles array
	profiles.push(newProfile2);
	// Define a new profile object
	const newProfile3 = {
		savecustom: 'summarizer',
		saveuser: 'Summarize following content in less than 20 words:'
	};
	// Add the new profile to the profiles array
	profiles.push(newProfile3);
};

function loadProfiles() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['saveprofiles'], function (result) {
			//	  console.log(result);	
			if (!result.saveprofiles || result.saveprofiles.length == 0)
				createDefaultProfiles();
			else
				profiles = result.saveprofiles;
			reloadProfileUI();
			showStatus("Load Profiles");
			resolve();
		});
	});
};

function loadOptions() {
	return new Promise((resolve, reject) => {
		// Load the saved options from storage
		chrome.storage.local.get(['options'], (result) => {
			// Set the saved options as the default values
			const options = result.options;
			if (options) {
				if (options.saveapiKey)
					apiKey = options.saveapiKey;
				if (options.savetemperature)
					temperature = options.savetemperature;
				if (options.savemaxToken)
					maxToken = options.savemaxToken;
				if (options.savetopP)
					topP = options.savetopP;
				if (options.savemodels)
					models = options.savemodels;
				if (options.saveautosubmit != autosubmit)
					autosubmit = options.saveautosubmit;
				if (options.saveautocontext != autocontext)
					autocontext = options.saveautocontext;
				if (options.savecontextmenuonly != contextmenuonly)
					contextmenuonly = options.savecontextmenuonly;
				//this is not a bug, take some time to allow the options save remote to finished. because need to sync to google account we change to local storage now
				//document.getElementById('response').innerHTML = autosubmit+"after LoadOptions:"+options.saveautosubmit+(options.saveautosubmit!=autosubmit)+(options.saveautosubmit==autosubmit)+(options.saveautosubmit===autosubmit);
			};
			showStatus("Load Options");
			resolve();
		});
	});
};

/* working but not use any more
function makeApiCall(selectedText) {
	const API_KEY = apiKey;
	const API_URL = "https://api.openai.com/v1/chat/completions";
	const xhr = new XMLHttpRequest();
	xhr.open("POST", API_URL, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Authorization", `Bearer ${API_KEY}`);
	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
		  const assistant = JSON.parse(this.responseText);
		//  console.log(assistant);
		  const responsemessage = assistant.choices[0].message.content;
		//  console.log(responsemessage);
		document.getElementById('response').innerHTML = responsemessage;
		}
		else{
		document.getElementById('response').innerHTML = "Request fail, Please check the options. Make sure you have input the correct openAI api key and correct model name.";	
		}
  };
	

  //var systemstring=document.getElementById('custom').value+document.getElementById('user').value;
  var userstring=document.getElementById('user').value+': '+document.getElementById('customizeEdit').value;
	
  document.getElementById('response').innerHTML = "<b>submit following text to api:</b>"+userstring;
  const data = {
	  messages: [
	  //{"role": "system", "content": "You answer questions factually based on the context provided."},
	  //{"role": "system","name":"context","content": systemstring},
	  {"role": "user", "content":userstring}],
	  temperature: temperature,
	  max_tokens: maxToken,
	  model: models,
	  top_p: topP
	};  
  xhr.send(JSON.stringify(data));
};
*/
function processSpecialChar(text) {
	text = text.replace(/&/g, "&amp;");
	text = text.replace(/</g, "&lt;");
	text = text.replace(/>/g, "&gt;");
	text = text.replace(/"/g, "&quot;");
	text = text.replace(/'/g, "&apos;");
	return text;
}

function makeStreamApiCall() {
	isStreaming=true;
	const API_KEY = apiKey;
	const API_URL = "https://api.openai.com/v1/chat/completions";
	const xhr = new XMLHttpRequest();
	xhr.open("POST", API_URL, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Authorization", `Bearer ${API_KEY}`);
	xhr.setRequestHeader('Accept', 'text/event-stream');

	//    var systemstring=document.getElementById('custom').value+document.getElementById('user').value;
	var userstring = document.getElementById('user').value + "```" + document.getElementById('customizeEdit').value;
	const reqBody = {
		messages: [
			//{"role": "system", "content": "You answer questions factually based on the context provided."},
			//{"role": "system","name":"context","content": systemstring},
			...buildContextString(),
			{ "role": "user", "content": userstring }],
		model: models,
		max_tokens: maxToken,
		temperature: temperature,
		top_p: topP,
		stream: true,
	};
	const userContainer = createResponse('user', userstring);
	const parentresponsContainer = document.getElementById('response');
	parentresponsContainer.appendChild(userContainer);
	parentresponsContainer.scrollTop = userContainer.offsetTop - parentresponsContainer.offsetTop;

	const responseContainer = createResponse('assistant', '...');
	parentresponsContainer.appendChild(responseContainer);
	parentresponsContainer.scrollTop = responseContainer.offsetTop - parentresponsContainer.offsetTop;

	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			isStreaming=false;
			showStatus("Stream request completed successfully.");
		}

	};

	xhr.onprogress = function (event) {
		/*
		if (event.lengthComputable) {
			console.log(`Received ${event.loaded} bytes of data.`);
		} else {
			console.log(`Received data.`);
		}
		*/
		if (xhr.status === 401 || xhr.status === 429) {
			const errorinfo = JSON.parse(xhr.responseText);
			console.log(errorinfo);
			const lastChild = responseContainer.lastChild;
			lastChild.innerHTML = errorinfo.error.message;
			showStatus(xhr.status);
			isStreaming=false;
			return;
		}


		const responseText = xhr.responseText.trim();
		if (responseText.length > 0) {
			let buffer = '';
			let responseJson;
			let lines = responseText.split('\n');
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i].trim();
				//console.log(line);
				if (line.startsWith('data:')) {
					line = line.substring(5).trim();
					if (line != '[DONE]') {
						responseJson = JSON.parse(line);
						if (responseJson.choices[0].delta.content)
							buffer += responseJson.choices[0].delta.content;
					}
				};
			};
			const lastChild = responseContainer.lastChild;
			lastChild.innerHTML = processSpecialChar(buffer);
			//console.log(parentresponsContainer.scrollTop ,responseContainer.offsetTop , parentresponsContainer.offsetTop);
			parentresponsContainer.scrollTop = responseContainer.offsetTop - parentresponsContainer.offsetTop;

		} else {
			isStreaming=false;
			showStatus("Stream request completed.");
		}
	};

	xhr.send(JSON.stringify(reqBody));
}

function buildContextString() {
	const checkboxes = document.querySelectorAll('.GPTExtensionrespons-checkbox:checked');
	const data = [];
	if (checkboxes.length == 0) {
		return data;
	}
	checkboxes.forEach((checkbox) => {
		const container = checkbox.closest('.GPTExtensionrespons-container');
		//console.log(container);
		const role = container.querySelector('.GPTExtensionrole').title;
		const content = container.querySelector('.GPTExtensioncontext').textContent;
		data.push({ "role": role, "content": content });
	});

	return data;

}

function updateContextSelect(event) {
	var needCheck = event.target.checked;
	//	if(event.target.id=="selectallcontexts")
	//			needCheck = event.target.checked=="checked";
	//console.log(event.target.checked,needCheck);
	if (needCheck)
		event.target.title = 'Unselect all chats';
	else
		event.target.title = 'Select all chats';
	const checkboxes = document.querySelectorAll('.GPTExtensionrespons-checkbox');
	const data = [];

	checkboxes.forEach((checkbox) => {
		if (checkbox.id == "add-to-context") {
			//		console.log(checkbox.checked,needCheck);
			checkbox.checked = needCheck;
		}

	});

	return data;

}

function exportContextToFile() {
	const contexts = buildContextString();
	if (contexts.length <= 0) {
		alert('Please select the context you want to save.');
		return;
	}

	const file = new Blob([JSON.stringify(contexts)], { type: 'application/json' });
	const url = URL.createObjectURL(file);

	const link = document.createElement('a');
	link.href = url;
	link.download = 'chat_history_data.json';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function importContextFromFile() {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = ".json";
	fileInput.addEventListener('change', event => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.addEventListener('load', event => {
			const newContexts = JSON.parse(reader.result);
			//console.log(newContexts);
			//load the context and append them at the end of respons area
			newContexts.forEach((context) => {
				document.getElementById('response').appendChild(createResponse(context.role, context.content));
			});
		});
		reader.readAsText(file);
	});


	// Click the input element to trigger the file selection dialog
	fileInput.click();

}



function createResponse(role, context) {
	// create the container div
	const container = document.createElement('div');
	container.classList.add('GPTExtensionrespons-container');

	// create the checkbox input
	const checkbox = document.createElement('input');
	checkbox.classList.add('GPTExtensionrespons-checkbox');
	checkbox.type = 'checkbox';
	checkbox.id = 'add-to-context';
	checkbox.name = 'add-to-context';
	checkbox.title = 'Add context to next submit';
	checkbox.checked = autocontext == 'checked' ? "checked" : '';

	// create the role img
	const roleImg = document.createElement('img');
	roleImg.classList.add('GPTExtensionrole');
	roleImg.src = chrome.runtime.getURL(role + '.png');
	roleImg.title = role;
	roleImg.addEventListener('click', function () {
		// rotate the roles "user", "assistant", "system"
		const roles = ["user", "assistant", "system"];
		const currentRole = roles.indexOf(roleImg.title);
		const nextRole = (currentRole + 1) % roles.length;
		roleImg.title = roles[nextRole];
		roleImg.src = chrome.runtime.getURL(roles[nextRole] + '.png');
	});

	// create the context div
	const contextDiv = document.createElement('div');
	contextDiv.classList.add('GPTExtensioncontext');
	contextDiv.textContent =processSpecialChar(context);

	// append the elements to the container
	container.appendChild(checkbox);
	container.appendChild(roleImg);
	container.appendChild(contextDiv);
	// add mouseover and mouseout event listeners to the parent container
	container.addEventListener('mouseover', showContextIcons);
	container.addEventListener('mouseout', hideContextIcons);
	// return the container element
	return container;
}

function createExtraIcons() {
	// create the copytoclipboardicon
	const copytoclipboardicon = document.createElement('img');
	copytoclipboardicon.src = chrome.runtime.getURL("copytoclipboard.png");
	copytoclipboardicon.id = 'copytoclipboard';
	copytoclipboardicon.alt = 'Copy to clipboard';
	copytoclipboardicon.title = 'Copy to clipboard';
	copytoclipboardicon.style.cursor = 'pointer';
	copytoclipboardicon.style.position = 'absolute';
	copytoclipboardicon.style.top = 0;
	copytoclipboardicon.style.left = 0;
	copytoclipboardicon.addEventListener('click', copyToClipboard);
	copytoclipboardicon.style.display = 'none';
	copytoclipboardicon.style.zIndex = '10000';


	// create the copytoediticon
	const copytoediticon = document.createElement('img');
	copytoediticon.src = chrome.runtime.getURL("copytotextarea.png");
	copytoediticon.id = 'copytoedit';
	copytoediticon.alt = 'Copy to edit';
	copytoediticon.title = 'Copy to edit';
	copytoediticon.style.cursor = 'pointer';
	copytoediticon.style.position = 'absolute';
	copytoediticon.style.top = 50;
	copytoediticon.style.left = 50;
	copytoediticon.addEventListener('click', copyToEdit);
	copytoediticon.style.display = 'none';
	copytoediticon.style.zIndex = '10000';


	// create the delete image
	const deletecontexticon = document.createElement('img');
	deletecontexticon.src = chrome.runtime.getURL("deletecontext.png");
	deletecontexticon.id = 'deletecurrentcontext';
	deletecontexticon.alt = 'Delete';
	deletecontexticon.title = 'Delete';
	deletecontexticon.style.cursor = 'pointer';
	deletecontexticon.style.position = 'absolute';
	deletecontexticon.style.top = 50;
	deletecontexticon.style.left = 50;
	deletecontexticon.addEventListener('click', deleteCurrentContext);
	deletecontexticon.style.display = 'none';
	deletecontexticon.style.zIndex = '10000';

	// get the parent container for the contextDiv elements
	const parentContainer = document.getElementById('response');

	// append the copytoclipboard and copytoedit images to the parent container
	parentContainer.appendChild(copytoclipboardicon);
	parentContainer.appendChild(copytoediticon);
	parentContainer.appendChild(deletecontexticon);


}
function saveContextIcons(takeover){

	const copyToClipboard = document.getElementById("copytoclipboard");
	const copyToEdit = document.getElementById("copytoedit");
	const deleteContext = document.getElementById("deletecurrentcontext");
	// append the contexticons to the parent container/next sibling
	takeover.appendChild(copyToClipboard);
	takeover.appendChild(copyToEdit);
	takeover.appendChild(deleteContext);
	copyToClipboard.style.display = 'none';
	copyToEdit.style.display = 'none';
	deleteContext.style.display = 'none';
}


function deleteCurrentContext(event) {
	const tobedelete = event.target.closest('.GPTExtensionrespons-container');
	var takeover = document.getElementById('response');
	console.log("delete context ",takeover);
	saveContextIcons(takeover);	
	tobedelete.remove();
}

// function to copy the text to the clipboard
function copyToClipboard(event) {
	const context = event.target.getAttribute('data-context');
	// code to copy the text to the clipboard
	if (context)
		navigator.clipboard.writeText(context);
}

// function to copy the text to an editable field
function copyToEdit(event) {
	const context = event.target.getAttribute('data-context');
	// code to copy the text to an editable field
	if (context)
		document.getElementById("customizeEdit").value = context;

}


// function to show the images
function showContextIcons(event) {
	if(isStreaming)
		return;	
	const container = event.target.closest('.GPTExtensionrespons-container');
	if (container) {
		const context = container.querySelector('.GPTExtensioncontext');
		if (context) {
			const copyToClipboard = document.getElementById("copytoclipboard");
			const copyToEdit = document.getElementById("copytoedit");
			const deleteContext = document.getElementById("deletecurrentcontext");

			const containerWidth = context.offsetWidth;
			const imagesWidth = 24;
			//		console.log(context.offsetTop,container.parentNode.scrollTop);
			const top = context.offsetTop + context.offsetHeight - container.parentNode.scrollTop - imagesWidth;

			copyToClipboard.style.top = `${top}px`;
			copyToClipboard.style.left = `${context.offsetLeft + containerWidth - imagesWidth * 3}px`;
			copyToClipboard.style.display = '';
			copyToClipboard.setAttribute('data-context', context.textContent.trim());
			context.appendChild(copyToClipboard);

			copyToEdit.style.top = `${top}px`;
			copyToEdit.style.left = `${context.offsetLeft + containerWidth - imagesWidth * 2}px`;
			copyToEdit.style.display = '';
			copyToEdit.style.zIndex = '10000';
			copyToEdit.setAttribute('data-context', context.textContent.trim());
			context.appendChild(copyToEdit);

			deleteContext.style.top = `${top}px`;
			deleteContext.style.left = `${context.offsetLeft + containerWidth - imagesWidth}px`;
			deleteContext.style.display = '';
			deleteContext.style.zIndex = '10000';
			context.appendChild(deleteContext);
		}
	}
}


// function to hide the images
function hideContextIcons(event) {
	//console.log(event.relatedTarget.id);
	if(isStreaming)
		return;
	if (!event.relatedTarget || (event.relatedTarget.id != "deletecurrentcontext" && event.relatedTarget.id != "copytoclipboard" && event.relatedTarget.id != "copytoedit")) {
		const takeover = document.getElementById('response');
		console.log("hide context icon ",takeover);
		saveContextIcons(takeover);

	}
}


function createContextIcons() {
	icon = document.createElement("img");
	icon.id = "text-highlight-icon";
	icon.src = chrome.runtime.getURL("icon.png");
	icon.style.position = "absolute";
	icon.style.left = "0px";
	icon.style.top = "0px";
	icon.style.zIndex = "9999";
	icon.style.display = 'none';
	document.body.appendChild(icon);

	icon.addEventListener("click", async (event) => {
		icon.style.display = 'none';
		popup.style.display = '';
		popup.style.position = "fixed";
		popup.style.left = event.clientX + "px";
		popup.style.top = event.clientY + "px";
		//popup.style.left = '50%';
		//popup.style.top = '50%';
		//document.getElementById('status').innerHTML = autosubmit+"iconclick:"+(autosubmit=='checked')+(autosubmit==='checked');
		await Promise.all([loadProfiles(), loadOptions()]);
		var selection = window.getSelection().toString();
		document.getElementById("customizeEdit").value = selection; // set the value of the textarea to the selected text	
		if (autosubmit == 'checked')
			makeStreamApiCall();

	});
}

function expandTextarea(t) {
	t.classList.add('GPTExtensionexpanded');
}

function collapseTextarea(t) {
	t.classList.remove('GPTExtensionexpanded');
}


function createPopupWindow() {
	popup = document.getElementById("popupwindow");
	if (!popup) {
		popup = document.createElement("div");
		popup.id = "popupwindow";
		popup.className = "GPTExtensionForm";
		popup.style.position = "fixed";
		popup.style.left = "0px";
		popup.style.top = "0px";
		popup.style.zIndex = "9999";
		popup.style.fontSize = '20px';
		if (!isPlayground) {
			popup.style.width = "600px";
			popup.style.height = "400px";
			popup.style.display = 'none';
		}
		else {
			popup.style.width = "95%";
			popup.style.height = "95%";
		}
		popup.id = "popupwindow";

		var head = document.createElement("head");
		var link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", chrome.runtime.getURL("options.css"));
		head.appendChild(link);
		popup.appendChild(head);

		const contextselect = document.createElement('input');
		//contextselect.classList.add('GPTExtensionrespons-checkbox');
		contextselect.type = 'checkbox';
		contextselect.id = 'selectallcontexts';
		contextselect.name = 'selectallcontexts';
		contextselect.title = 'Select all chats';
		contextselect.addEventListener('change', updateContextSelect);

		var pinimg = document.createElement("img");
		//pinimg.className = "GPTExtensionimg";
		pinimg.setAttribute("src", chrome.runtime.getURL("unpin.png"));
		pinimg.setAttribute("alt", "Pin");
		pinimg.setAttribute("title", "Click to pin");
		pinimg.id = "pinicon";
		// Add event listener for mouse movement
		pinimg.addEventListener("mouseover", function () {
			// Change the image source to the hovered image
			if (isPinned) {
				pinimg.src = chrome.runtime.getURL("pinnedgrey.png");
				pinimg.title = "Click to unpin";
			}
			else {
				pinimg.src = chrome.runtime.getURL("unpinblack.png");
				pinimg.title = "Click to pin";
			}
		});

		// Add event listener for mouse out
		pinimg.addEventListener("mouseout", function () {
			// Change the image source back to the original image
			if (isPinned)
				pinimg.src = chrome.runtime.getURL("pinned.png");
			else
				pinimg.src = chrome.runtime.getURL("unpin.png");
		});
		// Add event listener for mouse click
		pinimg.addEventListener("click", function () {
			// Change the image source to the clicked image
			if (isPinned) {
				isPinned = false;
				pinimg.src = chrome.runtime.getURL("unpinblack.png");
				pinimg.title = "Click to unpin";
			}
			else {
				isPinned = true;
				pinimg.src = chrome.runtime.getURL("pinnedgrey.png");
				pinimg.title = "Click to pin";
			}
		});

		var playgroundimg = document.createElement("img");
		playgroundimg.setAttribute("src", chrome.runtime.getURL("newplayground.png"));
		playgroundimg.setAttribute("alt", "playground");
		playgroundimg.setAttribute("title", "Open a new playground");
		playgroundimg.id = "newplaygroundicon";
		playgroundimg.addEventListener('click', function () {
			window.open(chrome.runtime.getURL('playground.html'), '_blank');
		});


		var importcontextimg = document.createElement("img");
		importcontextimg.setAttribute("src", chrome.runtime.getURL("importcontext.png"));
		importcontextimg.setAttribute("alt", "import");
		importcontextimg.setAttribute("title", "import chat history from JSON file");
		importcontextimg.id = "importcontexticon";
		importcontextimg.addEventListener('click', importContextFromFile);

		var exportcontextimg = document.createElement("img");
		exportcontextimg.setAttribute("src", chrome.runtime.getURL("exportcontext.png"));
		exportcontextimg.setAttribute("alt", "import");
		exportcontextimg.setAttribute("title", "export selected chat history to JSON file");
		exportcontextimg.id = "exportcontexticon";
		exportcontextimg.addEventListener('click', exportContextToFile);


		var optionsimg = document.createElement("img");
		optionsimg.setAttribute("src", chrome.runtime.getURL("options.png"));
		optionsimg.setAttribute("alt", "options");
		optionsimg.setAttribute("title", "Options");
		optionsimg.id = "optionsbutton";
		optionsimg.addEventListener('click', () => {
			chrome.runtime.sendMessage({ action: 'openOptionsPage' });
		});


		var buttonContainer = document.createElement("div");
		buttonContainer.className = "GPTExtensionbutton-container";
		buttonContainer.appendChild(contextselect);
		buttonContainer.appendChild(pinimg);
		buttonContainer.appendChild(playgroundimg);
		buttonContainer.appendChild(importcontextimg);
		buttonContainer.appendChild(exportcontextimg);
		buttonContainer.appendChild(optionsimg);

		popup.appendChild(buttonContainer);

		var response = document.createElement("div");
		response.className = "GPTExtensionresponse";
		response.id = "response";
		response.style.height = '40%';
		response.style.overflow = 'auto';
		response.style.minHeight = "40px";
		//response.textContent = "response area";
		//response.addEventListener('scroll', hideImages);
		popup.appendChild(response);


		var profileContainer = document.createElement("div");
		profileContainer.className = "GPTExtensionbutton-container";

		var profileSelect = document.createElement("select");
		profileSelect.className = "GPTExtensionselect";
		profileSelect.id = "defaultselect";
		profileSelect.name = "defaultselect";
		profileSelect.style.width = "30%";
		profileSelect.addEventListener('change', () => {
			switchProfile();
		});
		profileContainer.appendChild(profileSelect);

		var promptEdit = document.createElement("textarea");
		promptEdit.className = "GPTExtensiontextareablur";
		promptEdit.id = "user";
		promptEdit.style.height = "auto"; // set the initial height to auto
		promptEdit.style.height = "35px";
		promptEdit.addEventListener("input", function () {
			this.style.height = "auto";
			this.style.height = (this.scrollHeight) + "px";
		});
		promptEdit.addEventListener("blur", function () {
			this.style.removeProperty('height'); // remove the height property when the element loses focus
		});
		promptEdit.addEventListener("focus", function () {
			this.style.height = "auto";
			this.style.height = (this.scrollHeight) + "px";
		});
		profileContainer.appendChild(promptEdit);

		popup.appendChild(profileContainer);


		var customizeEdit = document.createElement("textarea");
		customizeEdit.className = "GPTExtensiontextarea";
		customizeEdit.id = "customizeEdit";
		customizeEdit.rows = "5";
		popup.appendChild(customizeEdit);


		var buttonContainer2 = document.createElement("div");
		buttonContainer2.className = "GPTExtensionbutton-container";


		var submitimg = document.createElement("img");
		submitimg.setAttribute("src", chrome.runtime.getURL("submit.png"));
		submitimg.setAttribute("alt", "submit");
		submitimg.setAttribute("title", "submit the content and selected context");
		submitimg.id = "submit";
		submitimg.addEventListener('click', () => {
			makeStreamApiCall(document.getElementById('customizeEdit').value);
		});


		var statusBar = document.createElement("div");
		statusBar.id = "status";
		statusBar.style.textAlign = "center";
		statusBar.style.fontSize = "10px";

		buttonContainer2.appendChild(statusBar);
		buttonContainer2.appendChild(submitimg);


		popup.appendChild(buttonContainer2);

		// Append the popup element to the document body
		document.body.appendChild(popup);
		createExtraIcons();

		reloadProfileUI();





	};

}


async function openEditor() {
	document.getElementById("popupwindow").style.display = '';
	await Promise.all([loadProfiles(), loadOptions()]);
	var selection = window.getSelection().toString();
	document.getElementById("customizeEdit").value = selection;
	if (autosubmit == 'checked')
		makeStreamApiCall();
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "openEditor") {
		openEditor().then(sendResponse);
		return true;
	}
});
