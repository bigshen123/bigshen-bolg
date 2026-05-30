package com.bigshen.blog.repository;

import com.bigshen.blog.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 文章数据仓库
 */
@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {

    Page<Article> findByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT a FROM Article a WHERE :tag MEMBER OF a.tags ORDER BY a.createdAt DESC")
    Page<Article> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.title LIKE %:keyword% OR a.content LIKE %:keyword% ORDER BY a.createdAt DESC")
    Page<Article> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    Page<Article> findByLocationContaining(String location, Pageable pageable);
}
