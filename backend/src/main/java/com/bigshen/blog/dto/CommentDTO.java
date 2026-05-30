package com.bigshen.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 评论DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {
    private Long id;
    private String content;
    private Long articleId;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long parentId;
    @Builder.Default
    private List<CommentDTO> repliesDTO = List.of();
    private LocalDateTime createdAt;
}
