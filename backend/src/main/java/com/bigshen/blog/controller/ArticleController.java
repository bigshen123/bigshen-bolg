package com.bigshen.blog.controller;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.dto.CreateArticleRequest;
import com.bigshen.blog.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文章控制器
 */
@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    /**
     * 获取文章列表
     */
    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ArticleDTO> articles = articleService.getArticles(page, size);
        return ResponseEntity.ok(articles);
    }

    /**
     * 获取文章详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getArticle(@PathVariable Long id) {
        ArticleDTO article = articleService.getArticleById(id);
        return ResponseEntity.ok(article);
    }

    /**
     * 创建文章
     */
    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@Valid @RequestBody CreateArticleRequest request,
                                                      Authentication authentication) {
        ArticleDTO article = articleService.createArticle(request, authentication.getName());
        return ResponseEntity.ok(article);
    }

    /**
     * 更新文章
     */
    @PutMapping("/{id}")
    public ResponseEntity<ArticleDTO> updateArticle(@PathVariable Long id,
                                                      @RequestBody CreateArticleRequest request) {
        ArticleDTO article = articleService.updateArticle(id, request);
        return ResponseEntity.ok(article);
    }

    /**
     * 删除文章
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 点赞文章
     */
    @PostMapping("/{id}/like")
    public ResponseEntity<ArticleDTO> likeArticle(@PathVariable Long id) {
        ArticleDTO article = articleService.likeArticle(id);
        return ResponseEntity.ok(article);
    }

    /**
     * 搜索文章
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ArticleDTO>> searchArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ArticleDTO> articles;
        if (categoryId != null) {
            articles = articleService.getArticlesByCategory(categoryId, page, size);
        } else if (tag != null && !tag.isEmpty()) {
            articles = articleService.getArticlesByTag(tag, page, size);
        } else if (keyword != null && !keyword.isEmpty()) {
            articles = articleService.searchArticles(keyword, page, size);
        } else {
            articles = articleService.getArticles(page, size);
        }
        return ResponseEntity.ok(articles);
    }

    /**
     * 热门文章排行
     */
    @GetMapping("/hot")
    public ResponseEntity<List<ArticleDTO>> getHotArticles(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(articleService.getHotArticles(limit));
    }
}
