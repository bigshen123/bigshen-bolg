package com.bigshen.blog.repository;

import com.bigshen.blog.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 评论数据仓库
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByArticleIdAndParentIsNullAndStatusNotOrderByCreatedAtDesc(Long articleId, String status);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    List<Comment> findAllByOrderByCreatedAtDesc();
}
