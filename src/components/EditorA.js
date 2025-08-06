import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { logToConsole } from './Console.js'
import Underline from '@tiptap/extension-underline'
import { updateEditorB } from './EditorB.js' // Import the function to update EditorB

let editorAInstance = null;

// Add a flag to track if the initial text has been cleared
let initialTextCleared = false;

export function mountEditorA(element) {
  // Create editor container
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';
  editorContainer.style.height = '100%';
  editorContainer.style.display = 'flex';
  editorContainer.style.flexDirection = 'column';
  
  // Create title
  const title = document.createElement('div');
  title.className = 'editor-title';
  title.textContent = 'Source Text';
  title.style.padding = '10px';
  title.style.fontWeight = 'bold';
  title.style.borderBottom = '1px solid #ddd';
  
  // Create toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';
  toolbar.style.padding = '5px';
  toolbar.style.borderBottom = '1px solid #eee';
  toolbar.style.display = 'flex';
  toolbar.style.gap = '5px';
  
  // Add toolbar buttons - only include commands that are available in StarterKit
  const buttons = [
    { icon: 'B', command: 'toggleBold', tooltip: 'Bold' },
    { icon: 'I', command: 'toggleItalic', tooltip: 'Italic' },
    { icon: 'U', command: 'toggleUnderline', tooltip: 'Underline' },
    { icon: 'H1', command: 'toggleHeading', args: { level: 1 }, tooltip: 'Heading 1' },
    { icon: 'H2', command: 'toggleHeading', args: { level: 2 }, tooltip: 'Heading 2' },
    { icon: 'H3', command: 'toggleHeading', args: { level: 3 }, tooltip: 'Heading 3' },
    { icon: '•', command: 'toggleBulletList', tooltip: 'Bullet List' },
    { icon: '1.', command: 'toggleOrderedList', tooltip: 'Numbered List' },
  ];
  
  // Create content area
  const contentArea = document.createElement('div');
  contentArea.className = 'editor-content';
  contentArea.style.flex = '1';
  contentArea.style.padding = '10px';
  contentArea.style.overflow = 'auto'; // Allow content to scroll if needed
  contentArea.style.minHeight = '0'; // Important for flex child
  
  // Append elements
  editorContainer.appendChild(title);
  editorContainer.appendChild(toolbar);
  editorContainer.appendChild(contentArea);
  element.appendChild(editorContainer);
  
  // Initialize Tiptap editor with additional extensions
  editorAInstance = new Editor({
    element: contentArea,
    extensions: [
      StarterKit,
      Underline,
    ],
    content: '<p>Tap or paste your text here to transform...</p>',
    editable: true,
  });
  
  // Add a more reliable keydown event listener to the DOM element
  contentArea.addEventListener('keydown', (event) => {
    console.log(`Editor A keydown: ${event.key}`);
    try {
      logToConsole('debug', `Editor A keydown: ${event.key}`);
    } catch (e) {
      console.error('Error logging to console:', e);
    }
    
    // Only clear initial text on first keydown if it hasn't been cleared yet
    if (!initialTextCleared) {
      // Only process actual text input (not modifier keys, etc.)
      if (event.key.length === 1 || event.key === 'Enter') {
        console.log('Clearing initial text and inserting typed character');
        initialTextCleared = true;
        
        // Prevent default handling for this keystroke
        event.preventDefault();
        
        // Use setTimeout to ensure this happens after the key event is processed
        setTimeout(() => {
          if (event.key === 'Enter') {
            // Handle Enter key specially
            editorAInstance.commands.setContent('<p></p>');
          } else {
            // For normal characters, add them to the document
            editorAInstance.commands.setContent(`<p>${event.key}</p>`);
          }
          
          // Position cursor after the inserted character
          editorAInstance.commands.focus('end');
          
          // Clear EditorB when EditorA's initial text is cleared
          try {
            updateEditorB('<p></p>');
            logToConsole('info', 'Output editor cleared and ready for transformation');
          } catch (err) {
            console.error('Error updating Editor B:', err);
            logToConsole('error', 'Failed to clear output editor');
          }
        }, 0);
      }
    }
  });
  
  // Add buttons to toolbar
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.icon;
    button.title = btn.tooltip;
    button.style.minWidth = '30px';
    button.style.height = '30px';
    button.style.cursor = 'pointer';
    button.style.border = '1px solid #ddd';
    button.style.borderRadius = '3px';
    button.style.background = '#f5f5f5';
    
    button.addEventListener('click', () => {
      // Handle command execution safely
      try {
        if (btn.args) {
          editorAInstance.chain().focus()[btn.command](btn.args).run();
        } else {
          editorAInstance.chain().focus()[btn.command]().run();
        }
      } catch (error) {
        logToConsole('error', `Command error: ${btn.command} - ${error.message}`);
      }
    });
    
    toolbar.appendChild(button);
  });
  
  // Log initialization more visibly
  console.log('Editor A (source) initialized');
  try {
    logToConsole('info', 'Editor A (source) initialized');
  } catch (e) {
    console.error('Error logging to console component:', e);
  }
  
  return editorAInstance;
}

// Method to get the content from EditorA
export function getEditorAContent() {
  return editorAInstance ? editorAInstance.getHTML() : '';
}

// Method to set the content of EditorA
export function setEditorAContent(content) {
  if (editorAInstance) {
    editorAInstance.commands.setContent(content);
  }
}

// Add a method to reset the initial text state if needed (e.g., when creating a new document)
export function resetEditorAInitialState() {
  initialTextCleared = false;
  if (editorAInstance) {
    editorAInstance.commands.setContent('<p>Type or paste your text here to transform...</p>');
  }
}

// Method to get plain text from EditorA
export function getEditorAText() {
  return editorAInstance ? editorAInstance.getText() : '';
}

export function getEditorAInstance() {
  return editorAInstance;
}