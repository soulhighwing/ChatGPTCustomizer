// Define a variable to store the profiles
let profiles = [];

const apiKeyInput = document.getElementById('apikey');
const temperatureInput = document.getElementById('temperature');
const maxTokenInput = document.getElementById('max_token');
const topPInput = document.getElementById('top_p');
const modelsInput = document.getElementById('models');
const autosubmitBox = document.getElementById('autosubmit');
// Get the button elements
const saveButton = document.getElementById('save');
const restoreButton = document.getElementById('restore');
const neprofileButton = document.getElementById('newprofile');
loadsaveProfiles();
loadsaveOptions();


// Attach click event listeners to the buttons
saveButton.addEventListener('click', saveOptions);
restoreButton.addEventListener('click', restoreDefaults);
neprofileButton.addEventListener('click', addNewProfile);

function addNewProfile() {
	 const profileList = document.getElementById('GPTExtensionprofiles-list');
	 const listItem = document.createElement('li');
	 const index=profileList.childElementCount;
	 const newindex=index+1;
		listItem.id = `profile-${index}`;
		listItem.className='GPTExtensionli';
		listItem.draggable = true;
		listItem.innerHTML = `
			<div class="GPTExtensionbutton-container">	
			<input class="GPTExtensionnameinput" type="text" id="custom${index}" name="custom${index}" value="Profile ${newindex}">
			<input class="GPTExtensioninput" type="text" id="user${index}" name="user${index}" value="Acting as an Assistant">
			<button class="GPTExtensionbutton"  type="button" id="removeProfile${index}"><b>-</b></button>
			</div>
		`;
		// Add the list item to the profile list
		profileList.insertBefore(listItem,profileList.firstChild);
		listItem.addEventListener('dragstart', handleDragStart);
		listItem.addEventListener('dragenter', handleDragEnter);
		listItem.addEventListener('dragover', handleDragOver);
		listItem.addEventListener('drop', handleDrop);
		document.getElementById(`removeProfile${index}`).addEventListener('click', handleDeleteProfile);	
		
}
function handleDeleteProfile(event) {
  const listItem = event.target.closest('.GPTExtensionli');
  if (listItem) {
    listItem.remove();
  }
}

// Loads the profiles from the Chrome storage
function loadsaveProfiles() {
	 const profileList = document.getElementById('GPTExtensionprofiles-list');
  chrome.storage.sync.get(['saveprofiles'], function(result) {
	//  console.log(result);	
	  if(result.length==0)
		createDefaultProfiles();
	  else
		profiles=result.saveprofiles;
	 reloadProfileUI();
  });
};


