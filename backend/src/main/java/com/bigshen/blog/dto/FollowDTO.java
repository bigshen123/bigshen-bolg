package com.bigshen.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 关注关系 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowDTO {
    private Long id;
    private Long followerId;
    private String followerName;
    private String followerAvatar;
    private Long followingId;
    private String followingName;
    private String followingAvatar;
    private LocalDateTime createdAt;
}
