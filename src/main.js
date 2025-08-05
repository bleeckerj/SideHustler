document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.body.style.height = '100vh';

// Define UI configuration variables at the top of the file
const UI_CONFIG = {
  // Resize handle dimensions
  verticalHandleWidth: '4px',
  horizontalHandleHeight: '4px',
  
  // Colors
  handleBackgroundColor: '#e0e0e0',
  handleHoverColor: '#0f0f0f',
  handleIndicatorColor: '#9e9e9e',
  collapsedHandleColor: '#000000',
  collapsedHandleHoverColor: '#2980b9',
  
  // Console dimensions and behavior
  consoleDefaultHeight: '150px',
  consoleMinHeight: '80px',
  consoleCollapsedHeight: '8px',
  snapThreshold: 40,
  
  // Editor dimensions
  editorMinWidth: 300,
  editorMinHeight: 150
};

// Add global styles for resize handles
const style = document.createElement('style');
style.textContent = `
  .vertical-resize-handle {
    background-color: ${UI_CONFIG.handleBackgroundColor};
    width: ${UI_CONFIG.verticalHandleWidth};
    min-width: ${UI_CONFIG.verticalHandleWidth};
    cursor: col-resize;
    height: 100%;
    transition: background-color 0.2s, width 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 10;
  }
  
  .vertical-resize-handle:hover,
  .vertical-resize-handle:active {
    background-color: ${UI_CONFIG.handleHoverColor};
    width: calc(${UI_CONFIG.verticalHandleWidth} * 2.5); /* Make handle area wider on hover */
    min-width: calc(${UI_CONFIG.verticalHandleWidth} * 2.5);
  }
  
  .vertical-resize-handle::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 20px;
    width: 4px; /* Thin boundary line always visible */
    background-color: ${UI_CONFIG.handleIndicatorColor};
    border-radius: 2px;
    pointer-events: none;
    z-index: 11;
  }
  
  .horizontal-resize-handle {
    background-color: ${UI_CONFIG.handleBackgroundColor};
    height: ${UI_CONFIG.horizontalHandleHeight};
    cursor: row-resize;
    width: 100%;
    transition: background-color 0.2s, height 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  
  .horizontal-resize-handle:hover,
  .horizontal-resize-handle:active {
    background-color: ${UI_CONFIG.handleHoverColor};
    height: calc(${UI_CONFIG.horizontalHandleHeight} * 2.5); /* Make handle area taller on hover */
  }
  
  .horizontal-resize-handle::after {
    content: "";
    width: 20px;
    height: 4px; /* Thin boundary line */
    background-color: ${UI_CONFIG.handleIndicatorColor};
    border-radius: 2px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  
  .horizontal-resize-handle.console-collapsed {
    background-color: ${UI_CONFIG.collapsedHandleColor};
  }
  
  .horizontal-resize-handle.console-collapsed:hover {
    background-color: ${UI_CONFIG.collapsedHandleHoverColor};
  }
  
  .horizontal-resize-handle.console-collapsed::after {
    content: "";
    width: 20px;
    height: 4px;
    background-color: white;
    border-radius: 2px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
`;
document.head.appendChild(style);

import { mountEditorA } from './components/EditorA.js'
import { mountEditorB } from './components/EditorB.js'
import { mountConsole, logToConsole } from './components/Console.js'
import { listen } from '@tauri-apps/api/event'
const { invoke } = window.__TAURI__.core;

let unlistenConsoleMessage;

console.log('Setting up event listeners and mounting components...');

const app = document.getElementById('app');
app.style.display = 'flex';
app.style.flexDirection = 'column';
app.style.height = '100vh';
app.style.width = '100vw';
app.style.overflow = 'hidden';

// Create the panes first
const leftPane = document.createElement('div');
leftPane.style.flex = '0 0 50%';
leftPane.style.minWidth = `${UI_CONFIG.editorMinWidth}px`;
leftPane.style.overflow = 'hidden';
leftPane.style.display = 'flex';
leftPane.style.flexDirection = 'column';

const rightPane = document.createElement('div');
rightPane.style.flex = '0 0 50%';
rightPane.style.minWidth = `${UI_CONFIG.editorMinWidth}px`;
rightPane.style.overflow = 'hidden';
rightPane.style.display = 'flex';
rightPane.style.flexDirection = 'column';

