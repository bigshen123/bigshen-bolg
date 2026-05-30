package com.bigshen.blog.repository;

import com.bigshen.blog.model.Follow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 关注 Repository
 */
@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    /** 查询关注关系是否存在 */
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** 是否已关注 */
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** 取消关注 */
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** 某用户的粉丝数 */
    long countByFollowingId(Long followingId);

    /** 某用户关注的人数 */
    long countByFollowerId(Long followerId);

    /** 某用户的粉丝列表 */
    Page<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId, Pageable pageable);

    /** 某用户关注的人列表 */
    Page<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId, Pageable pageable);
}
