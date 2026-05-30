package com.bigshen.blog.controller;

import com.bigshen.blog.dto.CommentDTO;
import com.bigshen.blog.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评论控制器
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /**
     * 获取文章评论
     */
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long articleId) {
        List<CommentDTO> comments = commentService.getCommentsByArticleId(articleId);
        return ResponseEntity.ok(comments);
    }

    /**
     * 添加评论
     */
    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@RequestBody Map<String, Object> body,
                                                   Authentication authentication) {
        Long articleId = Long.valueOf(body.get("articleId").toString());
        String content = body.get("content").toString();
        CommentDTO comment = commentService.addComment(articleId, content, authentication.getName());
        return ResponseEntity.ok(comment);
    }

    /**
     * 回复评论
     */
    @PostMapping("/{commentId}/reply")
    public ResponseEntity<CommentDTO> replyToComment(@PathVariable Long commentId,
                                                       @RequestBody Map<String, String> body,
                                                       Authentication authentication) {
        CommentDTO reply = commentService.replyToComment(commentId, body.get("content"), authentication.getName());
        return ResponseEntity.ok(reply);
    }

    /**
     * 删除评论（软删除，管理员）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.softDeleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