function createDefaultProfiles(){
    profiles = [];
	//console.log("create default profiles");
	// Define a new profile object
	const newProfile1 = {
	  savecustom: 'translator',
	  saveuser: 'Rewrite the text in authentic English:'
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

function reloadProfileUI(){
	  // Get the profile list element
	  const profileList = document.getElementById('GPTExtensionprofiles-list');
	  profileList.innerHTML='';
	  // Loop through each profile and create a list item element for it
	  profiles.forEach(function(profile, index) {
		// Create a new list item element
		const listItem = document.createElement('li');

		// Set the ID of the list item to the index of the profile
		listItem.id = 'profile-' + index;
		listItem.className='GPTExtensionli';
		listItem.draggable = true;
		listItem.innerHTML = `
			<div class="GPTExtensionbutton-container">	
			<input class="GPTExtensionnameinput" type="text" id="custom${index}" name="custom${index}" value="${profile.savecustom}">
			<input class="GPTExtensioninput" type="text" id="user${index}" name="user${index}" value="${profile.saveuser}">
			<button class="GPTExtensionbutton"  type="button" id="removeProfile${index}"><b>-</b></button>
			</div>
		`;
		// Add the list item to the profile list
		profileList.appendChild(listItem);
		listItem.addEventListener('dragstart', handleDragStart);
		listItem.addEventListener('dragenter', handleDragEnter);
		listItem.addEventListener('dragover', handleDragOver);
		listItem.addEventListener('drop', handleDrop);
		document.getElementById(`removeProfile${index}`).addEventListener('click', handleDeleteProfile);	
		});	
};




function loadsaveOptions(){
	// Load the saved options from storage
	chrome.storage.sync.get(['options'], (result) => {
		// Set the saved options as the default values
		const options = result.options;
		if (options) {
			reloadOptionUI(options);
		}
		else{
			reloadOptionUI(createDefaultOptions());
		}
	
	});
};

function createDefaultOptions(){
  const options = {
    saveapiKey: 'PUT_YOUR_API_KEY',
    savetemperature: '1',
    savemaxToken: '512',
    savetopP: '1',
    savemodels: 'gpt-3.5-turbo-0301',
	saveautosubmit: 'checked'
  };
  return options;
 };

function reloadOptionUI(options){
   apiKeyInput.value = options.saveapiKey;
   temperatureInput.value = options.savetemperature;
   maxTokenInput.value = options.savemaxToken;
   topPInput.value = options.savetopP;
   modelsInput.value = options.savemodels;
   autosubmitBox.checked = options.saveautosubmit=="checked"?"checked":"";	
};


// Restore the default options
function restoreDefaults() {
    createDefaultProfiles();	
	reloadProfileUI();
	reloadOptionUI(createDefaultOptions());
};


// Saves the profiles to the Chrome storage
function saveProfiles() {
	const profilesList = document.getElementById('GPTExtensionprofiles-list');
	profiles = [];

	for (let i = 0; i < profilesList.children.length; i++) {
		const customInput = profilesList.children[i].querySelector('.GPTExtensionnameinput');
		const userInput = profilesList.children[i].querySelector('.GPTExtensioninput');
		const newprofile = {
		savecustom: customInput.value,
		saveuser: userInput.value
		};
  
		profiles.push(newprofile);
	}
  chrome.storage.sync.set({ saveprofiles: profiles }, function() {
    // Notify the user that the profiles were saved.
    var status = document.getElementById('status');
    status.textContent = 'Profiles saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });  
};


// Save the options to storage
function saveOptions() {
  var apiKey = apiKeyInput.value;
  var temperature = parseFloat(temperatureInput.value);
  var maxToken = parseInt(maxTokenInput.value);
  var topP = parseFloat(topPInput.value);
  var models = modelsInput.value;
  var autosubmit = document.getElementById('autosubmit').checked?'checked':'';
  
  // validate temperature input
  if (temperature < 0 || temperature > 1 || isNaN(temperature)) {
    alert('Temperature must be a number between 0 and 1.');
    return;
  };

  // validate maxToken input
  if (maxToken < 1 || maxToken > 2048 || isNaN(maxToken)) {
    alert('Max Tokens must be a number between 1 and 2048.');
    return;
  };

  // validate topP input
  if (topP < 0 || topP > 1 || isNaN(topP)) {
    alert('Top P must be a number between 0 and 1.');
    return;
  };
  
  saveProfiles();
  const optionstobesave = {
	saveapiKey: apiKey,
    savetemperature: temperature,
    savemaxToken: maxToken,
    savetopP: topP,
    savemodels: models,
	saveautosubmit: autosubmit
  };
  chrome.storage.sync.set({ options: optionstobesave }, function() {
    // Notify the user that the options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
};


function handleDragStart(event) {
  // Store the item's id in the dataTransfer object
  event.dataTransfer.setData('text/plain', event.target.id);
};

function handleDragEnter(event) {
  // Prevent default to allow drop
  event.preventDefault();
};

function handleDragOver(event) {
  // Prevent default to allow drop
  event.preventDefault();
};

function handleDrop(event) {
  // Get the id of the dragged item
  const id = event.dataTransfer.getData('text/plain');
  console.log(id);

  // Get the elements for the dragged and dropped items
  const draggedItem = document.getElementById(id);
  const droppedItem = event.target.closest('.GPTExtensionli');
  const dropzone = event.target.closest('#GPTExtensionprofiles-list');
  const droppedIndex = Array.from(dropzone.children).indexOf(droppedItem);
  console.log(droppedItem);
	console.log(dropzone);
  // Move the dragged item to the dropzone
//  dropzone.appendChild(draggedItem);

  // Get the index of the dragged item
  const draggedIndex = Array.from(dropzone.children).indexOf(draggedItem);

  // Move the dragged item to the dropzone
  if (draggedIndex < droppedIndex) {
    // Insert the dragged item after the dropped item
    dropzone.insertBefore(draggedItem, droppedItem.nextSibling);
  } else {
    // Insert the dragged item before the dropped item
    dropzone.insertBefore(draggedItem, droppedItem);
  }  
};



