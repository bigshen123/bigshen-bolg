package com.bigshen.blog.service;

import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Media;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * 媒体资源服务
 */
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ArticleRepository articleRepository;

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * 上传图片
     */
    public Media uploadImage(MultipartFile file, Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        String fileName = saveFile(file);

        Media media = Media.builder()
                .url("/uploads/" + fileName)
                .type(Media.MediaType.IMAGE)
                .description(file.getOriginalFilename())
                .article(article)
                .build();

        return mediaRepository.save(media);
    }

    /**
     * 获取文章的媒体列表
     */
    public List<Media> getMediaByArticleId(Long articleId) {
        return mediaRepository.findByArticleId(articleId);
    }

    /**
     * 保存文件到本地
     */
    private String saveFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }
}
