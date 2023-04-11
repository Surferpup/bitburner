/** @param {NS} ns **/
export async function main(ns) {
	// Open the log window for this script:
	ns.tail();

	// Create a var to store the input in
	let my_value = null;

	// use our modified version of the prompt method, passing it a callback.
	let yes_no = await inputPrompt(ns, "Test Message", (value) => {
		my_value = value;
	});

	ns.print(`Current value: ${my_value}, ${yes_no}`);
}

// event lister which prevents the game's terminal from stealing the keyboard input on each keypress.
const antiKeyJacker = (event) => {
	event.stopPropagation();
}

async function inputPrompt(ns, message, callback) {
	let the_document = eval('document');
	// Prevent the terminal from stealing input focus:
	the_document.addEventListener('keydown', antiKeyJacker, true);

	// Open the prompt, but don't await it. 
	let prompt_promise = ns.prompt(message);

	// Get the HTML element corresponding to the prompt body.
	let prompt_elem = the_document.body.lastChild.children[2].children[0];

	// Create an <input type="text" /> and apply style
	let input = the_document.createElement('input');
	input.type = 'text';
	input.style.backgroundColor = '#1d1d1d';
	input.style.color = 'white';
	input.style.border = '1px solid black';

	// When text is written, run the callback with the current value of the input box:
	input.oninput = (e) => {
		let value = e.target.value;
		callback(value);
	}

	// Add the created <input> to the prompt body
	prompt_elem.appendChild(input);

	/*
	//-----------
	var newList = the_document.createElement("ul");
	var stringArray = ["Home", "About", "Our Services", "Contact Us"];
	var newUL = prompt_elem.appendChild(newList);
	newUL.type = 'text';
	newUL.style.backgroundColor = '#1d1d1d';
	newUL.style.color = 'white';
	newUL.style.border = '1px solid black';

	for (var i = 0; i < stringArray.length; i++) {
		// Create a text node
		var newTextNode = the_document.createTextNode(stringArray[i]);

		// Create a list element
		var newListItem = the_document.createElement("option");
		newListItem.value = i+1
		newListItem.label = stringArray[i]

		// Append text node and list item
		newListItem.appendChild(newTextNode);
		newUL.appendChild(newListItem);
	}
	//------------
	*/

	// Get the result of ns.prompt() from before
	//let result = await prompt_promise;
	await prompt_promise;
	// Remove the anti-keyjacker
	the_document.removeEventListener('keydown', antiKeyJacker, true);

	// May as well return whether Yes or No was clicked, too. 
	return prompt_promise;
}