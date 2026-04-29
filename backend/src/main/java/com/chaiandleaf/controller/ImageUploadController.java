package com.chaiandleaf.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ImageUploadController {

    @Value("${app.upload.dir:uploads/}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        String dir = uploadDir.endsWith("/") ? uploadDir : uploadDir + "/";
        Path uploadPath = Paths.get(dir);
        Files.createDirectories(uploadPath);
        Files.write(uploadPath.resolve(fileName), file.getBytes());
        return ResponseEntity.ok(Map.of("url", "/uploads/" + fileName));
    }
}
