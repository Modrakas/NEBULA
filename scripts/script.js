const messageBody = document.querySelector('.message-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector('#send-message');
const fileUpload = document.querySelector('#file-upload');
const fileUploadContainer = document.querySelector('.file-upload-container');
const fileCancelButton = document.querySelector('#file-cancel-btn');
const chatbotToggler = document.querySelector('#chatbot-toggler');
const closeChatbot = document.querySelector('.close-chatbot');

//API setup
const API_KEY = 'AIzaSyAkD3-q8Jwc9D3KiblnRaT8OAgMXFUCuAI';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const userData = {
	message: null,
	file: {
		data: null,
		mime_type: null
	}
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

//create div and class
const createMessageElement = (content, ...classes) => {
	const div = document.createElement('div');
	div.classList.add('message', ...classes);
	div.innerHTML = content;
	return div;
}

//Generate chatbot response using API
const generateChatbotResponse = async (incomingMessageDiv) => {
	const messageElement = incomingMessageDiv.querySelector('.message-text');
	const chatbotName = 'Diya';
	
	//Adds usermessage to chat history
	chatHistory.push({
		role: 'user',
		parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
	});

		// Check if the user asks for the chatbot's name
		if (userData.message.toLowerCase().includes('your name')) {
			messageElement.innerText = `I'm a helpful assistant named '${chatbotName}'.`;
			incomingMessageDiv.classList.remove('thinking');
			messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' });
			return;
		}

	//API request
	const requestOptions = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			contents: chatHistory
		})
	}
	try {
		//Fetch response frpm API
		const response = await fetch(API_URL, requestOptions);
		const data = await response.json();
		if(!response.ok) throw new Error(data.error.message);

		//retrieve and display chatbot response text
	const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
		messageElement.innerText = apiResponseText;

		//Adds chatbot response to chat history
		chatHistory.push({
			role: 'model',
			parts: [{ text: apiResponseText }]
		});
	} catch (error){
		//Generate API error response
		console.log(error);
		messageElement.innerText = 'Sorry, something went wrong. Please try again.'
	} finally {
		//Reset user data, remove thinking indicator, and auto scroll to bottom
		userData.file = {};
		incomingMessageDiv.classList.remove('thinking');
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
	}
};

//outgoing user message function
const outgoingMessage = (event) => {
	event.preventDefault();
	userData.message = messageInput.value.trim();
	messageInput.value = '';
	fileUploadContainer.classList.remove('file-uploaded');
	messageInput.dispatchEvent(new Event('input'));

	// create and display user message
	const messageContent = `<div class="message-text"></div> ${userData.file.data ? `<img src='data:${userData.file.mime_type};base64,${userData.file.data}' class='attachment'/>` : ''}`;

	const outgoingMessageDiv = createMessageElement(messageContent, 'user-message');
	outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
	messageBody.appendChild(outgoingMessageDiv);
	messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
	
	//Simulate chatbot response with thinking indicator after a delay
	setTimeout(() => {
		const messageContent = `
      <div class="message-text">
        <div class="thinking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        
      </div>
    `;
	
		const incomingMessageDiv = createMessageElement(messageContent, 'chatbot-message', 'thinking');
		messageBody.appendChild(incomingMessageDiv);
		messageBody.scrollTo({ top: messageBody.scrollHeight, behavior: 'smooth' }); 
		generateChatbotResponse(incomingMessageDiv);
	}, 600);
}

//send message when 'enter' key is used
messageInput.addEventListener('keydown', (event) => {
	const userMessage = event.target.value.trim();
	if(event.key === 'Enter' && userMessage && !event.shiftKey) {
		outgoingMessage(event);
	}
});

//Adjust input feild height
messageInput.addEventListener('input', () => {
	messageInput.style.height = `${initialInputHeight}px`;
	messageInput.style.height = `${messageInput.scrollHeight}px`;
	document.querySelector('.input-form').style.borderRadius = messageInput.scrollHeight > initialInputHeight ? '15px' : '32px';
	});

//Recieve file input
fileUpload.addEventListener('change', () => {
	const file = fileUpload.files[0];
	if(!file) return;

	//Convert file to base64 format so HTTP requests can read the plain text of file
	const reader = new FileReader();
	reader.onload = (event) => {
		//preview selected img file
		fileUploadContainer.querySelector('img').src = event.target.result;
		fileUploadContainer.classList.add('file-uploaded');
		const base64String = event.target.result.split(',')[1];

		//Stores file data in userData
		userData.file = {
			data: base64String,
			mime_type: file.type
		}
		
		//Clear file upload value so same file can be uploaded again
		fileUpload.value = '';
	}
	reader.readAsDataURL(file);
});

//Cancel image file upload
fileCancelButton.addEventListener('click', () => {
	userData.file = {};
	fileUploadContainer.classList.remove('file-uploaded');
})

//Emoji picker
const picker = new EmojiMart.Picker({ 
	theme: 'light',
	skinTonePosition: 'none',
	previewPosition: 'none',
	onEmojiSelect: (emoji) => {
		const { selectionStart: start, selectionEnd: end } = messageInput;
		messageInput.setRangeText(emoji.native, start, end, 'end');
		messageInput.focus(); 
	},
	onClickOutside: (event) => {
		if(event.target.id === 'emoji-picker') {
			document.body.classList.toggle('show-emoji-picker');
		} else {
			document.body.classList.remove('show-emoji-picker');
		}
	}
});

document.querySelector('.input-form').appendChild(picker); 

//BUTTONS SENDING DATA TO CHATBOT
sendMessageButton.addEventListener('click', (event) => outgoingMessage(event));
//Trigger file upload when the upload button is clicked
document.querySelector('#file-upload-btn').addEventListener('click', () => fileUpload.click());

//Toggle chat
chatbotToggler.addEventListener('click', () => document.body.classList.toggle('show-chatbot'));

//close chat
closeChatbot.addEventListener('click', () => document.body.classList.remove('show-chatbot'));