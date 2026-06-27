package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户支付账户表实体类
 */
@Data
public class PaymentAccount {

    /**
     * 支付账户ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 支付账户类型ID
     */
    private Integer accountTypeId;

    /**
     * 账户展示名称
     */
    private String name;

    /**
     * 脱敏标识，如银行卡尾号8888
     */
    private String maskedIdentifier;

    /**
     * 是否默认账户
     */
    private Boolean isDefault;

    /**
     * 是否启用
     */
    private Boolean isActive;

    /**
     * 排序值
     */
    private Integer sortOrder;

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
