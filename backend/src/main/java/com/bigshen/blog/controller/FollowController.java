package com.bigshen.blog.controller;

import com.bigshen.blog.dto.FollowDTO;
import com.bigshen.blog.repository.UserRepository;
import com.bigshen.blog.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 关注控制器
 */
@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;
    private final UserRepository userRepository;

    /**
     * 关注/取关用户（toggle 模式）
     */
    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> toggleFollow(
            @PathVariable Long userId,
            Authentication authentication) {
        String username = authentication.getName();
        Long currentUserId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"))
                .getId();
        FollowDTO result = followService.toggleFollow(currentUserId, userId);
        boolean isFollowing = result.getId() != null;
        return ResponseEntity.ok(Map.of(
                "isFollowing", isFollowing,
                "followingName", result.getFollowingName() != null ? result.getFollowingName() : ""
        ));
    }

    /**
     * 检查是否已关注
     */
    @GetMapping("/{userId}/status")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @PathVariable Long userId,
            Authentication authentication) {
        String username = authentication.getName();
        Long currentUserId = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"))
                .getId();
        boolean isFollowing = followService.isFollowing(currentUserId, userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    /**
     * 某用户的关注列表
     */
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<FollowDTO>> getFollowing(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(followService.getFollowing(userId, page, size));
    }

    /**
     * 某用户的粉丝列表
     */
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<FollowDTO>> getFollowers(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(followService.getFollowers(userId, page, size));
    }
}
