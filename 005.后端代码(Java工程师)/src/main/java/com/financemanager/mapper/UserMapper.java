package com.financemanager.mapper;

import com.financemanager.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户表 Mapper 接口
 */
@Mapper
public interface UserMapper {

    /**
     * 根据用户名查询用户
     */
    User findByUsername(@Param("username") String username);

    /**
     * 根据ID查询用户
     */
    User findById(@Param("id") Long id);

    /**
     * 插入新用户
     */
    int insert(User user);

    /**
     * 更新用户信息
     */
    int update(User user);

    /**
     * 更新登录信息
     */
    int updateLoginInfo(@Param("id") Long id, @Param("lastLoginAt") java.time.LocalDateTime lastLoginAt);

    /**
     * 更新锁定状态
     */
    int updateLocked(@Param("id") Long id, @Param("failedLoginCount") Integer failedLoginCount,
                      @Param("lockedUntil") java.time.LocalDateTime lockedUntil);
}