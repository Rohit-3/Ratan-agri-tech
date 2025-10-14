from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os

def generate_invoice_pdf(transaction, merchant_settings):
    """Generate GST-compliant invoice PDF"""
    
    # Create invoices directory if it doesn't exist
    os.makedirs("invoices", exist_ok=True)
    
    # Extract transaction data
    invoice_id = transaction[14]  # invoice_id
    customer_name = transaction[2]  # customer_name
    customer_email = transaction[3]  # customer_email
    customer_phone = transaction[4]  # customer_phone
    product_name = transaction[5]  # product_name
    base_amount = transaction[6]  # base_amount
    gst_rate = transaction[7]  # gst_rate
    gst_amount = transaction[8]  # gst_amount
    total_amount = transaction[9]  # total_amount
    utr = transaction[12]  # utr
    created_at = transaction[15]  # created_at
    paid_at = transaction[16]  # paid_at
    
    # Format dates
    invoice_date = datetime.fromisoformat(created_at).strftime("%d %B %Y") if created_at else datetime.now().strftime("%d %B %Y")
    payment_date = datetime.fromisoformat(paid_at).strftime("%d %B %Y") if paid_at else "N/A"
    
    # PDF file path
    pdf_path = f"invoices/{invoice_id}.pdf"
    
    # Create PDF document
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkgreen
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        textColor=colors.darkblue
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6
    )
    
    # Build story
    story = []
    
    # Title
    story.append(Paragraph("TAX INVOICE", title_style))
    story.append(Spacer(1, 20))
    
    # Company details
    company_data = [
        [Paragraph(f"<b>{merchant_settings['merchant_name']}</b>", heading_style)],
        [Paragraph(merchant_settings['merchant_address'], normal_style)],
        [Paragraph(f"Phone: {merchant_settings['merchant_phone']}", normal_style)],
        [Paragraph(f"Email: {merchant_settings['merchant_email']}", normal_style)],
    ]
    
    if merchant_settings['merchant_gstin']:
        company_data.append([Paragraph(f"GSTIN: {merchant_settings['merchant_gstin']}", normal_style)])
    
    company_table = Table(company_data, colWidths=[4*inch])
    company_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    # Invoice details
    invoice_data = [
        [Paragraph(f"<b>Invoice No:</b> {invoice_id}", normal_style)],
        [Paragraph(f"<b>Date:</b> {invoice_date}", normal_style)],
        [Paragraph(f"<b>Payment Date:</b> {payment_date}", normal_style)],
    ]
    
    invoice_table = Table(invoice_data, colWidths=[2*inch])
    invoice_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    # Combine company and invoice details
    header_data = [
        [company_table, invoice_table]
    ]
    
    header_table = Table(header_data, colWidths=[4*inch, 2*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 30))
    
    # Customer details
    story.append(Paragraph("Bill To:", heading_style))
    customer_data = [
        [Paragraph(f"<b>Name:</b> {customer_name}", normal_style)],
        [Paragraph(f"<b>Email:</b> {customer_email}", normal_style)],
    ]
    
    if customer_phone:
        customer_data.append([Paragraph(f"<b>Phone:</b> {customer_phone}", normal_style)])
    
    customer_table = Table(customer_data, colWidths=[4*inch])
    customer_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(customer_table)
    story.append(Spacer(1, 20))
    
    # Items table
    story.append(Paragraph("Item Details:", heading_style))
    
    items_data = [
        ['Description', 'Qty', 'Rate', 'Amount'],
        [product_name, '1', f'₹{base_amount:.2f}', f'₹{base_amount:.2f}']
    ]
    
    items_table = Table(items_data, colWidths=[3*inch, 0.8*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(items_table)
    story.append(Spacer(1, 20))
    
    # Amount breakdown
    amount_data = [
        ['Subtotal', f'₹{base_amount:.2f}'],
        [f'GST ({gst_rate*100:.0f}%)', f'₹{gst_amount:.2f}'],
        ['Total Amount', f'₹{total_amount:.2f}']
    ]
    
    amount_table = Table(amount_data, colWidths=[2*inch, 1*inch])
    amount_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('FONTSIZE', (0, -1), (1, -1), 14),
        ('LINEBELOW', (0, -1), (1, -1), 1, colors.black),
        ('TOPPADDING', (0, -1), (1, -1), 10),
    ]))
    
    # Align amount table to right
    amount_data_wrapper = [[amount_table]]
    amount_wrapper_table = Table(amount_data_wrapper, colWidths=[6*inch])
    amount_wrapper_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'RIGHT'),
    ]))
    
    story.append(amount_wrapper_table)
    story.append(Spacer(1, 30))
    
    # Payment details
    story.append(Paragraph("Payment Details:", heading_style))
    payment_data = [
        [Paragraph(f"<b>Payment Method:</b> UPI", normal_style)],
        [Paragraph(f"<b>UPI ID:</b> {merchant_settings['merchant_upi']}", normal_style)],
    ]
    
    if utr:
        payment_data.append([Paragraph(f"<b>UTR/Transaction ID:</b> {utr}", normal_style)])
    
    payment_table = Table(payment_data, colWidths=[4*inch])
    payment_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    
    story.append(payment_table)
    story.append(Spacer(1, 30))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    
    story.append(Paragraph("This is a system-generated GST invoice.", footer_style))
    story.append(Paragraph("Thank you for your business!", footer_style))
    
    # Build PDF
    doc.build(story)
    
    return pdf_path

