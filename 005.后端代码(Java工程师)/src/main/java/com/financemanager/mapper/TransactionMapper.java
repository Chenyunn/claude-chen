package com.financemanager.mapper;

import com.financemanager.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 核心账目流水表 Mapper 接口
 */
@Mapper
public interface TransactionMapper {

    /**
     * 根据ID查询
     */
    Transaction findById(@Param("id") Long id);

    /**
     * 根据用户ID和ID查询
     */
    Transaction findByUserAndId(@Param("userId") Long userId, @Param("id") Long id);

    /**
     * 分页查询用户交易
     */
    List<Transaction> findByUserPage(@Param("userId") Long userId,
                                     @Param("type") String type,
                                     @Param("categoryId") Long categoryId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate,
                                     @Param("offset") int offset,
                                     @Param("limit") int limit);

    /**
     * 统计用户交易总数
     */
    long countByUser(@Param("userId") Long userId,
                     @Param("type") String type,
                     @Param("categoryId") Long categoryId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

    /**
     * 查询指定日期范围内的交易
     */
    List<Transaction> findByUserAndDateRange(@Param("userId") Long userId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    /**
     * 插入交易
     */
    int insert(Transaction transaction);

    /**
     * 更新交易
     */
    int update(Transaction transaction);

    /**
     * 软删除交易
     */
    int deleteByUserAndId(@Param("userId") Long userId, @Param("id") Long id);

    /**
     * 按月统计用户收支
     */
    MonthlySummary getMonthlySummary(@Param("userId") Long userId,
                                     @Param("monthStart") LocalDate monthStart);

    /**
     * 按月分类统计
     */
    List<CategorySummary> getMonthlyCategorySummary(@Param("userId") Long userId,
                                                      @Param("monthStart") LocalDate monthStart,
                                                      @Param("type") String type);

    /**
     * 月度统计DTO
     */
    interface MonthlySummary {
        BigDecimal getExpenseAmount();
        BigDecimal getIncomeAmount();
        int getTransactionCount();
    }

    /**
     * 分类统计DTO
     */
    interface CategorySummary {
        Long getCategoryId();
        String getCategoryCode();
        String getCategoryName();
        String getCategoryIcon();
        String getCategoryColor();
        String getType();
        BigDecimal getTotalAmount();
        int getTransactionCount();
        BigDecimal getAvgAmount();
    }
}
