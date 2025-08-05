#![allow(unused_imports)]
#![allow(dead_code)]
#![allow(unused)]
use tauri::{generate_handler, Runtime, Builder, Emitter, AppHandle, Manager, Window, State, WebviewWindowBuilder, WebviewWindow, WebviewUrl};
use std::fs;
use std::path::PathBuf;
use tauri::path::{BaseDirectory};
use serde_json::json;
//mod preferences;
//use preferences::Preferences;
mod keychain_handler;
use keychain_handler::KeychainHandler;
extern crate log;
use log::{
    LevelFilter, 
    SetLoggerError, 
    info, 
    debug, 
    error, 
    warn
};
use std::env;
use dotenv::dotenv;
mod logger;
use logger::NewLogger;

pub fn emit_console_message(app_handle: &AppHandle, level: &str, message: &str) {
    let payload = serde_json::json!({ "level": level, "message": message });
    let _ = app_handle.emit("console-message", payload);
    log::debug!("Emitting console message: {} - {}", level, message);
}

#[tauri::command]
async fn list_openai_models(api_key: String) -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    let res = client
    .get("https://api.openai.com/v1/models")
    .header(AUTHORIZATION, format!("Bearer {}", api_key))
    .send()
    .await
    .map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let models = json["data"]
    .as_array()
    .ok_or("No models found")?
    .iter()
    .filter_map(|m| m["id"].as_str().map(|s| s.to_string()))
    .collect();
    Ok(models)
}
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};

#[tauri::command]
async fn greet(name: &str, 
    app_handle: tauri::AppHandle) -> Result<(), String> {
        log::info!("Greet command called with name: {}", name);
        let new_logger: NewLogger = NewLogger::new(app_handle.clone());
        
        emit_console_message(&app_handle, "info", &format!("Greet command called with name: {}", name));
        Ok(())
    }
    
    #[derive(Deserialize)]
    pub struct TransformRequest {
        pub text: String,
        pub transformation: String,
    }
    
    #[derive(Serialize)]
    struct OpenAIRequest {
        model: String,
        messages: Vec<OpenAIMessage>,
    }
    
    #[derive(Serialize)]
    struct OpenAIMessage {
        role: String,
        content: String,
    }
    
    
    // Replace the save_api_key function
    #[tauri::command]
    async fn save_api_key(app_handle: tauri::AppHandle, api_key: String) -> Result<(), String> {
        // Get the app's data directory
        let mut config_path: PathBuf = app_handle.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
        
        log::debug!("App data directory: {:?}", config_path);
        
        // Add config subdirectory
        config_path.push("config");
        
        // Create the directory if it doesn't exist
        fs::create_dir_all(&config_path).map_err(|e| format!("Failed to create config directory: {}", e))?;
        
        // Add credentials.json file
        config_path.push("credentials.json");
        
        // Create JSON with the API key
        let contents = json!({ "openai_api_key": api_key }).to_string();
        
        // Write to file
        fs::write(&config_path, contents).map_err(|e| format!("Failed to write credentials file: {}", e))?;
        
        emit_console_message(&app_handle, "info", "API key saved successfully");
        Ok(())
    }
    
    // Replace the load_api_key function
    #[tauri::command]
    async fn load_api_key(app_handle: tauri::AppHandle) -> Result<String, String> {
        // Get the app's data directory
        let mut config_path: PathBuf = app_handle.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
        
        // Add path to credentials file
        config_path.push("config");
        config_path.push("credentials.json");
        
        // Check if the file exists
        if !config_path.exists() {
            return Err("API key not found. Please set your OpenAI API key".to_string());
        }
        
        // Read and parse the file
        let contents = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read credentials file: {}", e))?;
        
        let json: serde_json::Value = serde_json::from_str(&contents)
        .map_err(|e| format!("Failed to parse credentials file: {}", e))?;
        
        // Extract the API key
        let api_key = json["openai_api_key"].as_str()
        .ok_or("API key not found in config")?
        .to_string();
        
        emit_console_message(&app_handle, "debug", "API key loaded successfully");
        Ok(api_key)
    }
    
    // Function to get API key from various sources with priority
    pub fn get_openai_api_key(app_handle: &AppHandle) -> Result<String, String> {
        // Try environment variable first (highest priority)
        if let Ok(key) = env::var("OPENAI_API_KEY") {
            if !key.is_empty() {
                emit_console_message(app_handle, "debug", "Using API key from environment variable");
                return Ok(key);
            }
        }
        
        // Try loading from .env file if available
        if dotenv().is_ok() {
            if let Ok(key) = env::var("OPENAI_API_KEY") {
                if !key.is_empty() {
                    emit_console_message(app_handle, "debug", "Using API key from .env file");
                    return Ok(key);
                }
            }
        }
        
        // Try loading from config file (user's saved key)
        let mut config_path: PathBuf = app_handle.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
        
        config_path.push("config");
        config_path.push("credentials.json");
        
        if config_path.exists() {
            let contents = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read credentials file: {}", e))?;
            
            let json: serde_json::Value = serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse credentials file: {}", e))?;
            
            if let Some(key) = json["openai_api_key"].as_str() {
                if !key.is_empty() {
                    emit_console_message(app_handle, "debug", "Using API key from config file");
                    return Ok(key.to_string());
                }
            }
        }
        
        // No API key found
        Err("OpenAI API key not found. Please set your API key in settings".to_string())
    }
    
    // Updated command to get API key (frontend can call this to check if API key is set)
    #[tauri::command]
    async fn get_api_key(app_handle: tauri::AppHandle) -> Result<String, String> {
        // Only return if key exists, not the actual key for security
        match get_openai_api_key(&app_handle) {
            Ok(_) => Ok("API key is set".to_string()),
            Err(e) => Err(e)
        }
    }
    
    // Update your transform_text command to use the new function
    #[tauri::command]
    async fn transform_text(app_handle: tauri::AppHandle, request: TransformRequest) -> Result<String, String> {
        // Get API key automatically instead of passing it from frontend
        let api_key = get_openai_api_key(&app_handle)?;
        
        let prompt = format!("Transform the following text using the style: {}\n\n{}", request.transformation, request.text);
        let openai_req = OpenAIRequest {
            model: "gpt-3.5-turbo".to_string(),
            messages: vec![
            OpenAIMessage {
                role: "user".to_string(),
                content: prompt,
            },
            ],
        };
        
        let client = reqwest::Client::new();
        let res = client
        .post("https://api.openai.com/v1/chat/completions")
        .header(AUTHORIZATION, format!("Bearer {}", api_key))
        .header(CONTENT_TYPE, "application/json")
        .json(&openai_req)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
        let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
        let output = json["choices"][0]["message"]["content"].as_str().unwrap_or("").to_string();
        Ok(output)
    }
    
    
    
    // Update the run function to include all commands
    pub fn run() {
        tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize the logger
            env_logger::init();
            debug!("Starting Side Hustler...");
            // Load environment variables from .env file
            dotenv().ok();
            info!("Starting Side Hustler...");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            transform_text, 
            list_openai_models,
            save_api_key,
            load_api_key,
            get_api_key
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
        }

