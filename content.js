let profiles = [];
var apiKey = 'YOUR_API_KEY';
var temperature = '1';
var maxToken = '512';
var topP = '1';
var models = 'gpt-3.5-turbo-0301';
var autosubmit = 'checked';
var isDragging = false;
var lastX, lastY;  
var popup,icon;

//console.log("content.js running");
loadProfiles();
loadOptions();
CreateIcon();
CreatePopupWindow();
document.addEventListener('mousedown', function(event) {
	if (popup.contains(event.target)) {
		if(event.target.className!="GPTExtensioninput"&&event.target.className!="GPTExtensiontextarea"){
			  isDragging = true;
			  lastX = event.clientX;
			  lastY = event.clientY;
		  }
		}
});		
document.addEventListener('mousemove', function(event) {
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

document.addEventListener("mouseup", function(event) {
  isDragging = false;
  var selection = window.getSelection().toString();
  if (selection.length > 1) {  
	if(popup.style.display==='none')
	{
		icon.style.left = (event.pageX+5) + "px";
		icon.style.top = (event.pageY+5) + "px";
		icon.style.display='';
	}	
	else{
		const isinsidepopup = event.target.closest('.GPTExtensionForm');
		if (isinsidepopup) {
			return; // clicked element is inside the popup window, do nothing
		}
		loadOptions();
		document.getElementById("customizeEdit").value = selection; // set the value of the textarea to the selected text	
		//document.getElementById('status').innerHTML = "mouseup:"+autosubmit;
		if(autosubmit=='checked')
			makeStreamApiCall(); 
		
	}
	
  } 
  else {
      icon.style.display='none';
	  if (popup.contains(event.target)) {
		return; // clicked element is inside the popup window, do nothing
		}	
	 popup.style.display='none';
  }
});

function SwitchProfile(){
  const selectElement = document.querySelector("#defaultselect");
  const selectedOptionValue = selectElement.value;

  profiles.forEach((profile) => {
    if (`${profile.savecustom}` === selectedOptionValue) {
       document.getElementById("user").value = profile.saveuser;
    }
  });
	
};

function showStatus(infostring){
	  document.getElementById('status').textContent = infostring;
	  setTimeout(function() {
      document.getElementById('status').textContent = '';
    }, 1000);	
}

function reloadProfileUI(){
		  // Get the select element by its ID
			const selectElement = document.getElementById('defaultselect');
			selectElement.innerHTML='';
			// Iterate over the profiles array and create an option element for each profile
			profiles.forEach(profile => {
			  const optionElement = document.createElement('option');
			  optionElement.setAttribute('value', profile.savecustom);
			  optionElement.textContent =profile.savecustom;
			  selectElement.appendChild(optionElement);
			});
		    // set the first option as selected
			if (selectElement && selectElement.options.length > 0) {
				selectElement.options[0].setAttribute('selected', 'selected');
			}
			if(profiles.length>0)
				document.getElementById("user").value = profiles[0].saveuser;


}

function createDefaultProfiles(){
    profiles = [];
	//console.log("create default profiles");
	// Define a new profile object
	const newProfile1 = {
	  savecustom: 'tranlator',
	  saveuser: 'Rewrite the text in authentic English:'
	};
	// Add the new profile to the profiles array
	profiles.push(newProfile1);
	// Define a new profile object
	const newProfile2 = {
	  savecustom: 'proofreader',
	  saveuser: 'Proofread the following content in original language:'
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

function loadProfiles(){	
return new Promise((resolve, reject) => {
  chrome.storage.sync.get(['saveprofiles'], function(result) {
//	  console.log(result);	
	  if(result.length==0)
		createDefaultProfiles();
	  else
		profiles=result.saveprofiles;
	  reloadProfileUI();
	  showStatus("LoadProfiles");
	  resolve();
  });
});  
};
  
function loadOptions(){	
  return new Promise((resolve, reject) => {
	// Load the saved options from storage
	chrome.storage.sync.get(['options'], (result) => {
    // Set the saved options as the default values
    const options = result.options;
    if (options) {
		if(options.saveapiKey)
			apiKey = options.saveapiKey;
		if(options.savetemperature)
			temperature = options.savetemperature;
		if(options.savemaxToken)
			maxToken = options.savemaxToken;
		if(options.savetopP)
			topP = options.savetopP;
		if(options.savemodels)	
			models = options.savemodels;
		if(options.saveautosubmit!=autosubmit)	
			autosubmit = options.saveautosubmit;
		//this is not a bug, take some time to allow the options save finished.
		//document.getElementById('response').innerHTML = autosubmit+"after LoadOptions:"+options.saveautosubmit+(options.saveautosubmit!=autosubmit)+(options.saveautosubmit==autosubmit)+(options.saveautosubmit===autosubmit);
    };
	  showStatus("LoadOptions");
	  resolve();
  });
});
};


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

function makeStreamApiCall() {
	const API_KEY = apiKey;
	const API_URL = "https://api.openai.com/v1/chat/completions";
	const xhr = new XMLHttpRequest();
	xhr.open("POST", API_URL, true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader("Authorization", `Bearer ${API_KEY}`);
	xhr.setRequestHeader('Accept', 'text/event-stream');
	
//    var systemstring=document.getElementById('custom').value+document.getElementById('user').value;
    var userstring=document.getElementById('user').value+": "+document.getElementById('customizeEdit').value;
	console.log(userstring);
    document.getElementById('response').innerHTML = "<b>submit following text to api:</b>"+userstring;
	const reqBody = {
		messages: [
			  //{"role": "system", "content": "You answer questions factually based on the context provided."},
			  //{"role": "system","name":"context","content": systemstring},
			  {"role": "user", "content":userstring}],
		model: models,
		max_tokens: maxToken,
		temperature: temperature,
		top_p: topP,
		stream: true,
	};

	xhr.onreadystatechange = function() {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			console.log("Stream request completed successfully.");
		}
	};

	xhr.onprogress = function(event) {
		/*
		if (event.lengthComputable) {
			console.log(`Received ${event.loaded} bytes of data.`);
		} else {
			console.log(`Received data.`);
		}
		*/
		const responseText = xhr.responseText.trim();
		if (responseText.length > 0) 
		{
			let buffer = '';
			let responseJson;
			let lines = responseText.split('\n');
			for (let i = 0; i < lines.length; i++) 
			{
				let line = lines[i].trim();
				//console.log(line);
				if (line.startsWith('data:')) 
				{
					line = line.substring(5).trim();
					if(line!='[DONE]'){
						responseJson = JSON.parse(line);
						if(responseJson.choices[0].delta.content)
							buffer+=responseJson.choices[0].delta.content;
					}
				}; 
			};				
			document.getElementById('response').innerHTML = buffer;
		} else 
		{
			console.log("Stream request completed.");
		}
	};

	xhr.send(JSON.stringify(reqBody));
}


function CreateIcon(){
    icon = document.createElement("img");
    icon.id = "text-highlight-icon";
    icon.src = chrome.runtime.getURL("icon.png");
    icon.style.position = "absolute";
	icon.style.left ="0px";
	icon.style.top = "0px";
	icon.style.zIndex = "9999";
	icon.style.display = 'none';
    document.body.appendChild(icon);
	
	icon.addEventListener("click", async () => {
		icon.style.display = 'none';
		document.getElementById("popupwindow").style.display='';
		document.getElementById('popupwindow').style.left = event.pageX + "px";
		document.getElementById('popupwindow').style.top = event.pageY + "px";
		var selection = window.getSelection().toString();
		document.getElementById("customizeEdit").value = selection; // set the value of the textarea to the selected text	
		//document.getElementById('status').innerHTML = autosubmit+"iconclick:"+(autosubmit=='checked')+(autosubmit==='checked');
		await Promise.all([loadProfiles(), loadOptions()]);
		if(autosubmit=='checked')
			makeStreamApiCall(); 

	});	  
}

function CreatePopupWindow(){
    popup = document.getElementById("popupwindow");
	if (!popup) {
			popup = document.createElement("div");
			popup.id = "popupwindow";
			popup.className="GPTExtensionForm";
			popup.style.position = "absolute";
			popup.style.left = "0px";
			popup.style.top = "0px";
			popup.style.zIndex = "9999";
			popup.style.backgroundColor = "#ffffff"; // set background color to white
			popup.style.border = "1px solid #ccc"; // set border to 1px solid gray
			popup.style.width = "600px";
			popup.style.display = 'none';	
			popup.innerHTML = `
			  <head>
				<link rel="stylesheet" href="${chrome.runtime.getURL("options.css")}">
			  </head>		
			 <div class="GPTExtensionForm">
				<label class="GPTExtensionlabel" for="defaultselect">Chose your ChatGPT Profile:</label>
				<select class="GPTExtensionselect" id="defaultselect" name="defaultselect">
					</select>
			  <input class="GPTExtensioninput" id="user" type="text">
				
			  <div class="GPTExtensiondiv" id="response">response area</div>
			  <div class="GPTExtensionbutton-container">
			 <button class="GPTExtensionbutton"  id="copyButton">
				  Copy to clipboard
				  <img src="${chrome.runtime.getURL("copytoclipboard.png")}" alt="Copy to Clipboard">
			 </button>
			 <button class="GPTExtensionbutton"  id="copyToEditButton">
				  Copy to Edit 
				  <img src="${chrome.runtime.getURL("copytotextarea.png")}" alt="Copy to Edit">
			</button>
			</div>
			  <textarea class="GPTExtensiontextarea" id="customizeEdit" rows="5"></textarea>
			  <div class="GPTExtensionbutton-container">
				<button class="GPTExtensionbutton" id="submitButton">Submit</button><div id="status"></div>
				<button class="GPTExtensionbutton" id="optionsButton">Options</button>
			  </div>
		  </div>
			`;
			document.body.appendChild(popup);
			reloadProfileUI();
			document.querySelector('#defaultselect').addEventListener('change', () => { 
				SwitchProfile();
			}); 

			document.getElementById('copyButton').addEventListener('click', () => {
			  navigator.clipboard.writeText(document.getElementById('response').innerText)
				.then(() => {
				  console.log('Text copied to clipboard');
				})
				.catch((err) => {
				  console.error('Failed to copy text: ', err);
				});
			});

			document.getElementById('copyToEditButton').addEventListener('click', () => {
			  var textarea = document.getElementById("customizeEdit");
			  textarea.value = document.getElementById('response').innerText;
			});
			document.getElementById('optionsButton').addEventListener('click', () => {
			   chrome.runtime.sendMessage({ action: 'openOptionsPage' });
			});

			document.getElementById('submitButton').addEventListener('click', () => {
			  makeStreamApiCall(document.getElementById('customizeEdit').value);
			});
		
		};	
	
}

