package com.financemanager.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 核心账目流水表实体类
 */
@Data
public class Transaction {

    /**
     * 交易ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 收支类型：expense/income
     */
    private String type;

    /**
     * 金额，始终存正数
     */
    private BigDecimal amount;

    /**
     * 主分类ID
     */
    private Long categoryId;

    /**
     * 子分类ID
     */
    private Long subcategoryId;

    /**
     * 支付账户ID
     */
    private Long paymentAccountId;

    /**
     * 交易日期
     */
    private LocalDate transactionDate;

    /**
     * 交易时间
     */
    private LocalTime transactionTime;

    /**
     * 交易发生时间
     */
    private LocalDateTime occurredAt;

    /**
     * 商户名称
     */
    private String merchant;

    /**
     * 交易标题
     */
    private String title;

    /**
     * 备注
     */
    private String note;

    /**
     * 来源：manual/import/sync等
     */
    private String source;

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
