package com.financemanager.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 创建交易请求DTO
 */
@Data
public class CreateTransactionRequest {

    @NotNull(message = "交易类型不能为空")
    private String type;

    @NotNull(message = "金额不能为空")
    @Positive(message = "金额必须大于0")
    private BigDecimal amount;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    private Long subcategoryId;

    private Long paymentAccountId;

    @NotNull(message = "交易日期不能为空")
    private LocalDate transactionDate;

    private LocalTime transactionTime;

    private String merchant;

    private String title;

    private String note;

    private String source = "manual";
}
