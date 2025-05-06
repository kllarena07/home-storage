use actix_multipart::Multipart;
use actix_web::{web, App, Error, HttpResponse, HttpServer};
use futures_util::TryStreamExt;
use std::fs;
use std::io::Write;
use std::path::PathBuf;

#[actix_web::post("/upload")]
async fn save_file(mut payload: Multipart) -> Result<HttpResponse, Error> {
    let upload_dir = PathBuf::from("./images");

    // Create upload directory if it doesn't exist
    if !upload_dir.exists() {
        fs::create_dir_all(&upload_dir).map_err(|e| {
            eprintln!("Failed to create directory: {:?}", e);
            actix_web::error::ErrorInternalServerError("Failed to create upload directory")
        })?;
    }

    let mut file_uploaded = false;

    // Iterate over multipart stream
    while let Some(mut field) = payload.try_next().await? {
        let content_disposition = field.content_disposition();

        if let Some(filename) = content_disposition.get_filename() {
            // Sanitize filename to prevent directory traversal
            let sanitized_filename = sanitize_filename::sanitize(filename);
            if sanitized_filename.is_empty() {
                eprintln!("Empty filename after sanitization for: {}", filename);
                continue; // Skip this field or return error
            }
            let filepath = upload_dir.join(&sanitized_filename);

            println!("Saving file to: {:?}", filepath);

            // Create file
            // Add 'move' to capture filepath
            let mut f = web::block(move || fs::File::create(&filepath)).await??;

            // Write file chunks
            while let Some(chunk) = field.try_next().await? {
                // Modify web::block to correctly move f and chunk
                let mut file_handle = f; // Temporary variable to hold f before moving and make it mutable
                f = web::block(move || {
                    file_handle.write_all(&chunk)?; // Use moved file_handle and chunk
                    Ok::<_, std::io::Error>(file_handle) // Return file_handle on success
                })
                .await??;
            }
            file_uploaded = true; // Mark that at least one file part was processed
        }
    }

    if file_uploaded {
        Ok(HttpResponse::Ok().body("File uploaded successfully"))
    } else {
        Ok(HttpResponse::BadRequest().body("No file uploaded")) // Or InternalServerError depending on expected behavior
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = 8080;
    println!("Server started on port {}", port);

    HttpServer::new(|| App::new().service(save_file))
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
}
