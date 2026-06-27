package com.financemanager.dto.request;

import lombok.Data;

import java.time.LocalDate;

/**
 * 交易查询请求DTO
 */
@Data
public class TransactionQueryRequest {

    /**
     * 交易类型 (expense/income)
     */
    private String type;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;

    /**
     * 页码，从1开始
     */
    private Integer page = 1;

    /**
     * 每页大小
     */
    private Integer pageSize = 20;

    public int getOffset() {
        return (page - 1) * pageSize;
    }
}
