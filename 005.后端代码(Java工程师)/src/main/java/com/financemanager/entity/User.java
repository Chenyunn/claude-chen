package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户账号表实体类
 */
@Data
public class User {

    /**
     * 用户ID
     */
    private Long id;

    /**
     * 用户名，6-20位字母或数字
     */
    private String username;

    /**
     * 密码哈希，不保存明文密码
     */
    private String passwordHash;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像地址
     */
    private String avatarUrl;

    /**
     * 个性签名
     */
    private String signature;

    /**
     * 状态：1正常，2锁定，9禁用/注销
     */
    private Integer status;

    /**
     * 连续登录失败次数
     */
    private Integer failedLoginCount;

    /**
     * 锁定截止时间
     */
    private LocalDateTime lockedUntil;

    /**
     * 最近登录时间
     */
    private LocalDateTime lastLoginAt;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 软删除时间
     */
    private LocalDateTime deletedAt;
}
