// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(unused_imports)]
#![allow(dead_code)]
#![allow(unused)]
use log::{debug, error, log_enabled, info, Level};

fn main() {
    sidehustler_lib::run()

}
