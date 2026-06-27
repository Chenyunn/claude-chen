package com.financemanager.service.interfaces;

import com.financemanager.dto.request.CreateCategoryRequest;
import com.financemanager.entity.Category;
import com.financemanager.entity.CategorySubcategory;

import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService {

    /**
     * 获取用户所有分类（包含系统内置分类）
     */
    List<Category> getAllCategories(Long userId, String type);

    /**
     * 获取分类下的所有子分类
     */
    List<CategorySubcategory> getSubcategories(Long categoryId);

    /**
     * 创建自定义分类
     */
    Category createCategory(Long userId, CreateCategoryRequest request);

    /**
     * 更新分类
     */
    Category updateCategory(Long userId, Long categoryId, CreateCategoryRequest request);

    /**
     * 删除分类
     */
    void deleteCategory(Long userId, Long categoryId);
}
