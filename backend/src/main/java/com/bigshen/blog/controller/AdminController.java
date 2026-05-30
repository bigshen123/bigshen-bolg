package com.bigshen.blog.controller;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.dto.CommentDTO;
import com.bigshen.blog.dto.UserDTO;
import com.bigshen.blog.service.AdminDashboardService;
import com.bigshen.blog.service.ArticleService;
import com.bigshen.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminDashboardService dashboardService;
    private final ArticleService articleService;
    private final CommentService commentService;

    /**
     * 仪表盘统计
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    /**
     * 获取所有文章（管理员视图，含草稿）
     */
    @GetMapping("/articles")
    public ResponseEntity<Page<ArticleDTO>> getArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(articleService.getAllArticles(page, size, status));
    }

    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getUsers() {
        return ResponseEntity.ok(dashboardService.getAllUsers());
    }

    /**
     * 获取所有评论（管理员）
     */
    @GetMapping("/comments")
    public ResponseEntity<List<CommentDTO>> getComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }

    /**
     * 热门文章排行
     */
    @GetMapping("/hot-articles")
    public ResponseEntity<List<ArticleDTO>> getHotArticles(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getHotArticles(limit));
    }
}
