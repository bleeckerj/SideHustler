use chrono;
use serde::Serialize;
use tauri::AppHandle;
use log;
use tauri::Manager; // Add this line at the top of your file
use tauri::Emitter;

#[derive(Serialize, Clone)]
pub struct RichLog {
    pub message: String,
    pub data: String,
    pub timestamp: String,
    pub level: String,
}

#[derive(Serialize, Clone)]
pub struct SimpleLog {
    pub message: String,
    pub timestamp: String,
    pub level: String,
    pub id: Option<String>,
}

pub fn truncate(s: &str, max_chars: usize) -> String {
    match s.char_indices().nth(max_chars) {
        None => s.to_string(),
        Some((idx, _)) => format!("{}...", &s[..idx])
    }
}

#[derive(Clone)]
pub struct NewLogger {
    app_handle: AppHandle,
}

impl NewLogger {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }
    
    pub fn simple_log_message(&self, message: String, id: String, level: String) {
        let simple_log_data = SimpleLog {
            message: format!("{}", message),
            level: level.clone(),
            timestamp: chrono::Local::now().to_rfc3339().to_string(),
            id: Some(id.clone()),
        };
        match self.app_handle.emit("simple-log-message", simple_log_data) {
            Ok(_) => {},
            Err(e) => {
                eprintln!("Failed to emit simple log: {}", e);
            }
        }
        //log::debug!("{}", message);
    }
    
    pub fn rich_log_message(&self, message: String, data: String, level: String) {
        let rich_log_data = RichLog {
            message: message.clone(),
            data: data.clone(),
            timestamp: chrono::Local::now().to_rfc3339(),
            level: level.clone(),
        };
        match self.app_handle.emit("rich-log-message", rich_log_data) {
            Ok(_) => println!("Rich log emitted successfully"),
            Err(e) => {
                eprintln!("Failed to emit rich log: {}", e);
            }   
        }
        log::info!("{}", message);
    }
}