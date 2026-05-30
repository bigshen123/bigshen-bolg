package com.bigshen.blog.service;

import com.bigshen.blog.dto.FollowDTO;
import com.bigshen.blog.dto.UserDTO;
import com.bigshen.blog.model.Follow;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.FollowRepository;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 关注/取关服务
 */
@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    /**
     * 关注用户（toggle 模式：已关注则取关，未关注则关注）
     */
    @Transactional
    public FollowDTO toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("不能关注自己");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("目标用户不存在"));

        boolean exists = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        if (exists) {
            // 取消关注
            followRepository.deleteByFollowerIdAndFollowingId(followerId, followingId);
            // 更新计数
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
            following.setFollowerCount(Math.max(0, following.getFollowerCount() - 1));
            userRepository.save(follower);
            userRepository.save(following);
            return FollowDTO.builder()
                    .followerId(followerId)
                    .followingId(followingId)
                    .build();
        } else {
            // 关注
            Follow follow = Follow.builder()
                    .followerId(followerId)
                    .followingId(followingId)
                    .build();
            follow = followRepository.save(follow);
            // 更新计数
            follower.setFollowingCount(follower.getFollowingCount() + 1);
            following.setFollowerCount(following.getFollowerCount() + 1);
            userRepository.save(follower);
            userRepository.save(following);

            return FollowDTO.builder()
                    .id(follow.getId())
                    .followerId(followerId)
                    .followerName(follower.getUsername())
                    .followerAvatar(follower.getAvatar())
                    .followingId(followingId)
                    .followingName(following.getUsername())
                    .followingAvatar(following.getAvatar())
                    .createdAt(follow.getCreatedAt())
                    .build();
        }
    }

    /**
     * 检查是否已关注
     */
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    /**
     * 获取用户关注列表
     */
    public Page<FollowDTO> getFollowing(Long userId, int page, int size) {
        Page<Follow> follows = followRepository.findByFollowerIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size));
        return follows.map(this::toDTO);
    }

    /**
     * 获取用户粉丝列表
     */
    public Page<FollowDTO> getFollowers(Long userId, int page, int size) {
        Page<Follow> follows = followRepository.findByFollowingIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, size));
        return follows.map(this::toDTO);
    }

    /**
     * 转换为 DTO
     */
    private FollowDTO toDTO(Follow follow) {
        User follower = userRepository.findById(follow.getFollowerId()).orElse(null);
        User following = userRepository.findById(follow.getFollowingId()).orElse(null);
        return FollowDTO.builder()
                .id(follow.getId())
                .followerId(follow.getFollowerId())
                .followerName(follower != null ? follower.getUsername() : "未知用户")
                .followerAvatar(follower != null ? follower.getAvatar() : null)
                .followingId(follow.getFollowingId())
                .followingName(following != null ? following.getUsername() : "未知用户")
                .followingAvatar(following != null ? following.getAvatar() : null)
                .createdAt(follow.getCreatedAt())
                .build();
    }
}
