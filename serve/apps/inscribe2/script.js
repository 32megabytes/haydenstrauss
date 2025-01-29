// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Set main background color from meta tag
  const mainBgColor = document.querySelector('meta[name="main-bg-color"]').content;
  document.documentElement.style.setProperty('--main-bg-color', mainBgColor);

  // Get autosave interval from meta tag
  const autosaveInterval = parseInt(document.querySelector('meta[name="autosave-interval"]').content);
  
  // Initialize UI scale
  const defaultScale = parseInt(document.querySelector('meta[name="default-scale"]').content);

  
  // DOM Elements
  const textBox = document.getElementById('text-box');
  const booksList = document.getElementById('books-list');
  const settingsModal = document.getElementById('settings-modal');
  const autosaveToggle = document.getElementById('autosave-toggle');
  const uiScaleSelect = document.getElementById('ui-scale');
  const deleteBookButton = document.getElementById('delete-book');
const deleteVaultItemButton = document.getElementById('delete-vault-item');
const minimizeVaultButton = document.getElementById('minimize-vault');
const openVaultButton = document.getElementById('open-vault');
const vaultSidebar = document.querySelector('.vault-sidebar');
const sterilizeButton = document.getElementById('sterilize-button');
const readSelectionButton = document.getElementById('read-selection');
  
  // Formatting buttons
  const boldButton = document.getElementById('bold-button');
  const italicButton = document.getElementById('italic-button');
  const underlineButton = document.getElementById('underline-button');
  const highlightButton = document.getElementById('highlight-button');
  const bulletList = document.getElementById('bullet-list');
  const attachFileButton = document.getElementById('attach-file');
  
  // State management
  let books = [];
  let currentBookIndex = -1;
  let settings = {
    autosave: true,
    uiScale: defaultScale,
    fullscreen: true
  };
  let lastSavedContent = '';
  let autosaveTimer = null;
  let vaultItems = [];
  let selectedVaultItemId = null;
  

  // Initialize UI Scale
  function applyUIScale(scale) {
    const baseSize = 16; // Default browser font size
    document.documentElement.style.fontSize = `${baseSize * (scale / 100)}px`;
  }
  
  // Initialize settings
  function initializeSettings() {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    autosaveToggle.checked = settings.autosave;
    fullscreenToggle.checked = settings.fullscreen;
    uiScaleSelect.value = settings.uiScale;
    applyUIScale(settings.uiScale);
    applyFullscreenMode(settings.fullscreen);
  }
  
  function applyFullscreenMode(enabled) {
    const container = document.querySelector('.container');
    if (enabled) {
      container.classList.add('fullscreen');
    } else {
      container.classList.remove('fullscreen');
    }
  }
  
  // Add minimize/maximize functionality
minimizeVaultButton.addEventListener('click', () => {
  vaultSidebar.style.display = 'none';
  openVaultButton.classList.remove('hidden');
  textBox.style.width = '100%';
});

