package com.financemanager.service.interfaces;

import com.financemanager.common.PageResult;
import com.financemanager.dto.request.CreateTransactionRequest;
import com.financemanager.dto.request.TransactionQueryRequest;
import com.financemanager.dto.request.UpdateTransactionRequest;
import com.financemanager.entity.Transaction;
import com.financemanager.mapper.TransactionMapper;

import java.time.LocalDate;
import java.util.List;

/**
 * 交易服务接口
 */
public interface TransactionService {

    /**
     * 获取交易详情
     */
    Transaction getById(Long userId, Long id);

    /**
     * 分页查询交易列表
     */
    PageResult<Transaction> queryTransactions(Long userId, TransactionQueryRequest request);

    /**
     * 创建交易
     */
    Transaction create(Long userId, CreateTransactionRequest request);

    /**
     * 更新交易
     */
    Transaction update(Long userId, UpdateTransactionRequest request);

    /**
     * 删除交易
     */
    void delete(Long userId, Long id);

    /**
     * 月度汇总统计
     */
    TransactionMapper.MonthlySummary getMonthlySummary(Long userId, LocalDate month);

    /**
     * 月度分类统计
     */
    List<TransactionMapper.CategorySummary> getMonthlyCategorySummary(Long userId, LocalDate month, String type);
}
