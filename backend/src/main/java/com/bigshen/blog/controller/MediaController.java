package com.bigshen.blog.controller;

import com.bigshen.blog.model.Media;
import com.bigshen.blog.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 媒体资源控制器
 */
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public ResponseEntity<Media> uploadImage(@RequestParam("file") MultipartFile file,
                                               @RequestParam(required = false, defaultValue = "0") Long articleId) {
        Media media = mediaService.uploadImage(file, articleId);
        return ResponseEntity.ok(media);
    }

    /**
     * 获取文章媒体列表
     */
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<Media>> getArticleMedia(@PathVariable Long articleId) {
        List<Media> mediaList = mediaService.getMediaByArticleId(articleId);
        return ResponseEntity.ok(mediaList);
    }
}
