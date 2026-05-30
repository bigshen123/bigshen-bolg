package com.bigshen.blog.dto;

import lombok.Data;

/**
 * 修改密码请求 DTO
 */
@Data
public class ChangePasswordRequest {
    private String oldPassword;
    private String newPassword;
}
