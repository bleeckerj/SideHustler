import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { invoke } from "@tauri-apps/api/core";
import { logToConsole } from './Console.js';

let editorBInstance = null;

export function mountEditorB(container) {
  // Create editor container
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';
  editorContainer.style.height = '100%';
  editorContainer.style.display = 'flex';
  editorContainer.style.flexDirection = 'column';
  
  // Create title
  const title = document.createElement('div');
  title.className = 'editor-title';
  title.textContent = 'Transformed Output';
  title.style.padding = '10px';
  title.style.fontWeight = 'bold';
  title.style.borderBottom = '1px solid #ddd';
  
  // Create content area
  const contentArea = document.createElement('div');
  contentArea.className = 'editor-content';
  contentArea.style.flex = '1';
  contentArea.style.padding = '10px';
  contentArea.style.overflow = 'auto'; // Allow content to scroll if needed
  contentArea.style.minHeight = '0'; // Important for flex child
  
  // Append elements
  editorContainer.appendChild(title);
  editorContainer.appendChild(contentArea);
  container.appendChild(editorContainer);
  
  // Initialize Tiptap editor (read-only for output)
  editorBInstance = new Editor({
    element: contentArea,
    extensions: [
      StarterKit,
    ],
    content: '<p>Transformed text will appear here...</p>',
    editable: false, // Read-only since this is the output editor
  });
  
  logToConsole('info', 'Editor B (output) initialized');
  
  return editorBInstance;
}

// Method to update the content of EditorB with transformed text
export function updateEditorB(content) {
  if (editorBInstance) {
    editorBInstance.commands.setContent(content);
    logToConsole('info', 'Output editor updated with transformed text');
  } else {
    logToConsole('error', 'Cannot update Editor B - not initialized');
  }
}

// Method to get the content from EditorB
export function getEditorBContent() {
  return editorBInstance ? editorBInstance.getHTML() : '';
}

// Method to get the editor instance of EditorB
export function getEditorBInstance() {
  return editorBInstance;
}
