package com.bigshen.blog.repository;

import com.bigshen.blog.model.LikeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * 点赞记录 Repository
 */
@Repository
public interface LikeRecordRepository extends JpaRepository<LikeRecord, Long> {

    /** 查询用户是否点赞过某文章 */
    Optional<LikeRecord> findByUserIdAndArticleId(Long userId, Long articleId);

    /** 删除点赞记录 */
    void deleteByUserIdAndArticleId(Long userId, Long articleId);

    /** 某文章的点赞数 */
    long countByArticleId(Long articleId);
}
