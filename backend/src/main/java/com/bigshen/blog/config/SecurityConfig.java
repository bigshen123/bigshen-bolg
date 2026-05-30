package com.bigshen.blog.config;

import com.bigshen.blog.config.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security安全配置类
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {})
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 认证接口公开
                .requestMatchers("/api/auth/**").permitAll()
                // 文章列表/搜索/热门/详情（仅GET公开）
                .requestMatchers("GET", "/api/articles", "/api/articles/search",
                        "/api/articles/hot", "/api/articles/*").permitAll()
                // 评论查看公开
                .requestMatchers("GET", "/api/comments/article/**").permitAll()
                // 分类查看公开，增删改需要管理员
                .requestMatchers("GET", "/api/categories", "/api/categories/**").permitAll()
                .requestMatchers("POST", "/api/categories/**").hasRole("ADMIN")
                .requestMatchers("PUT", "/api/categories/**").hasRole("ADMIN")
                .requestMatchers("DELETE", "/api/categories/**").hasRole("ADMIN")
                // 媒体文件查看公开，上传和删除需要认证
                .requestMatchers("GET", "/api/media/**").permitAll()
                .requestMatchers("POST", "/api/media/**").authenticated()
                .requestMatchers("DELETE", "/api/media/**").authenticated()
                // 静态文件（上传的图片等）公开访问
                .requestMatchers("/uploads/**").permitAll()
                // H2控制台
                .requestMatchers("/h2-console/**").permitAll()
                // 管理员接口
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 收藏接口需要认证
                .requestMatchers("/api/favorites/**").authenticated()
                // 关注接口需要认证
                .requestMatchers("/api/follow/**").authenticated()
                // 通知接口需要认证
                .requestMatchers("/api/notifications/**").authenticated()
                // 点赞检查需要认证
                .requestMatchers("GET", "/api/articles/*/liked").authenticated()
                // 其他所有接口需要认证
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
