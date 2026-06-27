package com.financemanager.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 子分类表实体类
 */
@Data
public class CategorySubcategory {

    /**
     * 子分类ID
     */
    private Long id;

    /**
     * 主分类ID
     */
    private Long categoryId;

    /**
     * 子分类编码
     */
    private String code;

    /**
     * 子分类名称
     */
    private String name;

    /**
     * 子分类图标
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

    /**
     * 软删除时间
     */
    private LocalDateTime deletedAt;
}
