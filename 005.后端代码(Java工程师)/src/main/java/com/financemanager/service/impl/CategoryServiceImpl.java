package com.financemanager.service.impl;

import com.financemanager.dto.request.CreateCategoryRequest;
import com.financemanager.entity.Category;
import com.financemanager.entity.CategorySubcategory;
import com.financemanager.exception.BusinessException;
import com.financemanager.exception.ErrorCode;
import com.financemanager.mapper.CategoryMapper;
import com.financemanager.mapper.CategorySubcategoryMapper;
import com.financemanager.service.interfaces.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 分类服务实现类
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final CategorySubcategoryMapper subcategoryMapper;

    public CategoryServiceImpl(CategoryMapper categoryMapper,
                                CategorySubcategoryMapper subcategoryMapper) {
        this.categoryMapper = categoryMapper;
        this.subcategoryMapper = subcategoryMapper;
    }

    @Override
    public List<Category> getAllCategories(Long userId, String type) {
        return categoryMapper.findAllByUser(userId, type);
    }

    @Override
    public List<CategorySubcategory> getSubcategories(Long categoryId) {
        return subcategoryMapper.findByCategoryId(categoryId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Category createCategory(Long userId, CreateCategoryRequest request) {
        // 检查编码是否重复
        int count = categoryMapper.countByUserAndCode(userId, request.getCode());
        if (count > 0) {
            throw new BusinessException(400, "该分类编码已存在");
        }

        Category category = new Category();
        category.setUserId(userId);
        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        category.setIsSystem(false);
        category.setIsActive(true);

        categoryMapper.insert(category);
        return category;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Category updateCategory(Long userId, Long categoryId, CreateCategoryRequest request) {
        Category category = categoryMapper.findById(categoryId);
        if (category == null || category.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        // 检查是否用户自己的分类
        if (!userId.equals(category.getUserId())) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        // 检查编码是否重复（排除自己）
        if (!request.getCode().equals(category.getCode())) {
            int count = categoryMapper.countByUserAndCode(userId, request.getCode());
            if (count > 0) {
                throw new BusinessException(400, "该分类编码已存在");
            }
        }

        category.setCode(request.getCode());
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());
        if (request.getSortOrder() != null) {
            category.setSortOrder(request.getSortOrder());
        }

        categoryMapper.update(category);
        return categoryMapper.findById(categoryId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryMapper.findById(categoryId);
        if (category == null || category.getDeletedAt() != null) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        if (!userId.equals(category.getUserId())) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        if (category.getIsSystem()) {
            throw new BusinessException(400, "系统内置分类不能删除");
        }

        categoryMapper.deleteById(categoryId);
    }
}
