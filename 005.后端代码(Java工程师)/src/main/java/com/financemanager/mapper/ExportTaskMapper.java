package com.financemanager.mapper;

import com.financemanager.entity.ExportTask;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 数据导出任务表 Mapper 接口
 */
@Mapper
public interface ExportTaskMapper {

    /**
     * 根据ID查询
     */
    ExportTask findById(@Param("id") Long id);

    /**
     * 查询用户的导出任务列表
     */
    List<ExportTask> findByUser(@Param("userId") Long userId);

    /**
     * 插入导出任务
     */
    int insert(ExportTask task);

    /**
     * 更新导出任务状态
     */
    int updateStatus(@Param("id") Long id, @Param("status") String status,
                     @Param("fileName") String fileName, @Param("fileUrl") String fileUrl,
                     @Param("errorMessage") String errorMessage);

    /**
     * 标记过期任务
     */
    int expireTasks(@Param("expiresBefore") java.time.LocalDateTime expiresBefore);
}