// Main editors container (for left and right panes)
const editorsContainer = document.createElement('div');
editorsContainer.style.display = 'flex';
editorsContainer.style.flexDirection = 'row';
editorsContainer.style.flex = '1'; // Takes available space
editorsContainer.style.minHeight = '0'; // Important for flex child to respect parent height
editorsContainer.style.overflow = 'hidden';

// Console area with fixed height
const consoleContainer = document.createElement('div');
consoleContainer.style.width = '100%';
consoleContainer.style.height = UI_CONFIG.consoleDefaultHeight;
consoleContainer.style.minHeight = UI_CONFIG.consoleDefaultHeight;
consoleContainer.style.maxHeight = UI_CONFIG.consoleDefaultHeight;
consoleContainer.style.overflow = 'auto'; // Only console can scroll if needed
consoleContainer.dataset.snapped = 'false'; // Initialize snapped state

// Create resize handlers
function createResizeHandle(isVertical = true) {
  const handle = document.createElement('div');
  handle.className = isVertical ? 'vertical-resize-handle' : 'horizontal-resize-handle';
  return handle;
}

// Create the vertical resize handle (between Editor A and Editor B)
const verticalResizeHandle = createResizeHandle(true);

// Create the horizontal resize handle (between editors and console)
const horizontalResizeHandle = createResizeHandle(false);

// Build layout with resize handles
editorsContainer.appendChild(leftPane);
editorsContainer.appendChild(verticalResizeHandle);
editorsContainer.appendChild(rightPane);

app.appendChild(editorsContainer);
app.appendChild(horizontalResizeHandle);
app.appendChild(consoleContainer);

// Mount components into the proper panes
mountEditorA(leftPane);
mountEditorB(rightPane);
mountConsole(consoleContainer);

