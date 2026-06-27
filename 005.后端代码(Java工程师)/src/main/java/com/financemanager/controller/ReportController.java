package com.financemanager.controller;

import com.financemanager.common.Result;
import com.financemanager.entity.User;
import com.financemanager.mapper.TransactionMapper;
import com.financemanager.security.CurrentUser;
import com.financemanager.service.interfaces.TransactionService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 统计报表控制器
 */
@RestController
@RequestMapping("/report")
public class ReportController {

    private final TransactionService transactionService;

    public ReportController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * 月度汇总统计
     */
    @GetMapping("/monthly")
    public Result<TransactionMapper.MonthlySummary> getMonthlySummary(
            @CurrentUser User currentUser,
            @RequestParam LocalDate month) {
        TransactionMapper.MonthlySummary summary =
                transactionService.getMonthlySummary(currentUser.getId(), month);
        return Result.success(summary);
    }

    /**
     * 月度分类统计
     */
    @GetMapping("/monthly-category")
    public Result<List<TransactionMapper.CategorySummary>> getMonthlyCategorySummary(
            @CurrentUser User currentUser,
            @RequestParam LocalDate month,
            @RequestParam(required = false) String type) {
        List<TransactionMapper.CategorySummary> summaries =
                transactionService.getMonthlyCategorySummary(currentUser.getId(), month, type);
        return Result.success(summaries);
    }
}
