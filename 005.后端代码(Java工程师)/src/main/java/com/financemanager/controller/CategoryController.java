package com.financemanager.controller;

import com.financemanager.common.Result;
import com.financemanager.dto.request.CreateCategoryRequest;
import com.financemanager.entity.Category;
import com.financemanager.entity.CategorySubcategory;
import com.financemanager.security.CurrentUser;
import com.financemanager.entity.User;
import com.financemanager.service.interfaces.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器
 */
@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * 获取分类列表
     */
    @GetMapping
    public Result<List<Category>> list(@CurrentUser User currentUser,
                                       @RequestParam(required = false) String type) {
        List<Category> categories = categoryService.getAllCategories(currentUser.getId(), type);
        return Result.success(categories);
    }

    /**
     * 获取子分类列表
     */
    @GetMapping("/{categoryId}/subcategories")
    public Result<List<CategorySubcategory>> getSubcategories(@PathVariable Long categoryId) {
        List<CategorySubcategory> subcategories = categoryService.getSubcategories(categoryId);
        return Result.success(subcategories);
    }

    /**
     * 创建自定义分类
     */
    @PostMapping
    public Result<Category> create(@CurrentUser User currentUser,
                                   @Valid @RequestBody CreateCategoryRequest request) {
        Category category = categoryService.createCategory(currentUser.getId(), request);
        return Result.success(category);
    }

    /**
     * 更新分类
     */
    @PatchMapping("/{categoryId}")
    public Result<Void> update(@CurrentUser User currentUser,
                               @PathVariable Long categoryId,
                               @Valid @RequestBody CreateCategoryRequest request) {
        categoryService.updateCategory(currentUser.getId(), categoryId, request);
        return Result.success("修改成功", null);
    }

    /**
     * 删除分类
     */
    @DeleteMapping("/{categoryId}")
    public Result<Void> delete(@CurrentUser User currentUser, @PathVariable Long categoryId) {
        categoryService.deleteCategory(currentUser.getId(), categoryId);
        return Result.success();
    }
}
