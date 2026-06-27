package com.financemanager.mapper;

import com.financemanager.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 主分类表 Mapper 接口
 */
@Mapper
public interface CategoryMapper {

    /**
     * 查询用户所有分类（包含系统内置分类）
     */
    List<Category> findAllByUser(@Param("userId") Long userId, @Param("type") String type);

    /**
     * 查询所有系统内置分类
     */
    List<Category> findAllSystemCategories();

    /**
     * 根据ID查询
     */
    Category findById(@Param("id") Long id);

    /**
     * 检查用户是否已存在相同编码的分类
     */
    int countByUserAndCode(@Param("userId") Long userId, @Param("code") String code);

    /**
     * 插入新分类
     */
    int insert(Category category);

    /**
     * 更新分类
     */
    int update(Category category);

    /**
     * 软删除分类
     */
    int deleteById(@Param("id") Long id);
}
