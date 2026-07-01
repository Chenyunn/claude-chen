package com.financemanager.controller;

import com.financemanager.common.PageResult;
import com.financemanager.common.Result;
import com.financemanager.dto.request.CreateTransactionRequest;
import com.financemanager.dto.request.TransactionQueryRequest;
import com.financemanager.dto.request.UpdateTransactionRequest;
import com.financemanager.entity.Transaction;
import com.financemanager.entity.User;
import com.financemanager.mapper.TransactionMapper;
import com.financemanager.security.CurrentUser;
import com.financemanager.service.interfaces.TransactionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 交易流水控制器
 */
@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * 获取交易详情
     */
    @GetMapping("/{id}")
    public Result<Transaction> getDetail(@CurrentUser User currentUser, @PathVariable Long id) {
        Transaction transaction = transactionService.getById(currentUser.getId(), id);
        return Result.success(transaction);
    }

    /**
     * 分页查询交易列表
     */
    @GetMapping
    public Result<PageResult<Transaction>> list(@CurrentUser User currentUser,
                                                TransactionQueryRequest request) {
        PageResult<Transaction> pageResult = transactionService.queryTransactions(currentUser.getId(), request);
        return Result.success(pageResult);
    }

    /**
     * 创建交易
     */
    @PostMapping
    public Result<Transaction> create(@CurrentUser User currentUser,
                                      @Valid @RequestBody CreateTransactionRequest request) {
        Transaction transaction = transactionService.create(currentUser.getId(), request);
        return Result.success(transaction);
    }

    /**
     * 更新交易
     */
    @PutMapping("/{id}")
    public Result<Transaction> update(@CurrentUser User currentUser,
                                      @PathVariable Long id,
                                      @Valid @RequestBody UpdateTransactionRequest request) {
        request.setId(id);
        Transaction transaction = transactionService.update(currentUser.getId(), request);
        return Result.success(transaction);
    }

    /**
     * 删除交易
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@CurrentUser User currentUser, @PathVariable Long id) {
        transactionService.delete(currentUser.getId(), id);
        return Result.success();
    }

    /**
     * 获取最近交易
     */
    @GetMapping("/recent")
    public Result<List<Transaction>> getRecent(@CurrentUser User currentUser,
                                               @RequestParam(defaultValue = "5") int limit) {
        List<Transaction> transactions = transactionService.getRecentTransactions(currentUser.getId(), limit);
        return Result.success(transactions);
    }

    /**
     * 月度汇总统计
     */
    @GetMapping("/report/monthly")
    public Result<TransactionMapper.MonthlySummary> monthlySummary(@CurrentUser User currentUser,
                                                                     @RequestParam LocalDate month) {
        TransactionMapper.MonthlySummary summary = transactionService.getMonthlySummary(currentUser.getId(), month);
        return Result.success(summary);
    }

    /**
     * 月度分类统计
     */
    @GetMapping("/report/monthly-category")
    public Result<List<TransactionMapper.CategorySummary>> monthlyCategorySummary(
            @CurrentUser User currentUser,
            @RequestParam LocalDate month,
            @RequestParam(required = false) String type) {
        List<TransactionMapper.CategorySummary> summaries =
                transactionService.getMonthlyCategorySummary(currentUser.getId(), month, type);
        return Result.success(summaries);
    }
}
