// Get the default select element
const defaultAssistant = document.getElementById('defaultselect');

// Get the input elements
const custom1Input = document.getElementById('custom1');
const user1Input = document.getElementById('user1');
const custom2Input = document.getElementById('custom2');
const user2Input = document.getElementById('user2');
const custom3Input = document.getElementById('custom3');
const user3Input = document.getElementById('user3');
const apiKeyInput = document.getElementById('apikey');
const temperatureInput = document.getElementById('temperature');
const maxTokenInput = document.getElementById('max_token');
const topPInput = document.getElementById('top_p');
const modelsInput = document.getElementById('models');

// Get the button elements
const saveButton = document.getElementById('save');
const restoreButton = document.getElementById('restore');


// Load the saved options from storage
chrome.storage.sync.get(['options'], (result) => {
    // Set the saved options as the default values
    const options = result.options;
    if (options) {
      defaultAssistant.value = options.savedefaultAssistant;
      custom1Input.value = options.savecustom1;
      user1Input.value = options.saveuser1;
      custom2Input.value = options.savecustom2;
      user2Input.value = options.saveuser2;
      custom3Input.value = options.savecustom3;
      user3Input.value = options.saveuser3;
      apiKeyInput.value = options.saveapiKey;
      temperatureInput.value = options.savetemperature;
      maxTokenInput.value = options.savemaxToken;
      topPInput.value = options.savetopP;
      modelsInput.value = options.savemodels;
    }
	else{
		restoreDefaults();
	}
		
	updateCustom1User1Option();	
	updateCustom2User2Option();
	updateCustom3User3Option();
	
  });

// Save the options to storage
function saveOptions() {
  var custom1value = document.getElementById('custom1').value;
  var user1 = document.getElementById('user1').value;
  var custom2value = document.getElementById('custom2').value;
  var user2 = document.getElementById('user2').value;
  var custom3value = document.getElementById('custom3').value;
  var user3 = document.getElementById('user3').value;
  var apiKey = document.getElementById('apikey').value;
  var temperature = parseFloat(document.getElementById('temperature').value);
  var maxToken = parseInt(document.getElementById('max_token').value);
  var topP = parseFloat(document.getElementById('top_p').value);
  var models = document.getElementById('models').value;
  var defaultAssistant = document.getElementById('defaultselect').value;

  // validate temperature input
  if (temperature < 0 || temperature > 1 || isNaN(temperature)) {
    alert('Temperature must be a number between 0 and 1.');
    return;
  }

  // validate maxToken input
  if (maxToken < 1 || maxToken > 2048 || isNaN(maxToken)) {
    alert('Max Tokens must be a number between 1 and 2048.');
    return;
  }

  // validate topP input
  if (topP < 0 || topP > 1 || isNaN(topP)) {
    alert('Top P must be a number between 0 and 1.');
    return;
  }
	const defaultOptions = {
	savecustom1:custom1value,
    saveuser1: user1,
	savecustom2:custom2value,
    saveuser2: user2,
	savecustom3:custom3value,
    saveuser3: user3,
    saveapiKey: apiKey,
    savetemperature: temperature,
    savemaxToken: maxToken,
    savetopP: topP,
    savemodels: models,
    savedefaultAssistant: defaultAssistant
  };
	
  chrome.storage.sync.set({ options: defaultOptions }, function() {
    // Notify the user that the options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restore the default options
function restoreDefaults() {
  const defaultOptions = {
	savecustom1: 'Act as a tranlator.',
	saveuser1: 'Rewrite the text in authentic English:',
	savecustom2: 'Act as a proofreader.',
    saveuser2: '  Proofread the following content:',
	savecustom3: 'Act as a summerizer.',	  
    saveuser3: 'summerize following content in less than 100 words:',
    saveapiKey: 'YOUR_API_KEY',
    savetemperature: '0.5',
    savemaxToken: '512',
    savetopP: '1',
    savemodels: 'gpt-3.5-turbo-0301',
    savedefaultAssistant: 'custom1user1'
  };
  chrome.storage.sync.set({ options: defaultOptions }, () => {
    // Reload the page to show the default options
    location.reload();
  });
}

// Attach click event listeners to the buttons
saveButton.addEventListener('click', saveOptions);
restoreButton.addEventListener('click', restoreDefaults);


// Get references to the input fields and the option elements
const custom1User1Option = document.querySelector('#defaultselect option[value="custom1user1"]');
const custom2User2Option = document.querySelector('#defaultselect option[value="custom2user2"]');
const custom3User3Option = document.querySelector('#defaultselect option[value="custom3user3"]');

// Add event listeners to the input fields to update the option elements
custom1Input.addEventListener('input', updateCustom1User1Option);
user1Input.addEventListener('input', updateCustom1User1Option);

custom2Input.addEventListener('input', updateCustom2User2Option);
user2Input.addEventListener('input', updateCustom2User2Option);

custom3Input.addEventListener('input', updateCustom3User3Option);
user3Input.addEventListener('input', updateCustom3User3Option);

// Define the functions that update the option elements
function updateCustom1User1Option() {
  const custom1Value = custom1Input.value;
  const user1Value = user1Input.value;
  custom1User1Option.textContent = `${custom1Value} / ${user1Value}`;
}

function updateCustom2User2Option() {
  const custom2Value = custom2Input.value;
  const user2Value = user2Input.value;
  custom2User2Option.textContent = `${custom2Value} / ${user2Value}`;
}

function updateCustom3User3Option() {
  const custom3Value = custom3Input.value;
  const user3Value = user3Input.value;
  custom3User3Option.textContent = `${custom3Value} / ${user3Value}`;
}
