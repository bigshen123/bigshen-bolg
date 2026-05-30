package com.bigshen.blog.service;

import com.bigshen.blog.config.JwtUtil;
import com.bigshen.blog.dto.*;
import com.bigshen.blog.model.User;
import com.bigshen.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 用户服务
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 用户注册
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .avatar("🐻")
                .themeColor("#FF6B8B")
                .bio("热爱旅行的旅行者")
                .articleCount(0)
                .followerCount(0)
                .followingCount(0)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .user(toDTO(user))
                .build();
    }

    /**
     * 用户登录
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .user(toDTO(user))
                .build();
    }

    /**
     * 获取用户信息
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return toDTO(user);
    }

    /**
     * 根据用户名获取用户
     */
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return toDTO(user);
    }

    /**
     * 更新用户资料
     */
    public UserDTO updateProfile(Long userId, UserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }
        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }
        if (dto.getThemeColor() != null) {
            user.setThemeColor(dto.getThemeColor());
        }

        user = userRepository.save(user);
        return toDTO(user);
    }

    /**
     * 转换为DTO
     */
    public UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .themeColor(user.getThemeColor())
                .bio(user.getBio())
                .articleCount(user.getArticleCount())
                .followerCount(user.getFollowerCount())
                .followingCount(user.getFollowingCount())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
