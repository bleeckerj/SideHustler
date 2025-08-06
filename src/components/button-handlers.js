const { invoke } = window.__TAURI__.core;
import yaml from 'js-yaml';
import { logToConsole } from './Console.js';

export function setupActionButtonHandlers(getEditorAText, editorB) {
  // Example for one button:
  console.log('Setting up action button handlers');
  console.log(document.getElementById('incant-btn'));
  document.getElementById('incant-btn').onclick = async () => {
    setStatusBarMessage('Running INCNT transformation...');
    const text = getEditorAText();

    // Example: system prompt for "INCNT" transformation
    const systemPrompt = "You are a helpful assistant. Transform the user's text as requested and return the result as a JSON object: { \"transformed\": \"...\" }";
        
    const response = await fetch('/prompts.yaml');
    const full_text = await response.text();
    const prompts = yaml.load(full_text);

    const montaigneSystemPrompt = prompts.montaigne;

    try {
      const result = await invoke('transform_text', {
        request: { text },
        providerType: 'OpenAI',
        modelName: 'gpt-4.1-nano-2025-04-14',
        systemPrompt: montaigneSystemPrompt, // <-- Pass system prompt correctly
      });
      debugger;
      editorB.commands.setContent(result); // Now editorB is available
      setStatusBarMessage('Transformation complete.');
    } catch (err) {
      setStatusBarMessage('Transformation failed: ' + err);
      console.error('Transformation error:', err);
      logToConsole('error', `Transformation error: ${err.message}`);
    }
  };

  document.getElementById('simplify-btn').onclick = async () => {
    setStatusBarMessage('Running Simplify transformation...');
    const text = getEditorAText();

    // Example: system prompt for "Simplify" transformation
    //const systemPrompt = "You are a helpful assistant. Simplify the user's text and return the result as a JSON object: { \"simplified\": \"...\" }";
    
    const response = await fetch('/prompts.yaml');
    const full_text = await response.text();
    const prompts = yaml.load(full_text);

    const simplifyPrompt = prompts.simplify;
    const systemPrompt = fillNamedPrompt(simplifyPrompt, { grade: 8, count: 3 });

    try {
      const result = await invoke('transform_text', {
        request: { text },
        providerType: 'OpenAI',
        modelName: 'gpt-4.1-nano-2025-04-14',
        systemPrompt, 
      });
      editorB.commands.setContent(result); // Now editorB is available
      setStatusBarMessage('Simplification complete.');
    } catch (err) {
      setStatusBarMessage('Simplification failed: ' + err);
      console.error('Simplification error:', err);
      logToConsole('error', `Simplification error: ${err.message}`);
    }
  }

}

function fillNamedPrompt(template, values) {
  return template.replace(/{(\w+)}/g, (_, key) => values[key]);
}

export function foobar() {
  console.log('This is a placeholder function for future use.');
}