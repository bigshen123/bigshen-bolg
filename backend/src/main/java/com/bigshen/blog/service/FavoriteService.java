package com.bigshen.blog.service;

import com.bigshen.blog.dto.ArticleDTO;
import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Favorite;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.FavoriteRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 收藏服务
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    /**
     * 收藏文章
     */
    @Transactional
    public void addFavorite(Long userId, Long articleId) {
        if (favoriteRepository.existsByUserIdAndArticleId(userId, articleId)) {
            return; // 已收藏，幂等操作
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("文章不存在"));

        Favorite favorite = Favorite.builder()
                .user(user)
                .article(article)
                .build();
        favoriteRepository.save(favorite);
    }

    /**
     * 取消收藏
     */
    @Transactional
    public void removeFavorite(Long userId, Long articleId) {
        favoriteRepository.findByUserIdAndArticleId(userId, articleId)
                .ifPresent(favoriteRepository::delete);
    }

    /**
     * 检查是否已收藏
     */
    public boolean isFavorited(Long userId, Long articleId) {
        return favoriteRepository.existsByUserIdAndArticleId(userId, articleId);
    }

    /**
     * 获取用户收藏列表
     */
    public Page<ArticleDTO> getUserFavorites(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(f -> toArticleDTO(f.getArticle()));
    }

    /**
     * 获取文章收藏数
     */
    public long getFavoriteCount(Long articleId) {
        return favoriteRepository.countByArticleId(articleId);
    }

    /**
     * Article转DTO
     */
    private ArticleDTO toArticleDTO(Article article) {
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
