package com.example.GinumApps.service;

import com.example.GinumApps.model.Quotation;
import com.example.GinumApps.model.QuotationLineItem;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(41, 128, 185); // Blue
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);

    public byte[] generateQuotationPdf(Quotation quotation) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Add header
            addHeader(document, quotation);

            // Add customer info
            addCustomerInfo(document, quotation);

            // Add line items table
            addLineItemsTable(document, quotation);

            // Add totals
            addTotals(document, quotation);

            // Add notes and terms
            addNotesAndTerms(document, quotation);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    private void addHeader(Document document, Quotation quotation) {
        // Company name
        Paragraph companyName = new Paragraph(quotation.getCompany().getCompanyName())
                .setFontSize(20)
                .setBold()
                .setFontColor(HEADER_COLOR);
        document.add(companyName);

        // Company address
        String address = String.format("%s, %s",
                quotation.getCompany().getCompanyRegisteredAddress(),
                quotation.getCompany().getCountry().getName());
        Paragraph companyAddress = new Paragraph(address)
                .setFontSize(10)
                .setMarginBottom(20);
        document.add(companyAddress);

        // Quotation title and number
        Paragraph title = new Paragraph("QUOTATION")
                .setFontSize(24)
                .setBold()
                .setFontColor(HEADER_COLOR)
                .setMarginBottom(5);
        document.add(title);

        Paragraph quotationNumber = new Paragraph(quotation.getQuotationNumber())
                .setFontSize(14)
                .setMarginBottom(20);
        document.add(quotationNumber);
    }

    private void addCustomerInfo(Document document, Quotation quotation) {
        // Create a table for customer info and dates
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        // Customer section
        Cell customerCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("BILL TO:").setBold().setFontSize(10))
                .add(new Paragraph(quotation.getCustomer().getName()).setFontSize(12).setBold())
                .add(new Paragraph(quotation.getCustomer().getEmail()).setFontSize(10))
                .add(new Paragraph(quotation.getCustomer().getPhoneNo()).setFontSize(10));

        // Dates section
        Cell datesCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("Issue Date: " + quotation.getIssueDate().format(DATE_FORMATTER)).setFontSize(10))
                .add(new Paragraph("Valid Until: " + quotation.getExpiryDate().format(DATE_FORMATTER)).setFontSize(10))
                .add(new Paragraph("Status: " + quotation.getStatus().name()).setFontSize(10).setBold());

        infoTable.addCell(customerCell);
        infoTable.addCell(datesCell);
        document.add(infoTable);
    }

    private void addLineItemsTable(Document document, Quotation quotation) {
        // Create table with 5 columns
        Table table = new Table(UnitValue.createPercentArray(new float[]{3f, 1f, 1.5f, 1f, 1.5f}))
                .useAllAvailableWidth()
                .setMarginBottom(10);

        // Add header row
        String[] headers = {"Description", "Qty", "Unit Price", "Discount", "Total"};
        for (String header : headers) {
            Cell headerCell = new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(10).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(HEADER_COLOR)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(8);
            table.addHeaderCell(headerCell);
        }

        // Add line items
        for (QuotationLineItem item : quotation.getLineItems()) {
            table.addCell(createCell(item.getDescription(), TextAlignment.LEFT));
            table.addCell(createCell(String.valueOf(item.getQuantity()), TextAlignment.CENTER));
            table.addCell(createCell(formatMoney(item.getUnitPrice()), TextAlignment.RIGHT));
            table.addCell(createCell(item.getDiscountPercent().toString() + "%", TextAlignment.CENTER));
            table.addCell(createCell(formatMoney(item.getTotalPrice()), TextAlignment.RIGHT));
        }

        document.add(table);
    }

    private void addTotals(Document document, Quotation quotation) {
        // Create a table for totals (aligned to the right)
        Table totalsTable = new Table(UnitValue.createPercentArray(new float[]{3f, 1f}))
                .setWidth(40)
                .setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT)
                .setMarginBottom(20);

        // Subtotal
        totalsTable.addCell(createTotalCell("Subtotal:", false));
        totalsTable.addCell(createTotalCell(formatMoney(quotation.getSubtotal()), false));

        // Tax
        if (quotation.getTaxPercent().compareTo(BigDecimal.ZERO) > 0) {
            String taxLabel = String.format("Tax (%s%%):", quotation.getTaxPercent());
            totalsTable.addCell(createTotalCell(taxLabel, false));
            totalsTable.addCell(createTotalCell(formatMoney(quotation.getTaxAmount()), false));
        }

        // Total (with background)
        Cell totalLabelCell = createTotalCell("TOTAL:", true);
        totalLabelCell.setBackgroundColor(LIGHT_GRAY);
        totalsTable.addCell(totalLabelCell);

        Cell totalAmountCell = createTotalCell(formatMoney(quotation.getTotal()), true);
        totalAmountCell.setBackgroundColor(LIGHT_GRAY);
        totalsTable.addCell(totalAmountCell);

        document.add(totalsTable);
    }

    private void addNotesAndTerms(Document document, Quotation quotation) {
        if (quotation.getNotes() != null && !quotation.getNotes().isEmpty()) {
            Paragraph notesTitle = new Paragraph("Notes:")
                    .setBold()
                    .setFontSize(12)
                    .setMarginTop(10);
            document.add(notesTitle);

            Paragraph notes = new Paragraph(quotation.getNotes())
                    .setFontSize(10)
                    .setMarginBottom(15);
            document.add(notes);
        }

        if (quotation.getTermsAndConditions() != null && !quotation.getTermsAndConditions().isEmpty()) {
            Paragraph termsTitle = new Paragraph("Terms & Conditions:")
                    .setBold()
                    .setFontSize(12)
                    .setMarginTop(10);
            document.add(termsTitle);

            Paragraph terms = new Paragraph(quotation.getTermsAndConditions())
                    .setFontSize(9)
                    .setItalic();
            document.add(terms);
        }
    }

    private Cell createCell(String content, TextAlignment alignment) {
        return new Cell()
                .add(new Paragraph(content).setFontSize(10))
                .setTextAlignment(alignment)
                .setPadding(5)
                .setBorder(Border.NO_BORDER)
                .setBackgroundColor(LIGHT_GRAY, 0.3f);
    }

    private Cell createTotalCell(String content, boolean isBold) {
        Paragraph p = new Paragraph(content).setFontSize(11);
        if (isBold) {
            p.setBold();
        }
        return new Cell()
                .add(p)
                .setTextAlignment(TextAlignment.RIGHT)
                .setPadding(5)
                .setBorder(Border.NO_BORDER);
    }

    private String formatMoney(BigDecimal amount) {
        return "$" + String.format("%,.2f", amount);
    }
}
