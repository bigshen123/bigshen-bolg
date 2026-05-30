package com.bigshen.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 点赞/取消点赞响应 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeResponse {
    /** 当前文章点赞数 */
    private Integer likeCount;
    /** 当前用户是否已点赞 */
    private Boolean isLiked;
}
