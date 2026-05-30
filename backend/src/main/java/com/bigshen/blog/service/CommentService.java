package com.bigshen.blog.service;

import com.bigshen.blog.dto.CommentDTO;
import com.bigshen.blog.model.Article;
import com.bigshen.blog.model.Comment;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.ArticleRepository;
import com.bigshen.blog.repository.CommentRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 评论服务
 */
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    /**
     * 获取文章评论列表(排除已删除)
     */
    public List<CommentDTO> getCommentsByArticleId(Long articleId) {
        return commentRepository.findByArticleIdAndParentIsNullAndStatusNotOrderByCreatedAtDesc(articleId, "DELETED")
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 获取所有评论（管理员）
     */
    public List<CommentDTO> getAllComments() {
        return commentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * 软删除评论
     */
    public void softDeleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        comment.setStatus("DELETED");
        commentRepository.save(comment);
    }

    /**
     * 添加评论
     */
    @Transactional
    public CommentDTO addComment(Long articleId, String content, String username) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Comment comment = Comment.builder()
                .content(content)
                .article(article)
                .user(user)
                .build();

        comment = commentRepository.save(comment);

        // 更新文章评论数
        article.setCommentCount(article.getCommentCount() + 1);
        articleRepository.save(article);

        return toDTO(comment);
    }

    /**
     * 回复评论
     */
    @Transactional
    public CommentDTO replyToComment(Long commentId, String content, String username) {
        Comment parent = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Comment reply = Comment.builder()
                .content(content)
                .article(parent.getArticle())
                .user(user)
                .parent(parent)
                .build();

        reply = commentRepository.save(reply);

        // 更新文章评论数
        Article article = parent.getArticle();
        article.setCommentCount(article.getCommentCount() + 1);
        articleRepository.save(article);

        return toDTO(reply);
    }

    /**
     * 转换为DTO
     */
    private CommentDTO toDTO(Comment comment) {
        List<CommentDTO> replyDTOs = comment.getReplies() != null
                ? comment.getReplies().stream().map(this::toDTO).collect(Collectors.toList())
                : List.of();

        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .articleId(comment.getArticle().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .userAvatar(comment.getUser().getAvatar())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .status(comment.getStatus())
                .replies(replyDTOs)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
