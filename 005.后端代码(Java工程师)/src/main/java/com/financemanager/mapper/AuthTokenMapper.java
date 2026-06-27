package com.financemanager.mapper;

import com.financemanager.entity.AuthToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

/**
 * 登录Token表 Mapper 接口
 */
@Mapper
public interface AuthTokenMapper {

    /**
     * 根据token哈希查询
     */
    AuthToken findByTokenHash(@Param("tokenHash") String tokenHash);

    /**
     * 根据用户ID和token哈希查询有效的token
     */
    AuthToken findValidToken(@Param("userId") Long userId, @Param("tokenHash") String tokenHash,
                              @Param("now") LocalDateTime now);

    /**
     * 插入新token
     */
    int insert(AuthToken authToken);

    /**
     * 撤销token
     */
    int revokeToken(@Param("id") Long id, @Param("revokedAt") LocalDateTime revokedAt);

    /**
     * 更新最近使用时间
     */
    int updateLastUsedAt(@Param("id") Long id, @Param("lastUsedAt") LocalDateTime lastUsedAt);

    /**
     * 清理过期token
     */
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}
