package com.bigshen.blog.service;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.dto.UserDTO;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.CommentRepository;
import com.bigshen.blog.repository.FavoriteRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理员仪表盘服务
 */
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final FavoriteRepository favoriteRepository;

    /**
     * 获取仪表盘统计数据
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalArticles", articleRepository.count());
        stats.put("publishedArticles", articleRepository.countByStatus("PUBLISHED"));
        stats.put("draftArticles", articleRepository.countByStatus("DRAFT"));
        stats.put("totalUsers", userRepository.count());
        stats.put("totalComments", commentRepository.count());
        stats.put("totalFavorites", favoriteRepository.count());

        // 总阅读量
        long totalViews = articleRepository.findAll().stream()
                .mapToLong(a -> a.getViewCount() != null ? a.getViewCount() : 0)
                .sum();
        stats.put("totalViews", totalViews);

        return stats;
    }

    /**
     * 获取热门文章排行
     */
    public List<ArticleDTO> getHotArticles(int limit) {
        return articleRepository.findByStatusOrderByViewCountDesc("PUBLISHED",
                        org.springframework.data.domain.PageRequest.of(0, limit))
                .stream()
                .map(this::toArticleDTO)
                .toList();
    }

    /**
     * 获取用户列表
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .avatar(u.getAvatar())
                        .role(u.getRole())
                        .status(u.getStatus())
                        .articleCount(u.getArticleCount())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();
    }

    private ArticleDTO toArticleDTO(com.bigshen.blog.model.Article article) {
        var author = article.getAuthor();
        ArticleDTO.ArticleDTOBuilder builder = ArticleDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .coverImage(article.getCoverImage())
                .authorId(author.getId())
                .authorName(author.getUsername())
                .status(article.getStatus())
                .viewCount(article.getViewCount())
                .likeCount(article.getLikeCount())
                .commentCount(article.getCommentCount())
                .createdAt(article.getCreatedAt());

        if (article.getCategory() != null) {
            builder.categoryId(article.getCategory().getId())
                    .categoryName(article.getCategory().getName());
        }

        return builder.build();
    }
}
