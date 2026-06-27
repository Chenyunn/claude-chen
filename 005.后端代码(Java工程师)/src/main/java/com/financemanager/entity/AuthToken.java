package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 登录Token表实体类
 */
@Data
public class AuthToken {

    /**
     * Token ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * Token 的 SHA-256 哈希值
     */
    private String tokenHash;

    /**
     * Token 类型
     */
    private String tokenType;

    /**
     * 是否7天免登录
     */
    private Boolean rememberMe;

    /**
     * 签发时间
     */
    private LocalDateTime issuedAt;

    /**
     * 过期时间
     */
    private LocalDateTime expiresAt;

    /**
     * 撤销时间
     */
    private LocalDateTime revokedAt;

    /**
     * 最近使用时间
     */
    private LocalDateTime lastUsedAt;

    /**
     * 创建时IP
     */
    private String createdIp;

    /**
     * 客户端User-Agent
     */
    private String userAgent;
}
