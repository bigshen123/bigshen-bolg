package com.bigshen.blog.controller;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.repository.UserRepository;
import com.bigshen.blog.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 收藏控制器
 */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserRepository userRepository;

    /**
     * 获取当前用户收藏列表
     */
    @GetMapping
    public ResponseEntity<Page<ArticleDTO>> getFavorites(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"))
                .getId();
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId, page, size));
    }

    /**
     * 获取指定用户收藏列表
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<ArticleDTO>> getUserFavorites(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId, page, size));
    }

    /**
     * 收藏文章
     */
    @PostMapping("/{articleId}")
    public ResponseEntity<Map<String, String>> addFavorite(
            @PathVariable Long articleId,
            @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        favoriteService.addFavorite(userId, articleId);
        return ResponseEntity.ok(Map.of("message", "收藏成功"));
    }

    /**
     * 取消收藏
     */
    @DeleteMapping("/{articleId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @PathVariable Long articleId,
            @RequestBody Map<String, Long> body) {
        Long userId = body.get("userId");
        favoriteService.removeFavorite(userId, articleId);
        return ResponseEntity.ok(Map.of("message", "取消收藏成功"));
    }

    /**
     * 检查是否已收藏
     */
    @GetMapping("/check/{articleId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable Long articleId,
            @RequestParam Long userId) {
        boolean favorited = favoriteService.isFavorited(userId, articleId);
        return ResponseEntity.ok(Map.of("favorited", favorited));
    }
}
