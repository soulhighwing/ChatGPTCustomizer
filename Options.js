// Define a variable to store the profiles
let profiles = [];

const apiKeyInput = document.getElementById('apikey');
const temperatureInput = document.getElementById('temperature');
const maxTokenInput = document.getElementById('max_token');
const topPInput = document.getElementById('top_p');
const modelsInput = document.getElementById('models');
const autosubmitBox = document.getElementById('autosubmit');
const autocontextBox = document.getElementById('autocontext');
const contextmenuonlyBox = document.getElementById('contextmenuonly');
// Get the button elements
const saveButton = document.getElementById('save');
const restoreButton = document.getElementById('restore');
const newprofileButton = document.getElementById('newprofile');
const exportprofileButton = document.getElementById('exportprofile');
const importprofileButton = document.getElementById('importprofile');
loadsaveProfiles();
loadsaveOptions();


// Attach click event listeners to the buttons
saveButton.addEventListener('click', saveProfilesAndOptions);
restoreButton.addEventListener('click', restoreDefaults);
newprofileButton.addEventListener('click', addNewProfile);
exportprofileButton.addEventListener('click', exportProfiles);
importprofileButton.addEventListener('click', importProfiles);

function addNewProfile() {
  const profileList = document.getElementById('GPTExtensionprofiles-list');
  const listItem = document.createElement('li');
  const index = profileList.childElementCount;
  const newindex = index + 1;
  listItem.id = `profile-${index}`;
  listItem.className = 'GPTExtensionli';
  listItem.draggable = true;

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'GPTExtensionbutton-container';

  const nameInput = document.createElement('input');
  nameInput.className = 'GPTExtensionnameinput';
  nameInput.type = 'text';
  nameInput.id = `custom${index}`;
  nameInput.name = `custom${index}`;
  nameInput.value = `Profile ${newindex}`;
  nameInput.addEventListener("blur", function () {
    this.style.width = "30%";
  });
  nameInput.addEventListener("focus", function () {
    this.style.width = "100%";
  });

  buttonContainer.appendChild(nameInput);

  const userInput = document.createElement('textarea');
  userInput.className = 'GPTExtensiontextareablur';
  userInput.id = `user${index}`;
  userInput.name = `user${index}`;
  userInput.value = 'Acting as an Assistant';
  userInput.style.height = "auto"; // set the initial height to auto
  userInput.style.height = "30px";
  userInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  });
  userInput.addEventListener("blur", function () {
    this.style.removeProperty('height'); // remove the height property when the element loses focus
  });
  userInput.addEventListener("focus", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
  });



  buttonContainer.appendChild(userInput);

  const removeButton = document.createElement('button');
  removeButton.className = 'GPTExtensionbutton';
  removeButton.type = 'button';
  removeButton.id = `removeProfile${index}`;

  const removeButtonText = document.createElement('b');
  removeButtonText.textContent = '-';
  removeButton.appendChild(removeButtonText);
  buttonContainer.appendChild(removeButton);

  listItem.appendChild(buttonContainer);



  // Add the list item to the profile list
  profileList.insertBefore(listItem, profileList.firstChild);


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
  chrome.storage.local.get(['saveprofiles'], function (result) {
    console.log(result);	
    if (!result.saveprofiles||result.saveprofiles.length==0) {
      createDefaultProfiles();
      // save the new created profile
      chrome.storage.local.set({ saveprofiles: profiles }, function () {
        // Notify the user that the profiles were saved.
        showStatus('Default profiles created.');
        reloadProfileUI(profiles);
      });
    }
    else {
      profiles = result.saveprofiles;
      reloadProfileUI(profiles);
    }
  });
};


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
  return profiles;
};

function reloadProfileUI(newprofiles) {
  // Get the profile list element
  const profileList = document.getElementById('GPTExtensionprofiles-list');
  profileList.innerHTML = '';
  // Loop through each profile and create a list item element for it
  newprofiles.forEach(function (profile, index) {
    // Create a new list item element
    const listItem = document.createElement('li');

    // Set the ID of the list item to the index of the profile
    listItem.id = 'profile-' + index;
    listItem.className = 'GPTExtensionli';
    listItem.draggable = true;



    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'GPTExtensionbutton-container';

    const nameInput = document.createElement('input');
    nameInput.className = 'GPTExtensionnameinput';
    nameInput.type = 'text';
    nameInput.id = `custom${index}`;
    nameInput.name = `custom${index}`;
    nameInput.value = `${profile.savecustom}`;
    nameInput.addEventListener("blur", function () {
      this.style.width = "30%";
    });
    nameInput.addEventListener("focus", function () {
      this.style.width = "100%";
    });

    buttonContainer.appendChild(nameInput);

    const userInput = document.createElement('textarea');
    userInput.className = 'GPTExtensiontextareablur';
    userInput.id = `user${index}`;
    userInput.name = `user${index}`;
    userInput.value = `${profile.saveuser}`;
    userInput.style.height = "auto"; // set the initial height to auto
    userInput.style.height = "30px";
    userInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    });
    userInput.addEventListener("blur", function () {
      this.style.removeProperty('height'); // remove the height property when the element loses focus
      this.style.height = "30px";
    });
    userInput.addEventListener("focus", function () {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    });
    buttonContainer.appendChild(userInput);

    const removeButton = document.createElement('button');
    removeButton.className = 'GPTExtensionbutton';
    removeButton.type = 'button';
    removeButton.id = `removeProfile${index}`;

    const removeButtonText = document.createElement('b');
    removeButtonText.textContent = '-';
    removeButton.appendChild(removeButtonText);
    buttonContainer.appendChild(removeButton);

    listItem.appendChild(buttonContainer);

    // Add the list item to the profile list
    profileList.appendChild(listItem);
    listItem.addEventListener('dragstart', handleDragStart);
    listItem.addEventListener('dragenter', handleDragEnter);
    listItem.addEventListener('dragover', handleDragOver);
    listItem.addEventListener('drop', handleDrop);
    document.getElementById(`removeProfile${index}`).addEventListener('click', handleDeleteProfile);
  });
};




