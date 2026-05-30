package com.bigshen.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * 用户信息DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String avatar;
    private String themeColor;
    private String bio;
    private String role;
    private String status;
    private Integer articleCount;
    private Integer followerCount;
    private Integer followingCount;
    private LocalDateTime createdAt;
}
