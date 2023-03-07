  var custom1Value = "Act as a tranlator.";
  var user1Value = 'Rewrite the text in authentic English:';
  var custom2Value = "Act as a proofreader.";
  var user2Value = 'Proofread the following content:';
  var custom3Value = "Act as a summerizer.";
  var user3Value = 'summerize following content in less than 100 words:';
  var apiKey = 'YOUR_API_KEY';
  var temperature = '0.5';
  var maxToken = '512';
  var topP = '1';
  var models = 'gpt-3.5-turbo-0301';
  var defaultAssistant = 'custom1user1';
  var autosubmit = 'checked';
  
console.log("content.js running");
CreateIcon();
CreatePopupWindow();

document.addEventListener("mouseup", function(event) {
  var selection = window.getSelection().toString();
  var icon = document.getElementById("text-highlight-icon");
  var popup = document.getElementById("popupwindow");
  if (selection.length > 1) {  
	if(popup.style.display==='none')
	{
		icon.style.left = event.pageX + "px";
		icon.style.top = event.pageY + "px";
		icon.style.display='';
	}	
	else{
		if (popup.contains(event.target)) {
			return; // clicked element is inside the popup window, do nothing
		}
		LoadOptions();
		document.getElementById("edit").value = selection; // set the value of the textarea to the selected text	
		//document.getElementById('status').innerHTML = "mouseup:"+autosubmit;
		if(autosubmit=='checked')
			makeApiCall(selection); 
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
	switch (document.querySelector('#defaultselect').value) { 
					case 'custom1user1': 
						document.getElementById('custom').value = custom1Value; 
						document.getElementById('user').value = user1Value; 
						break; 
					case 'custom2user2': 
						document.getElementById('custom').value = custom2Value; 
						document.getElementById('user').value = user2Value; 
						break; 
					case 'custom3user3': 
						document.getElementById('custom').value = custom3Value; 
						document.getElementById('user').value = user3Value; 
						break; 
					}; 
	
};


  
function LoadOptions(){	
	// Load the saved options from storage
	chrome.storage.sync.get(['options'], (result) => {
    // Set the saved options as the default values
    const options = result.options;
    if (options) {
		//document.getElementById('status').innerHTML = "LoadOptions";
		//document.getElementById('status').innerHTML = autosubmit+"LoadOptions:"+options.saveautosubmit;
		if(options.savedefaultAssistant)
			defaultAssistant = options.savedefaultAssistant;
		if(options.savecustom1)
			custom1Value = options.savecustom1;
		if(options.savecustom2)
			custom2Value = options.savecustom2;
		if(options.savecustom3)
			custom3Value = options.savecustom3;
		if(options.saveuser1)
			user1Value = options.saveuser1;
		if(options.saveuser2)
			user2Value = options.saveuser2;
		if(options.saveuser3)
			user3Value = options.saveuser3;
		if(options.saveapiKey)
			apiKey = options.saveapiKey;
		if(options.saveapiKey)
			temperature = options.savetemperature;
		if(options.saveapiKey)
			maxToken = options.savemaxToken;
		if(options.savetopP)
			topP = options.savetopP;
		if(options.savemodels)	
			models = options.savemodels;
		//document.getElementById('status').innerHTML = autosubmit+"before LoadOptions:"+options.saveautosubmit+(options.saveautosubmit!=autosubmit)+(options.saveautosubmit==autosubmit)+(options.saveautosubmit===autosubmit);
		if(options.saveautosubmit!=autosubmit)	
			autosubmit = options.saveautosubmit;
		//this is not a bug, take some time to allow the options save finished.
		//document.getElementById('response').innerHTML = autosubmit+"after LoadOptions:"+options.saveautosubmit+(options.saveautosubmit!=autosubmit)+(options.saveautosubmit==autosubmit)+(options.saveautosubmit===autosubmit);
				
    }
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
	

	var systemstring=document.getElementById('custom').value+document.getElementById('user').value;
	var userstring=document.getElementById('user').value+selectedText;
	
  document.getElementById('response').innerHTML = "<b>submit following text to api:</b>"+systemstring+selectedText;
  const data = {
      messages: [
	  //{"role": "system", "content": "You answer questions factually based on the context provided."},
	  //{"role": "system","name":"context","content": systemstring},
	  {"role": "user", "content":systemstring+selectedText}],
      temperature: temperature,
      max_tokens: maxToken,
      model: models,
	  top_p: topP
    };  
  xhr.send(JSON.stringify(data));
};
function CreateIcon(){
    var  icon = document.createElement("img");
    icon.id = "text-highlight-icon";
    icon.src = chrome.runtime.getURL("icon.png");
    icon.style.position = "absolute";
    document.body.appendChild(icon);
	icon.style.left ="0px";
	icon.style.top = "0px";
	icon.style.zIndex = "9999";
	
	icon.addEventListener("click", () => {
		icon.style.display = 'none';
		LoadOptions();
		// only reset the default profile when showing the popupwindow
		document.getElementById('defaultselect').value = defaultAssistant;
		SwitchProfile();
		
		document.getElementById("popupwindow").style.display='';
		document.getElementById('popupwindow').style.left = event.pageX + "px";
		document.getElementById('popupwindow').style.top = event.pageY + "px";
		var selection = window.getSelection().toString();
		document.getElementById("edit").value = selection; // set the value of the textarea to the selected text	
		//document.getElementById('status').innerHTML = autosubmit+"iconclick:"+(autosubmit=='checked')+(autosubmit==='checked');
		if(autosubmit=='checked')
			makeApiCall(selection); 

	});	  
	icon.style.display = 'none';
}
function CreatePopupWindow(){
    var popup = document.getElementById("popupwindow");
	if (!popup) {
			popup = document.createElement("div");
			popup.id = "popupwindow";
			popup.style.position = "absolute";
			popup.style.left = "0px";
			popup.style.top = "0px";
			popup.style.zIndex = "9999";
			popup.style.backgroundColor = "#ffffff"; // set background color to white
			popup.style.border = "1px solid #ccc"; // set border to 1px solid gray
			popup.style.width = "600px";
			popup.innerHTML = `
			  <head>
				<link rel="stylesheet" href="${chrome.runtime.getURL("options.css")}">
			  </head>		
			  <div class="GPTExtensionForm">
				<label class="GPTExtensionlabel" for="defaultselect">Chose your ChatGPT Profile:</label>
				<select id="defaultselect" name="defaultselect">
				  <option value="custom1user1">Profile1</option> 
				  <option value="custom2user2">Profile2</option> 
				  <option value="custom3user3">Profile3</option> 
				</select>
				<input id="custom" type="text">
				<input id="user" type="text">
				
			  <div class="GPTExtensiondiv" id="response">response area</div>
			  <div class="button-container">
			 <button class="GPTExtensionbutton"  id="copyButton">
				  Copy to clipboard
				  <img src="copytoclipboard.png" alt="Copy to Clipboard">
			 </button>
			 <button class="GPTExtensionbutton"  id="copyToEditButton">
				  Copy to Edit 
				  <img src="copytotextarea.png" alt="Copy to Edit">
			</button>
			</div>
			  <textarea class="GPTExtensiontextarea" id="edit" name="edit" rows="10"></textarea>
			  <div class="button-container">
				<button class="GPTExtensionbutton" id="submitButton">Submit</button><div id="status"></div>
				<button class="GPTExtensionbutton" id="optionsButton">Options</button>
			  </div>
		  </div>
			`;
			document.body.appendChild(popup);
			
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
			  var textarea = document.getElementById("edit");
			  textarea.value = document.getElementById('response').innerText;
			});
			document.getElementById('optionsButton').addEventListener('click', () => {
			   chrome.runtime.sendMessage({ action: 'openOptionsPage' });
			});

			document.getElementById('submitButton').addEventListener('click', () => {
			  makeApiCall(document.getElementById('edit').value);
			});
			LoadOptions();
			
		};	
	
	popup.style.display = 'none';	
}
