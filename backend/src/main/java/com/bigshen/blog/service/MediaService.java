package com.bigshen.blog.service;

import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Media;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ArticleRepository articleRepository;

    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * 上传图片（articleId 为 null 或 0 表示独立图库上传）
     */
    public Media uploadImage(MultipartFile file, Long articleId) {
        Article article = null;
        if (articleId != null && articleId > 0) {
            article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new RuntimeException("文章不存在"));
        }

        String fileName = saveFile(file);

        Media.MediaBuilder builder = Media.builder()
                .url("/uploads/" + fileName)
                .type(Media.MediaType.IMAGE)
                .description(file.getOriginalFilename());

        if (article != null) {
            builder.article(article);
        }

        return mediaRepository.save(builder.build());
    }

    /**
     * 获取文章的媒体列表
     */
    public List<Media> getMediaByArticleId(Long articleId) {
        return mediaRepository.findByArticleId(articleId);
    }

    /**
     * 获取独立图库照片（不关联文章的）
     */
    @Transactional(readOnly = true)
    public List<Media> getGalleryPhotos() {
        List<Media> photos = mediaRepository.findByArticleIsNullOrderByCreatedAtDesc();
        log.info("图库查询结果: {} 张独立照片", photos.size());
        return photos;
    }

    /**
     * 删除图库照片（同时删除文件）
     */
    @Transactional
    public void deleteMedia(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("照片不存在"));
        // 删除物理文件
        try {
            String url = media.getUrl();
            if (url != null && url.startsWith("/uploads/")) {
                Path filePath = Paths.get(uploadDir, url.substring("/uploads/".length()));
                Files.deleteIfExists(filePath);
                log.info("照片文件已删除: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("删除照片文件失败: {}", e.getMessage());
        }
        mediaRepository.delete(media);
        log.info("图库照片已删除: id={}", id);
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
