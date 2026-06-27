package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户设置表实体类
 */
@Data
public class UserSettings {

    /**
     * 设置ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 币种代码
     */
    private String currencyCode;

    /**
     * 币种符号
     */
    private String currencySymbol;

    /**
     * 是否开启消息提醒
     */
    private Boolean notificationEnabled;

    /**
     * 是否开启深色模式
     */
    private Boolean darkModeEnabled;

    /**
     * 是否开启指纹/面容解锁
     */
    private Boolean biometricEnabled;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
