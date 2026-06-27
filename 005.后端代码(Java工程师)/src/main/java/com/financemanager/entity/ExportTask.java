package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 数据导出任务表实体类
 */
@Data
public class ExportTask {

    /**
     * 导出任务ID
     */
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 导出类型
     */
    private String exportType;

    /**
     * 文件格式
     */
    private String fileFormat;

    /**
     * 任务状态：pending/processing/success/failed/expired
     */
    private String status;

    /**
     * 导出开始日期
     */
    private LocalDate dateFrom;

    /**
     * 导出结束日期
     */
    private LocalDate dateTo;

    /**
     * 文件名
     */
    private String fileName;

    /**
     * 文件地址
     */
    private String fileUrl;

    /**
     * 失败原因
     */
    private String errorMessage;

    /**
     * 请求时间
     */
    private LocalDateTime requestedAt;

    /**
     * 完成时间
     */
    private LocalDateTime completedAt;

    /**
     * 文件过期时间
     */
    private LocalDateTime expiresAt;

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
