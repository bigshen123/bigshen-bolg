package com.bigshen.blog.service;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.dto.CreateArticleRequest;
import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Category;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.CategoryRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 文章服务
 */
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * 获取已发布文章列表(分页)
     */
    public Page<ArticleDTO> getArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", pageable)
                .map(this::toDTO);
    }

    /**
     * 获取全部文章列表(管理员，含草稿)
     */
    public Page<ArticleDTO> getAllArticles(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isEmpty()) {
            return articleRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(this::toDTO);
        }
        return articleRepository.findByOrderByCreatedAtDesc(pageable)
                .map(this::toDTO);
    }

    /**
     * 根据ID获取文章
     */
    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        // 增加浏览量
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
        return toDTO(article);
    }

    /**
     * 创建文章
     */
    @Transactional
    public ArticleDTO createArticle(CreateArticleRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .coverImage(request.getCoverImage())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .author(author)
                .tags(request.getTags() != null ? request.getTags() : Collections.emptyList())
                .location(request.getLocation())
                .travelDate(request.getTravelDate())
                .viewCount(0)
                .likeCount(0)
                .commentCount(0)
                .build();

        // 关联分类
        if (request.getCategoryId() != null) {
            Article finalArticle = article;
            categoryRepository.findById(request.getCategoryId())
                    .ifPresent(cat -> {
                        finalArticle.setCategory(cat);
                        cat.setArticleCount(cat.getArticleCount() + 1);
                        categoryRepository.save(cat);
                    });
        }

        article = articleRepository.save(article);

        // 更新用户文章数(仅已发布)
        if ("PUBLISHED".equals(article.getStatus())) {
            author.setArticleCount(author.getArticleCount() + 1);
            userRepository.save(author);
        }

        return toDTO(article);
    }

    /**
     * 更新文章
     */
    @Transactional
    public ArticleDTO updateArticle(Long id, CreateArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        if (request.getTitle() != null) {
            article.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            article.setContent(request.getContent());
        }
        if (request.getSummary() != null) {
            article.setSummary(request.getSummary());
        }
        if (request.getCoverImage() != null) {
            article.setCoverImage(request.getCoverImage());
        }
        if (request.getTags() != null) {
            article.setTags(request.getTags());
        }
        if (request.getLocation() != null) {
            article.setLocation(request.getLocation());
        }
        if (request.getTravelDate() != null) {
            article.setTravelDate(request.getTravelDate());
        }
        if (request.getStatus() != null) {
            article.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId())
                    .ifPresent(article::setCategory);
        }

        article = articleRepository.save(article);
        return toDTO(article);
    }

    /**
     * 删除文章
     */
    @Transactional
    public void deleteArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        // 更新用户文章数
        User author = article.getAuthor();
        if (author.getArticleCount() > 0) {
            author.setArticleCount(author.getArticleCount() - 1);
            userRepository.save(author);
        }

        articleRepository.delete(article);
    }

    /**
     * 点赞文章
     */
    public ArticleDTO likeArticle(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        article.setLikeCount(article.getLikeCount() + 1);
        article = articleRepository.save(article);
        return toDTO(article);
    }

    /**
     * 按标签搜索文章
     */
    public Page<ArticleDTO> getArticlesByTag(String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByTag(tag, pageable)
                .map(this::toDTO);
    }

    /**
     * 按关键词搜索文章
     */
    public Page<ArticleDTO> searchArticles(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.searchByKeyword(keyword, pageable)
                .map(this::toDTO);
    }

    /**
     * 按分类获取文章
     */
    public Page<ArticleDTO> getArticlesByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return articleRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(categoryId, "PUBLISHED", pageable)
                .map(this::toDTO);
    }

    /**
     * 获取热门文章排行
     */
    public List<ArticleDTO> getHotArticles(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return articleRepository.findByStatusOrderByViewCountDesc("PUBLISHED", pageable)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 转换为DTO
     */
    private ArticleDTO toDTO(Article article) {
        User author = article.getAuthor();
        ArticleDTO.ArticleDTOBuilder builder = ArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .content(article.getContent())
                .summary(article.getSummary())
                .coverImage(article.getCoverImage())
                .authorId(author.getId())
                .authorName(author.getUsername())
                .authorAvatar(author.getAvatar())
                .status(article.getStatus())
                .tags(article.getTags())
                .location(article.getLocation())
                .travelDate(article.getTravelDate())
                .viewCount(article.getViewCount())
                .likeCount(article.getLikeCount())
                .commentCount(article.getCommentCount())
                .createdAt(article.getCreatedAt())
                .updatedAt(article.getUpdatedAt());

        if (article.getCategory() != null) {
            builder.categoryId(article.getCategory().getId())
                    .categoryName(article.getCategory().getName());
        }

        return builder.build();
    }
}
