// Console.js: Mounts a read-only Tiptap editor for console output with message levels
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const levelStyles = {
  debug: 'color: #1976d2;', // blue
  info: 'color: #388e3c;', // green
  warning: 'color: #fbc02d;', // yellow
  error: 'color: #d32f2f;', // red
}

let editor;

export function mountConsole(container) {
  // Create editor element first
  const editorEl = document.createElement('div')
  editorEl.className = 'console-editor'
  container.appendChild(editorEl)
  
  // Initialize editor with the element directly in options
  editor = new Editor({
    element: editorEl,
    extensions: [StarterKit],
    editable: false,
    content: '',
  })
  
  return editor
}

export function logToConsole(level, message) {
  if (!editor) return
  const style = levelStyles[level] || levelStyles.info
  const html = `<span style="${style}"><strong>[${level.toUpperCase()}]</strong></span> ${message}`
  editor.commands.insertContent(`<div>${html}</div>`)
  // Scroll to bottom
  const editorEl = editor.options.element
  if (editorEl) editorEl.scrollTop = editorEl.scrollHeight
}

export function clearConsole() {
  if (editor) editor.commands.setContent('')
}
