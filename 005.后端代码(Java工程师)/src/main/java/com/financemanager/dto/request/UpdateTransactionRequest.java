package com.financemanager.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 更新交易请求DTO
 */
@Data
public class UpdateTransactionRequest {

    @NotNull(message = "交易ID不能为空")
    private Long id;

    @NotNull(message = "交易类型不能为空")
    private String type;

    @NotNull(message = "金额不能为空")
    @Positive(message = "金额必须大于0")
    private BigDecimal amount;

    @NotNull(message = "分类不能为空")
    private Long categoryId;

    private Long subcategoryId;
    private Long paymentAccountId;
    private LocalDate transactionDate;
    private LocalTime transactionTime;
    private String merchant;
    private String title;
    private String note;
}