openVaultButton.addEventListener('click', () => {
  vaultSidebar.style.display = 'flex';
  openVaultButton.classList.add('hidden');
  textBox.style.width = '';  // Reset to default
});
  
  // Autosave functionality
  function startAutosave() {
    if (autosaveTimer) clearInterval(autosaveTimer);
    if (settings.autosave) {
      autosaveTimer = setInterval(() => {
        if (textBox.innerHTML !== '') {
          if (currentBookIndex === -1) {
            // Create a new book if there isn't one
            const date = new Date().toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit',
              year: 'numeric'
            });
            books.push({ name: `Journal ${date}`, content: '', vaultItems: [] });
            currentBookIndex = books.length - 1;
          }
          saveCurrentBook();
        }
      }, autosaveInterval);
    }
  }
  
  function saveCurrentBook() {
    if (currentBookIndex !== -1) {
      if (!books[currentBookIndex].name) {
        const date = new Date().toLocaleDateString('en-US', { 
          month: '2-digit', 
          day: '2-digit',
          year: 'numeric'
        });
        books[currentBookIndex].name = `Journal ${date}`;
      }
      books[currentBookIndex].content = textBox.innerHTML;
      books[currentBookIndex].vaultItems = vaultItems;
      lastSavedContent = textBox.innerHTML;
      updateBooksList();
    }
  }
  
  // Book Management
  function updateBooksList() {
    booksList.innerHTML = books.map((book, index) => `
      <li class="${index === currentBookIndex ? 'active' : ''}" onclick="window.loadBook(${index})">
        ${index === currentBookIndex ? '★ ' : ''}${book.name}
      </li>
    `).join('');
  }
  
  window.loadBook = (index) => {
    if (currentBookIndex !== -1) {
      saveCurrentBook();
    }
    currentBookIndex = index;
    textBox.innerHTML = books[index].content;
    vaultItems = books[index].vaultItems || [];
    lastSavedContent = textBox.innerHTML;
    updateBooksList();
    updateVaultView();
  };

  // Formatting Event Listeners
  boldButton.addEventListener('click', () => document.execCommand('bold'));
  italicButton.addEventListener('click', () => document.execCommand('italic'));
  underlineButton.addEventListener('click', () => document.execCommand('underline'));
  highlightButton.addEventListener('click', () => document.execCommand('hiliteColor', false, 'yellow'));
  bulletList.addEventListener('click', () => document.execCommand('insertUnorderedList'));

  // Book Management Event Listeners
  document.getElementById('new-book').addEventListener('click', () => {
    const bookName = prompt('Enter a name for the new book:');
    if (bookName) {
      if (currentBookIndex !== -1) {
        saveCurrentBook();
      }
      books.push({ name: bookName, content: '', vaultItems: [] });
      currentBookIndex = books.length - 1;
      textBox.innerHTML = '';
      vaultItems = [];
      lastSavedContent = '';
      updateBooksList();
      updateVaultView();
    }
  });

  document.getElementById('save-book').addEventListener('click', () => {
    saveCurrentBook();
    alert('Book saved!');
  });

  document.getElementById('rename-book').addEventListener('click', () => {
    if (currentBookIndex !== -1) {
      const newName = prompt('Enter a new name for the book:', books[currentBookIndex].name);
      if (newName) {
        books[currentBookIndex].name = newName;
        updateBooksList();
      }
    }
  });

  // Settings Management
  document.getElementById('settings-button').addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  document.getElementById('close-settings').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  document.getElementById('save-settings').addEventListener('click', () => {
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    settings.autosave = autosaveToggle.checked;
    settings.fullscreen = fullscreenToggle.checked;
    settings.uiScale = parseInt(uiScaleSelect.value);
    applyUIScale(settings.uiScale);
    applyFullscreenMode(settings.fullscreen);
    startAutosave();
    settingsModal.classList.add('hidden');
  });

  // Vault Management
  const vaultListView = document.getElementById('vault-list-view');
  const vaultGalleryView = document.getElementById('vault-gallery-view');
  
