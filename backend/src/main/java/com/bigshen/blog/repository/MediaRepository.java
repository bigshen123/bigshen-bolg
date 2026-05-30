package com.bigshen.blog.repository;

import com.bigshen.blog.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 媒体资源数据仓库
 */
@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByArticleId(Long articleId);
}
