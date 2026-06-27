package com.financemanager.mapper;

import com.financemanager.entity.CategorySubcategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 子分类表 Mapper 接口
 */
@Mapper
public interface CategorySubcategoryMapper {

    /**
     * 根据主分类ID查询所有子分类
     */
    List<CategorySubcategory> findByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * 根据ID查询
     */
    CategorySubcategory findById(@Param("id") Long id);

    /**
     * 检查分类下是否已存在相同编码
     */
    int countByCategoryAndCode(@Param("categoryId") Long categoryId, @Param("code") String code);

    /**
     * 插入子分类
     */
    int insert(CategorySubcategory subcategory);

    /**
     * 更新子分类
     */
    int update(CategorySubcategory subcategory);

    /**
     * 软删除子分类
     */
    int deleteById(@Param("id") Long id);
}