function loadsaveOptions() {
  // Load the saved options from storage
  chrome.storage.local.get(['options'], (result) => {
    // Set the saved options as the default values
    const options = result.options;
    if (options) {
      reloadOptionUI(options);
    }
    else {
      const defaultoptions = createDefaultOptions();
      reloadOptionUI(defaultoptions);
      saveOptions();
    }

  });
};

function createDefaultOptions() {
  const options = {
    saveapiKey: '',
    savetemperature: '1',
    savemaxToken: '512',
    savetopP: '1',
    savemodels: 'gpt-3.5-turbo-0301',
    saveautosubmit: '',
    saveautocontext: '',
    savecontextmenuonly: ''
  };
  return options;
};

function reloadOptionUI(options) {
  apiKeyInput.value = options.saveapiKey;
  temperatureInput.value = options.savetemperature;
  maxTokenInput.value = options.savemaxToken;
  topPInput.value = options.savetopP;
  modelsInput.value = options.savemodels;
  autosubmitBox.checked = options.saveautosubmit == "checked" ? "checked" : "";
  autocontextBox.checked = options.saveautocontext == "checked" ? "checked" : "";
  contextmenuonlyBox.checked = options.savecontextmenuonly == "checked" ? "checked" : "";
};


// Restore the default options
function restoreDefaults() {
  reloadProfileUI(createDefaultProfiles());
  reloadOptionUI(createDefaultOptions());
};


// Saves the profiles to the Chrome storage
function saveProfiles() {
  const profilesList = document.getElementById('GPTExtensionprofiles-list');
  profiles = [];

  for (let i = 0; i < profilesList.children.length; i++) {
    const customInput = profilesList.children[i].querySelector('.GPTExtensionnameinput');
    const userInput = profilesList.children[i].querySelector('.GPTExtensiontextareablur');
    const newprofile = {
      savecustom: customInput.value,
      saveuser: userInput.value
    };

    profiles.push(newprofile);
  }
  chrome.storage.local.set({ saveprofiles: profiles }, function () {
    // Notify the user that the profiles were saved.
    showStatus('Profiles saved.');
   });
};


// Save the options to storage
function saveOptions() {
  var apiKey = apiKeyInput.value;
  var temperature = parseFloat(temperatureInput.value);
  var maxToken = parseInt(maxTokenInput.value);
  var topP = parseFloat(topPInput.value);
  var models = modelsInput.value;
  var autosubmit = document.getElementById('autosubmit').checked ? 'checked' : '';
  var autocontext = document.getElementById('autocontext').checked ? 'checked' : '';
  var contextmenuonly = document.getElementById('contextmenuonly').checked ? 'checked' : '';

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

  const optionstobesave = {
    saveapiKey: apiKey,
    savetemperature: temperature,
    savemaxToken: maxToken,
    savetopP: topP,
    savemodels: models,
    saveautosubmit: autosubmit,
    saveautocontext: autocontext,
    savecontextmenuonly: contextmenuonly
  };
  chrome.storage.local.set({ options: optionstobesave }, function () {
    // Notify the user that the options were saved.
    showStatus('Options saved.');
  });
};
function saveProfilesAndOptions() {
  saveProfiles();
  saveOptions();
}

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
  //console.log(id);

  // Get the elements for the dragged and dropped items
  const draggedItem = document.getElementById(id);
  const droppedItem = event.target.closest('.GPTExtensionli');
  const dropzone = event.target.closest('#GPTExtensionprofiles-list');
  const droppedIndex = Array.from(dropzone.children).indexOf(droppedItem);
  //console.log(droppedItem);
  //console.log(dropzone);
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


function exportProfiles() {
  // Convert the profiles array to a JSON string
  const profilesJSON = JSON.stringify({ profiles });

  // Create a Blob object with the JSON data
  const blob = new Blob([profilesJSON], { type: "application/json" });

  // Create a download link for the user
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "profiles.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function importProfiles() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,.csv";

  // Listen for the change event on the input element
  input.addEventListener("change", (event) => {
    const file = event.target.files[0];

    // Create a new FileReader object
    const reader = new FileReader();

    // Listen for the load event on the FileReader object
    reader.addEventListener("load", () => {
      // Parse the data based on the file type
      let importedProfiles;
      if (file.name.endsWith(".json")) {
        importedProfiles = JSON.parse(reader.result).profiles;
      } else if (file.name.endsWith(".csv")) {
        importedProfiles = [];
        const lines = reader.result.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          const regex = /"([^"]*)","([^"]*)"/;
          const matches = line.match(regex);
          if (matches) {
            const savecustom = matches[1].trim();
            const saveuser = matches[2].trim();
            importedProfiles.push({ savecustom, saveuser });
          };
        }
      };

      // Merge the imported data into the profiles array
      profiles = [...importedProfiles, ...profiles];

      // Do something with the merged profiles data
      reloadProfileUI(profiles);
    });

    // Read the contents of the selected file as a text string
    reader.readAsText(file);
  });

  // Click the input element to trigger the file selection dialog
  input.click();
}

// In your options.js file
document.getElementById('openTab').addEventListener('click', function () {
  chrome.tabs.create({ url: chrome.runtime.getURL('playground.html') });
});


function showStatus(infostring) {
  document.getElementById('status').textContent = infostring;
  setTimeout(function () {
    document.getElementById('status').textContent = '';
  }, 3000);
}