function updateVaultView() {
  // Group items by date
  const groupedItems = vaultItems.reduce((groups, item) => {
    const date = new Date(item.dateAdded).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});
  
  // Update List View with selection
  vaultListView.innerHTML = Object.entries(groupedItems).map(([date, items]) => `
    <div class="vault-date-group">
      <div class="vault-date-header">${new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })}</div>
      ${items.map(item => `
        <div class="vault-item ${item.id === selectedVaultItemId ? 'selected' : ''}"
             data-id="${item.id}"
             onclick="window.handleVaultItemClick('${item.id}')"
             ondblclick="window.handleVaultItemDoubleClick('${item.id}')">
          <img src="${item.type === 'image' ? item.thumbnail : 'lib/icons/file-icon.png'}" alt="${item.name}">
          <span>${item.name}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
  
  // Update Gallery View with selection
  vaultGalleryView.innerHTML = Object.entries(groupedItems).map(([date, items]) => `
    <div class="vault-date-group">
      <div class="vault-date-header">${new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })}</div>
      ${items.filter(item => item.type === 'image').map(item => `
        <div class="gallery-item ${item.id === selectedVaultItemId ? 'selected' : ''}"
             data-id="${item.id}"
             onclick="window.handleVaultItemClick('${item.id}')"
             ondblclick="window.handleVaultItemDoubleClick('${item.id}')">
          <img src="${item.data}" alt="${item.name}">
        </div>
      `).join('')}
    </div>
  `).join('');
}
// Add these handler functions
window.handleVaultItemClick = (id) => {
  selectedVaultItemId = id === selectedVaultItemId ? null : id;
  updateVaultView(); 
};

window.handleVaultItemDoubleClick = (id) => {
  const item = vaultItems.find(item => item.id === id);
  if (!item) return;
  
  const newWindow = window.open('', '_blank');
  
  // For images, set up proper display
  if (item.type === 'image') {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${item.name}</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #333;
            }
            img {
              max-width: 95vw;
              max-height: 95vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${item.data}" alt="${item.name}">
        </body>
      </html>
    `);
  } 
  // For PDFs, display using browser's PDF viewer
  else if (item.type === 'application/pdf') {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${item.name}</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
            }
            embed {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <embed src="${item.data}" type="application/pdf" width="100%" height="100%">
        </body>
      </html>
    `);
  }
  // For text files
  else if (item.type === 'text/plain') {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${item.name}</title>
          <style>
            body {
              margin: 20px;
              font-family: monospace;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    // Need to decode text content properly
    fetch(item.data)
      .then(response => response.text())
      .then(text => {
        newWindow.document.body.textContent = text;
      });
  }
  // For all other file types, try to display in an iframe
  else {
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${item.name}</title>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100vh;
              width: 100vw;
              overflow: hidden;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe src="${item.data}" type="${item.type}"></iframe>
        </body>
      </html>
    `);
  }
  
  newWindow.document.close();
};

// Vault item selection handler
window.selectVaultItem = (id) => {
  selectedVaultItemId = id === selectedVaultItemId ? null : id;
  updateVaultView();
};

  // Vault Tab Management
  const tabButtons = document.querySelectorAll('.tab-button');
  const vaultContents = document.querySelectorAll('.vault-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove('active'));
      vaultContents.forEach(content => content.classList.add('hidden'));
      button.classList.add('active');
      document.getElementById(`vault-${tab}-view`).classList.remove('hidden');
    });
  });

  // File Management
  attachFileButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*, .pdf, .doc, .docx, .txt';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const newItem = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          data: event.target.result,
          thumbnail: file.type.startsWith('image/') ? event.target.result : null,
          dateAdded: new Date().toISOString()
        };
        vaultItems.push(newItem);
        updateVaultView();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

// Add delete vault item functionality
deleteVaultItemButton.addEventListener('click', () => {
  // Check if we have a selection
  if (!selectedVaultItemId) {
    alert('Please select an item to delete');
    return;
  }

  // Confirm deletion
  if (confirm('Are you sure you want to delete this item?')) {
    // Remove the item
    vaultItems = vaultItems.filter(item => item.id !== selectedVaultItemId);
    selectedVaultItemId = null; // Clear selection after delete
    updateVaultView();
    saveCurrentBook();
  }
});

// Add delete book functionality
deleteBookButton.addEventListener('click', () => {
  if (currentBookIndex !== -1) {
    if (confirm('Are you sure you want to delete this book and all its attachments?')) {
      books.splice(currentBookIndex, 1);
      if (books.length > 0) {
        currentBookIndex = 0;
        textBox.innerHTML = books[0].content;
        vaultItems = books[0].vaultItems || [];
        lastSavedContent = textBox.innerHTML;
      } else {
        currentBookIndex = -1;
        textBox.innerHTML = '';
        vaultItems = [];
        lastSavedContent = '';
      }
      updateBooksList();
      updateVaultView();
    }
  } else {
    alert('No book is currently open');
  }
});

  // Import/Export Functionality
  document.getElementById('import-file').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.MyCompass';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        books = data.books;
        settings = data.settings || settings;
        currentBookIndex = data.lastOpenBook || 0;
        initializeSettings();
        if (currentBookIndex >= 0) {
          textBox.innerHTML = books[currentBookIndex].content;
          vaultItems = books[currentBookIndex].vaultItems || [];
          lastSavedContent = textBox.innerHTML;
        }
        updateBooksList();
        updateVaultView();
        startAutosave();
      };
      reader.readAsText(file);
    };
    input.click();
  });

  document.getElementById('export-file').addEventListener('click', () => {
    if (currentBookIndex !== -1) {
      saveCurrentBook();
    }
    const data = {
      books: books,
      settings: settings,
      lastOpenBook: currentBookIndex
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyCompass-${new Date().toISOString().split('T')[0]}.MyCompass`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Drag and Drop Functionality
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.MyCompass')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = JSON.parse(event.target.result);
          books = data.books;
          settings = data.settings || settings;
          currentBookIndex = data.lastOpenBook || 0;
          initializeSettings();
          if (currentBookIndex >= 0) {
            textBox.innerHTML = books[currentBookIndex].content;
            vaultItems = books[currentBookIndex].vaultItems || [];
            lastSavedContent = textBox.innerHTML;
          }
          updateBooksList();
          updateVaultView();
          startAutosave();
        };
        reader.readAsText(file);
      }
    }
  });

  // Unsaved Changes Warning
  window.addEventListener('beforeunload', (e) => {
    if (currentBookIndex !== -1 && textBox.innerHTML !== lastSavedContent) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

// Add the sterilize text functionality
sterilizeButton.addEventListener('click', () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  
  if (selection.toString().length > 0) {
    // If text is selected, only sterilize that text
    const span = document.createElement('span');
    span.textContent = selection.toString(); // This creates clean text
    range.deleteContents();
    range.insertNode(span);
    
    // Remove the span element but keep its contents
    const parent = span.parentNode;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
  } else {
    // If no text is selected, sterilize at cursor
    const textNode = document.createTextNode('\u200B'); // Zero-width space
    range.insertNode(textNode);
    
    // Create a new range around the cursor position
    const newRange = document.createRange();
    newRange.selectNode(textNode);
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // Execute removeFormat command
    document.execCommand('removeFormat', false, null);
  }
  
  // Update lastSavedContent since we modified the text
  lastSavedContent = textBox.innerHTML;
});


// Function for handling text-to-speech
async function handleTextToSpeech(text) {
  try {
    const response = await fetch("https://askdaisy.hydn.cc/api/alltalk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        characterVoice: "british_female.onnx"
      })
    });

    const result = await response.json();

    if (response.ok) {
  const audioUrl = result.audio_url;
      
      // Fetch the audio file and convert to data URL
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      
      // Convert blob to data URL
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = () => {
        // Create a new vault item with the actual audio data
        const newItem = {
          id: Date.now().toString(),
          name: `Audio_${new Date().toISOString().slice(0, 19)}.wav`,
          type: 'audio/wav',
          data: reader.result,
          thumbnail: 'lib/icons/audio-icon.png',
          dateAdded: new Date().toISOString()
        };
        
        vaultItems.push(newItem);
        updateVaultView();
        saveCurrentBook();
      };


     // Open audio player in new window
      const newWindow = window.open('', '_blank', 'width=400,height=200');
      newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Audio Player</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #ffe4b5;
              font-family: 'Arial', sans-serif;
            }
            #audio-container {
              width: 100%;
              max-width: 400px;
            }
            audio {
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div id="audio-container">
            <audio src="${audioUrl}" controls autoplay></audio>
          </div>
        </body>
        </html>
      `);
      newWindow.document.close();

    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

readSelectionButton.addEventListener('click', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (!selectedText) {
    alert('Please select some text first');
    return;
  }
  
  if (selectedText.length > 32000) {
    alert('Selected text is too long. Maximum length is 32,000 characters.');
    return;
  }
  
  handleTextToSpeech(selectedText);
});

  // Initialize
  initializeSettings();
  startAutosave();
});