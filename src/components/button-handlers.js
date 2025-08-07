const { invoke } = window.__TAURI__.core;
import yaml from 'js-yaml';
import { logToConsole } from './Console.js';

/**
 * Formats JSON output from the LLM for display in EditorB.
 * Handles both array of objects and single object responses.
 * Converts \\n to <br> for line breaks, and structures output for easy copying.
 */
function formatJsonForEditorB(json) {
  // If it's an array, format each object
  if (Array.isArray(json)) {
    return json.map(obj => formatSingleJsonObject(obj)).join('<hr>');
  }
  // If it's a single object, format it
  if (typeof json === 'object' && json !== null) {
    return formatSingleJsonObject(json);
  }
  // Fallback: return as plain text
  return String(json);
}

/**
 * Formats a single JSON object for display.
 * Handles keys: headline, transformed, seo, essay, social, linkedin.
 */
function formatSingleJsonObject(obj) {
  let html = '';
  if (obj.headline) {
    html += `<div style="font-weight:bold; margin-bottom:4px;">${obj.headline}</div>`;
  }
  if (obj.transformed) {
    html += `<div style="margin-bottom:8px;">${obj.transformed.replace(/\\n/g, '<br>')}</div>`;
  }
  // For multi-format objects (post prompt)
  ['seo', 'essay', 'social', 'linkedin'].forEach(key => {
    if (obj[key]) {
      html += `<div style="margin-bottom:6px;"><span style="font-weight:bold;">${key.toUpperCase()}:</span><br>${obj[key].replace(/\\n/g, '<br>')}</div>`;
    }
  });
  return html;
}

export function setupActionButtonHandlers(getEditorAText, editorB) {
  // Helper to set EditorB content, handling JSON formatting
  function setEditorBContent(result) {
    let formatted = result;
    try {
      const parsed = JSON.parse(result);
      formatted = formatJsonForEditorB(parsed);
    } catch (e) {
      // Not JSON, use as plain text
      formatted = result;
    }
    editorB.commands.setContent(formatted);
  }

  document.getElementById('incant-btn').onclick = async () => {
    setStatusBarMessage('Running INCNT transformation...');
    const text = getEditorAText();

    const response = await fetch('/prompts.yaml');
    const full_text = await response.text();
    const prompts = yaml.load(full_text);

    const montaigneSystemPrompt = prompts.montaigne;

    try {
      const result = await invoke('transform_text', {
        request: { text },
        providerType: 'OpenAI',
        modelName: 'gpt-4.1-nano-2025-04-14',
        systemPrompt: montaigneSystemPrompt,
      });
      setEditorBContent(result);
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
      setEditorBContent(result);
      setStatusBarMessage('Simplification complete.');
    } catch (err) {
      setStatusBarMessage('Simplification failed: ' + err);
      console.error('Simplification error:', err);
      logToConsole('error', `Simplification error: ${err.message}`);
    }
  };

  document.getElementById('blog-post-btn').onclick = async () => {
    setStatusBarMessage('Blog post transform.');
    const text = getEditorAText();
    const response = await fetch('/prompts.yaml');
    const full_text = await response.text();
    const prompts = yaml.load(full_text);

    try {
      const result = await invoke('transform_text', {
        request: { text },
        providerType: 'OpenAI',
        modelName: 'gpt-4.1-nano-2025-04-14',
        systemPrompt: prompts.post,
      });
      setEditorBContent(result);
      setStatusBarMessage('Blog post transformation complete.');
    } catch (err) {
      setStatusBarMessage('Blog post transformation failed: ' + err);
      console.error('Blog post transformation error:', err);
      logToConsole('error', `Blog post transformation error: ${err.message}`);
    }
  };
}

function fillNamedPrompt(template, values) {
  return template.replace(/{(\w+)}/g, (_, key) => values[key]);
}

export function foobar() {
  console.log('This is a placeholder function for future use.');
}