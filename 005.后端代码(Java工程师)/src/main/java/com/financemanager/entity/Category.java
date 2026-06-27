package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 主分类表实体类
 */
@Data
public class Category {

    /**
     * 分类ID
     */
    private Long id;

    /**
     * 用户ID；NULL表示系统内置分类
     */
    private Long userId;

    /**
     * 分类编码
     */
    private String code;

    /**
     * 分类名称
     */
    private String name;

    /**
     * 分类图标
     */
    private String icon;

    /**
     * 展示颜色
     */
    private String color;

    /**
     * 分类类型：expense/income/both
     */
    private String type;

    /**
     * 排序值
     */
    private Integer sortOrder;

    /**
     * 是否系统内置
     */
    private Boolean isSystem;

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

    /**
     * 软删除时间
     */
    private LocalDateTime deletedAt;
}