// Add resize functionality to vertical handle
verticalResizeHandle.addEventListener('mousedown', (mouseDownEvent) => {
  mouseDownEvent.preventDefault();
  
  const startX = mouseDownEvent.clientX;
  const leftPaneStartWidth = leftPane.getBoundingClientRect().width;
  const rightPaneStartWidth = rightPane.getBoundingClientRect().width;
  const totalWidth = leftPaneStartWidth + rightPaneStartWidth;
  
  // Define minimum widths from config
  const MIN_WIDTH = UI_CONFIG.editorMinWidth;
  
  function handleMouseMove(mouseMoveEvent) {
    const deltaX = mouseMoveEvent.clientX - startX;
    const newLeftWidth = leftPaneStartWidth + deltaX;
    const newRightWidth = rightPaneStartWidth - deltaX;
    
    // Ensure minimum width for both panes
    if (newLeftWidth >= MIN_WIDTH && newRightWidth >= MIN_WIDTH) {
      const leftPercent = (newLeftWidth / totalWidth) * 100;
      const rightPercent = (newRightWidth / totalWidth) * 100;
      
      leftPane.style.flex = `0 0 ${leftPercent}%`;
      rightPane.style.flex = `0 0 ${rightPercent}%`;
    }
  }
  
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

// Add resize functionality to horizontal handle
horizontalResizeHandle.addEventListener('mousedown', (mouseDownEvent) => {
  mouseDownEvent.preventDefault();
  
  const startY = mouseDownEvent.clientY;
  const editorsContainerStartHeight = editorsContainer.getBoundingClientRect().height;
  const consoleStartHeight = consoleContainer.getBoundingClientRect().height;
  const appHeight = app.getBoundingClientRect().height;
  
  // Define constants for snap behavior from config
  const SNAP_THRESHOLD = UI_CONFIG.snapThreshold;
  const COLLAPSED_HEIGHT = parseInt(UI_CONFIG.consoleCollapsedHeight);
  const MIN_CONSOLE_HEIGHT = parseInt(UI_CONFIG.consoleMinHeight);
  const MIN_EDITORS_HEIGHT = UI_CONFIG.editorMinHeight;
  
  function handleMouseMove(mouseMoveEvent) {
    const deltaY = mouseMoveEvent.clientY - startY;
    const newEditorsHeight = editorsContainerStartHeight + deltaY;
    const newConsoleHeight = consoleStartHeight - deltaY;
    
    // Calculate how close we are to the bottom of the app
    const distanceToBottom = appHeight - mouseMoveEvent.clientY;
    
    // Handle snap behavior when approaching bottom of window
    if (distanceToBottom < SNAP_THRESHOLD && consoleStartHeight > COLLAPSED_HEIGHT) {
      // Snap console to collapsed state
      consoleContainer.style.height = `${COLLAPSED_HEIGHT}px`;
      consoleContainer.style.minHeight = `${COLLAPSED_HEIGHT}px`;
      consoleContainer.style.maxHeight = `${COLLAPSED_HEIGHT}px`;
      consoleContainer.dataset.snapped = 'true';
      
      // Add visual indicator for collapsed state
      horizontalResizeHandle.classList.add('console-collapsed');
    } 
    // Normal resize behavior when not snapping
    else if (newConsoleHeight > MIN_CONSOLE_HEIGHT && newEditorsHeight > MIN_EDITORS_HEIGHT) {
      consoleContainer.style.height = `${newConsoleHeight}px`;
      consoleContainer.style.minHeight = `${newConsoleHeight}px`;
      consoleContainer.style.maxHeight = `${newConsoleHeight}px`;
      consoleContainer.dataset.snapped = 'false';
      
      // Remove collapsed indicator
      horizontalResizeHandle.classList.remove('console-collapsed');
    }
    // Allow expanding from collapsed state with less restriction
    else if (consoleContainer.dataset.snapped === 'true' && deltaY < 0) {
      // User is dragging upward from collapsed state
      const expandedHeight = Math.max(MIN_CONSOLE_HEIGHT, COLLAPSED_HEIGHT - deltaY);
      consoleContainer.style.height = `${expandedHeight}px`;
      consoleContainer.style.minHeight = `${expandedHeight}px`;
      consoleContainer.style.maxHeight = `${expandedHeight}px`;
      consoleContainer.dataset.snapped = 'false';
      
      // Remove collapsed indicator
      horizontalResizeHandle.classList.remove('console-collapsed');
    }
  }
  
  function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

// Add double-click behavior to toggle console between collapsed and expanded states
horizontalResizeHandle.addEventListener('dblclick', () => {
  const COLLAPSED_HEIGHT = parseInt(UI_CONFIG.consoleCollapsedHeight);
  const DEFAULT_EXPANDED_HEIGHT = parseInt(UI_CONFIG.consoleDefaultHeight);
  
  if (consoleContainer.dataset.snapped === 'true') {
    // Expand the console
    consoleContainer.style.height = `${DEFAULT_EXPANDED_HEIGHT}px`;
    consoleContainer.style.minHeight = `${DEFAULT_EXPANDED_HEIGHT}px`;
    consoleContainer.style.maxHeight = `${DEFAULT_EXPANDED_HEIGHT}px`;
    consoleContainer.dataset.snapped = 'false';
    horizontalResizeHandle.classList.remove('console-collapsed');
  } else {
    // Collapse the console
    consoleContainer.style.height = `${COLLAPSED_HEIGHT}px`;
    consoleContainer.style.minHeight = `${COLLAPSED_HEIGHT}px`;
    consoleContainer.style.maxHeight = `${COLLAPSED_HEIGHT}px`;
    consoleContainer.dataset.snapped = 'true';
    horizontalResizeHandle.classList.add('console-collapsed');
  }
});

// Initialize the snapped state to false
consoleContainer.dataset.snapped = 'false';

// Build layout with resize handles
editorsContainer.appendChild(leftPane);
editorsContainer.appendChild(verticalResizeHandle);
editorsContainer.appendChild(rightPane);

app.appendChild(editorsContainer);
app.appendChild(horizontalResizeHandle);
app.appendChild(consoleContainer);

try {
    unlistenConsoleMessage = await listen('console-message', (event) => {
        console.log(`Received console message: ${JSON.stringify(event)}`);
        const { level, message } = event.payload;
        logToConsole(level, message);
    }).then(() => {
        console.log("Event listener for 'console-message' registered successfully");
    }).catch(err => {
        console.error("Failed to register event listener:", err);
    });
} catch (error) {
    console.error("Error setting up event listeners:", error);
}

window.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape') {
        console.log("Escape key pressed");
        await invoke('greet', { name: 'World' });
    }
});
