package com.bigshen.blog.controller;

import com.bigshen.blog.dto.ChangePasswordRequest;
import com.bigshen.blog.dto.UserDTO;
import com.bigshen.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 获取所有用户列表（管理员）
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * 更新用户资料
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateProfile(@PathVariable Long id, @RequestBody UserDTO dto) {
        UserDTO updated = userService.updateProfile(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * 更新用户状态（管理员）
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<UserDTO> updateStatus(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateUserStatus(id, body.get("status")));
    }

    /**
     * 更新用户角色（管理员）
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<UserDTO> updateRole(@PathVariable Long id,
                                               @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateUserRole(id, body.get("role")));
    }

    /**
     * 修改密码
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id,
                                                               @RequestBody ChangePasswordRequest request) {
        userService.changePassword(id, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "密码修改成功"));
    }
}
