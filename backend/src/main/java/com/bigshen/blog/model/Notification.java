package com.bigshen.blog.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 站内通知实体
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 接收通知的用户ID */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** 通知类型: LIKE / REPLY */
    @Column(nullable = false, length = 20)
    private String type;

    /** 通知文本 */
    @Column(nullable = false, length = 500)
    private String message;

    /** 关联文章ID（点击跳转用） */
    @Column(name = "related_id")
    private Long relatedId;

    /** 是否已读 */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
