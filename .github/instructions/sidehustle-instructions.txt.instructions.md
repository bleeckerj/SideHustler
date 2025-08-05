---
applyTo: '**'
---
This is a Tauri and Rust-based application that is meant to be a side-by-side text editor in which the left side is where a user writes and the right side is where transformations are rendered according to an LLM prompt. The overall purpose is to convert the text the user writes into a semantically identical but stylistically altered form. For example, the prompt might be to lower the reading level of the text, to make it more suitable for a compelling LinkedIn or social media post by making it more engaging, with a hook, and click-bait-y, or to expand the overall semantics for a longer form essay, or to adjust the style in a particular way as specified in the instructional prompt.

The UI design of the app consists of two side-by-side Tiptap editors.

There will be a row of buttons to control the transformation. The buttons will provide for a variety of standard transformations (SOCIAL, SHORT, SIMPLE, CLICK-Y, LINKEDIN, MORE)


There will be standard menu items for save, close, open files.

The integration with an LLM will be initially to OpenAI, with the option to select which model to use.

After OpenAI will be a faciilty for integrating with LM Studio and Ollama for local model support.

There will be an environment file and facility for saving one's OpenAI API Key.

Focus on the following tasks:
1. Implement the Tauri application structure with Rust backend.
2. Create the Tiptap editors for the left and right sides of the UI.
3. Implement the transformation buttons and their functionality.
4. Set up the menu items for file operations.
5. Integrate with OpenAI API for text transformation.
6. Prepare for future integration with LM Studio and Ollama.

