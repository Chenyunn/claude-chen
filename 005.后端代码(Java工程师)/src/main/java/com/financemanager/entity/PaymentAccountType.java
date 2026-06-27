package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 支付账户类型字典表实体类
 */
@Data
public class PaymentAccountType {

    /**
     * 支付账户类型ID
     */
    private Integer id;

    /**
     * 类型编码
     */
    private String code;

    /**
     * 类型名称
     */
    private String name;

    /**
     * 类型图标
     */
    private String icon;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 是否启用
     */
    private Boolean isActive;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
