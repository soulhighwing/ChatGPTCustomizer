chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    function: function() {
      var selectedText = window.getSelection().toString();
      console.log(selectedText);
      chrome.runtime.sendMessage({textselected: selectedText});
    }
  });
});
	
  var custom1Value = "Act as a tranlator.";
  var user1Value = 'Rewrite the text in authentic English:';
  var custom2Value = "Act as a proofreader.";
  var user2Value = 'Proofread the following content:';
  var custom3Value = "Act as a summerizer.";
  var user3Value = 'summerize following content in less than 100 words:';
  var apiKey = 'YOUR_API_KEY';
  var temperature = 0.5;
  var maxToken = 512;
  var topP = 1;
  var models = 'gpt-3.5-turbo-0301';
  var defaultAssistant = 'custom1user1';	
	
	// Load the saved options from storage
	chrome.storage.sync.get(['options'], (result) => {
    // Set the saved options as the default values
    const options = result.options;
	document.getElementById('response').innerHTML = options;
    if (options) {
		document.getElementById('response').innerHTML = options.savetranslator;
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
    }
	// Get references to the input fields and the option elements
	document.querySelector('#defaultselect option[value="custom1user1"]').textContent = `${custom1Value} / ${user1Value}`;
	document.querySelector('#defaultselect option[value="custom2user2"]').textContent = `${custom2Value} / ${user2Value}`;
	document.querySelector('#defaultselect option[value="custom3user3"]').textContent = `${custom3Value} / ${user3Value}`;;
	document.getElementById('defaultselect').value = defaultAssistant;
	
  });



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
		document.getElementById('response').innerHTML = "Request fail, Please check the options. Maker sure you have input the correct openAI api key and correct model.";	
		}
  };
	

	var systemstring="";
	var userstring=selectedText;
	defaultAssistant=document.getElementById('defaultselect').value;
	switch (defaultAssistant) {
		case 'custom1user1':
			systemstring+= custom1Value+user1Value;
		  userstring = user1Value+selectedText;
		  break;
		case 'custom2user2':
			systemstring+= custom2Value+user2Value;
		  userstring = user2Value+selectedText;
		  break;
		case 'custom3user3':
			systemstring+= custom3Value+user3Value;
		  userstring = user3Value+selectedText;
		  break;
	}
	
	document.getElementById('response').innerHTML = "loading...";
  const data = {
      messages: [
	  {"role": "system", "content": "You answer questions factually based on the context provided."},
	  {"role": "system","name":"context","content": systemstring},
	  {"role": "user", "content": selectedText}],
      temperature: temperature,
      max_tokens: maxToken,
      model: models,
	  top_p: topP
    };  
  xhr.send(JSON.stringify(data));
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  document.getElementById('edit').value=request.textselected;
  makeApiCall(request.textselected);
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

document.getElementById('optionsButton').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('submitButton').addEventListener('click', () => {
  makeApiCall(document.getElementById('edit').value);
});

