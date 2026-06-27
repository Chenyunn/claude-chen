package com.financemanager.mapper;

import com.financemanager.entity.UserSettings;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户设置表 Mapper 接口
 */
@Mapper
public interface UserSettingsMapper {

    /**
     * 根据用户ID查询设置
     */
    UserSettings findByUserId(@Param("userId") Long userId);

    /**
     * 插入用户设置
     */
    int insert(UserSettings userSettings);

    /**
     * 更新用户设置
     */
    int update(UserSettings userSettings);
}
