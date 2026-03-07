# authentication/email_utils.py
"""
Email utilities using Cloudflare Workers for reliable email delivery
"""

import os
import logging
# from .cloudflare_email_backend import send_email_via_cloudflare
from .resend_email_backend import send_email_via_resend as send_email_via_cloudflare
logger = logging.getLogger(__name__)


def send_contact_notification(submission):
    """
    Send email notification to company when contact form is submitted

    Args:
        submission: ContactSubmission instance
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        subject = f"New Contact Form Submission - {submission.subject or 'No Subject'}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc2626; color: white; padding: 20px; text-align: center; }}
                .content {{ background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #555; }}
                .value {{ margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #dc2626; }}
                .message-box {{ background-color: white; padding: 15px; border: 1px solid #ddd; min-height: 100px; }}
                .footer {{ text-align: center; padding: 20px; color: #777; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Contact Form Submission</h1>
                    <p>Nexxa Auto Parts</p>
                </div>

                <div class="content">
                    <div class="field">
                        <div class="label">📧 Email:</div>
                        <div class="value">{submission.email}</div>
                    </div>

                    <div class="field">
                        <div class="label">👤 Name:</div>
                        <div class="value">{submission.name or "Not provided"}</div>
                    </div>

                    <div class="field">
                        <div class="label">📋 Subject:</div>
                        <div class="value">{submission.subject or "No subject"}</div>
                    </div>

                    <div class="field">
                        <div class="label">📱 Phone:</div>
                        <div class="value">{submission.phone or "Not provided"}</div>
                    </div>

                    <div class="field">
                        <div class="label">💬 Message:</div>
                        <div class="message-box">{submission.message}</div>
                    </div>

                    <div class="field">
                        <div class="label">🕐 Submitted:</div>
                        <div class="value">{submission.created_at.strftime("%B %d, %Y at %I:%M %p")}</div>
                    </div>

                    <div class="field">
                        <div class="label">🌐 IP Address:</div>
                        <div class="value">{submission.ip_address or "Unknown"}</div>
                    </div>

                    <div class="field">
                        <div class="label">🆔 Submission ID:</div>
                        <div class="value">{submission.id}</div>
                    </div>
                </div>

                <div class="footer">
                    <p>This is an automated notification from your Nexxa Auto Parts contact form.</p>
                    <p>Please respond to: {submission.email}</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
New Contact Form Submission - Nexxa Auto Parts

Email: {submission.email}
Name: {submission.name or "Not provided"}
Subject: {submission.subject or "No subject"}
Phone: {submission.phone or "Not provided"}

Message:
{submission.message}

Submitted: {submission.created_at.strftime("%B %d, %Y at %I:%M %p")}
IP Address: {submission.ip_address or "Unknown"}
Submission ID: {submission.id}

---
Please respond to: {submission.email}
        """

        # Get recipient from environment variable
        recipient = os.getenv('CONTACT_EMAIL_RECIPIENTS', 'nexxaautoleads@gmail.com')

        # Send via Cloudflare
        success = send_email_via_cloudflare(
            to=recipient,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            reply_to=submission.email
        )

        if success:
            logger.info(f"Contact form notification sent for submission {submission.id}")
        
        return success

    except Exception as e:
        logger.error(f"Failed to send contact notification: {str(e)}", exc_info=True)
        return False


def send_auto_reply_to_customer(submission):
    """
    Send automatic reply to customer confirming receipt of their message

    Args:
        submission: ContactSubmission instance
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        subject = "We received your message - Nexxa Auto Parts"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #dc2626; color: white; padding: 30px; text-align: center; }}
                .content {{ background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }}
                .highlight {{ background-color: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #777; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You for Contacting Us!</h1>
                    <p>Nexxa Auto Parts</p>
                </div>

                <div class="content">
                    <p>Hi {submission.name or "there"},</p>

                    <p>Thank you for reaching out to <strong>Nexxa Auto Parts</strong>!</p>

                    <p>We have received your message and our team will review it shortly. We typically respond within 2-45 mins during business days.</p>

                    <div class="highlight">
                        <strong>Your Message Summary:</strong><br>
                        <strong>Subject:</strong> {submission.subject or "General Inquiry"}<br>
                        <strong>Reference ID:</strong> {str(submission.id)[:8]}
                    </div>

                    <p>If you have any urgent concerns, please feel free to call us or send another message.</p>

                    <p>Best regards,<br>
                    <strong>Nexxa Auto Parts Team</strong></p>
                </div>

                <div class="footer">
                    <p>This is an automated confirmation email.</p>
                    <p>© 2024 Nexxa Auto Parts. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Thank You for Contacting Us!

Hi {submission.name or "there"},

Thank you for reaching out to Nexxa Auto Parts!

We have received your message and our team will review it shortly. We typically respond within 2-45 mins during business days.

Your Message Summary:
Subject: {submission.subject or "General Inquiry"}
Reference ID: {str(submission.id)[:8]}

If you have any urgent concerns, please feel free to call us or send another message.

Best regards,
Nexxa Auto Parts Team

---
This is an automated confirmation email.
© 2024 Nexxa Auto Parts. All rights reserved.
        """

        success = send_email_via_cloudflare(
            to=submission.email,
            subject=subject,
            html_body=html_content,
            text_body=text_content
        )

        if success:
            logger.info(f"Auto-reply sent to {submission.email}")
        
        return success

    except Exception as e:
        logger.error(f"Failed to send auto-reply: {str(e)}", exc_info=True)
        return False


def send_parts_inquiry_notification(inquiry):
    """
    Send email notification to company when parts inquiry is submitted

    Args:
        inquiry: PartsInquiry instance
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        subject = f"New Parts Request - {inquiry.year} {inquiry.manufacturer} {inquiry.model}"

        # Create beautiful HTML email
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #2c3e50;
                    background-color: #f4f6f9;
                    margin: 0;
                    padding: 0;
                }}
                .email-wrapper {{
                    max-width: 650px;
                    margin: 30px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 10px 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 35px 30px;
                }}
                .vehicle-banner {{
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 25px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    border-left: 5px solid #667eea;
                }}
                .vehicle-banner h2 {{
                    margin: 0 0 15px 0;
                    color: #667eea;
                    font-size: 24px;
                }}
                .info-card {{
                    background: #f8f9fa;
                    padding: 15px 20px;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    border: 1px solid #e9ecef;
                }}
                .footer {{
                    background: #f8f9fa;
                    text-align: center;
                    padding: 25px;
                    border-top: 1px solid #e9ecef;
                }}
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="header">
                    <h1>🚗 New Parts Request</h1>
                    <p>Nexxa Auto Parts</p>
                </div>

                <div class="content">
                    <div class="vehicle-banner">
                        <h2>Vehicle Information</h2>
                        <p><strong>Year:</strong> {inquiry.year}</p>
                        <p><strong>Manufacturer:</strong> {inquiry.manufacturer}</p>
                        <p><strong>Model:</strong> {inquiry.model}</p>
                        <p><strong>Part Category:</strong> {inquiry.part_category}</p>
                    </div>

                    <h3>Customer Information</h3>
                    <div class="info-card">
                        <p><strong>👤 Name:</strong> {inquiry.name}</p>
                        <p><strong>📧 Email:</strong> {inquiry.email}</p>
                        <p><strong>📱 Phone:</strong> {inquiry.phone or 'Not provided'}</p>
                    </div>

                    {f'<div class="info-card"><p><strong>Parts Needed:</strong><br>{inquiry.parts_needed}</p></div>' if inquiry.parts_needed else ''}

                    <div class="info-card">
                        <p><strong>🕐 Submitted:</strong> {inquiry.created_at.strftime("%B %d, %Y at %I:%M %p")}</p>
                        <p><strong>🆔 Request ID:</strong> {inquiry.id}</p>
                    </div>
                </div>

                <div class="footer">
                    <p><strong>Reply to:</strong> {inquiry.email}</p>
                    <p>REF: {str(inquiry.id)[:8].upper()}</p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text_content = f"""
New Parts Request - Nexxa Auto Parts

VEHICLE INFORMATION
Year: {inquiry.year}
Manufacturer: {inquiry.manufacturer}
Model: {inquiry.model}
Part Category: {inquiry.part_category}

CUSTOMER INFORMATION
Name: {inquiry.name}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}

{f'PARTS NEEDED: {inquiry.parts_needed}' if inquiry.parts_needed else ''}

REQUEST DETAILS
Submitted: {inquiry.created_at.strftime("%B %d, %Y at %I:%M %p")}
Request ID: {inquiry.id}

Reply to: {inquiry.email}
Reference: {str(inquiry.id)[:8].upper()}
        """

        # Get recipient from environment
        recipient = os.getenv('CONTACT_EMAIL_RECIPIENTS', 'nexxaautoleads@gmail.com')

        # Send via Cloudflare
        success = send_email_via_cloudflare(
            to=recipient,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            reply_to=inquiry.email
        )

        if success:
            logger.info(f"Parts inquiry notification sent for {inquiry.id}")
        
        return success

    except Exception as e:
        logger.error(f"Failed to send parts inquiry notification: {str(e)}", exc_info=True)
        return False


def send_parts_inquiry_auto_reply(inquiry):
    """
    Send automatic reply to customer confirming receipt of their parts request

    Args:
        inquiry: PartsInquiry instance
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        subject = "We're Finding Your Parts - Nexxa Auto Parts"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #2c3e50;
                    background-color: #f4f6f9;
                    margin: 0;
                    padding: 0;
                }}
                .email-wrapper {{
                    max-width: 650px;
                    margin: 30px auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 50px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0 0 15px 0;
                    font-size: 32px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 35px;
                }}
                .highlight-box {{
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 25px;
                    border-radius: 10px;
                    margin: 30px 0;
                    border-left: 5px solid #667eea;
                }}
                .reference-box {{
                    background: #fff3cd;
                    border: 2px dashed #ffc107;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 25px 0;
                }}
                .reference-box strong {{
                    font-size: 18px;
                    color: #856404;
                    font-family: monospace;
                }}
                .footer {{
                    background: #f8f9fa;
                    text-align: center;
                    padding: 30px;
                    border-top: 1px solid #e9ecef;
                }}
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="header">
                    <h1>✅ Request Received!</h1>
                    <p>We're finding the best parts for your vehicle</p>
                </div>

                <div class="content">
                    <p>Hi <strong>{inquiry.name}</strong>,</p>

                    <p>Thank you for choosing <strong>Nexxa Auto Parts</strong>! We've received your parts request and our team is already working on finding the perfect match for your vehicle.</p>

                    <div class="highlight-box">
                        <h3>📋 Your Request Summary</h3>
                        <p><strong>Vehicle:</strong> {inquiry.year} {inquiry.manufacturer} {inquiry.model}</p>
                        <p><strong>Part Category:</strong> {inquiry.part_category}</p>
                        <p><strong>Submitted:</strong> {inquiry.created_at.strftime("%B %d, %Y")}</p>
                    </div>

                    <div class="reference-box">
                        <p style="margin: 0 0 10px 0; color: #856404;">Your Reference Number</p>
                        <strong>{str(inquiry.id)[:8].upper()}</strong>
                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #856404;">Please save this for future reference</p>
                    </div>

                    <p><strong>What happens next?</strong></p>
                    <p>Our parts specialists will check availability and pricing for your {inquiry.year} {inquiry.manufacturer} {inquiry.model}. We'll send you a detailed quote within 2-45 mins.</p>

                    <p>Need to add something or have questions? Just reply to this email!</p>

                    <p style="margin-top: 30px;">Best regards,<br>
                    <strong>The Nexxa Auto Parts Team</strong></p>
                </div>

                <div class="footer">
                    <p>This is an automated confirmation email.</p>
                    <p>© 2024 Nexxa Auto Parts. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
✅ Request Received - Nexxa Auto Parts

Hi {inquiry.name},

Thank you for choosing Nexxa Auto Parts! We've received your parts request and our team is already working on finding the perfect match for your vehicle.

YOUR REQUEST SUMMARY
Vehicle: {inquiry.year} {inquiry.manufacturer} {inquiry.model}
Part Category: {inquiry.part_category}
Submitted: {inquiry.created_at.strftime("%B %d, %Y")}

YOUR REFERENCE NUMBER
{str(inquiry.id)[:8].upper()}
(Please save this for future reference)

WHAT HAPPENS NEXT?
Our parts specialists will check availability and pricing. We'll send you a detailed quote within 2-45 mins.

Need to add something or have questions? Just reply to this email!

Best regards,
The Nexxa Auto Parts Team

This is an automated confirmation email.
© 2024 Nexxa Auto Parts. All rights reserved.
        """

        success = send_email_via_cloudflare(
            to=inquiry.email,
            subject=subject,
            html_body=html_content,
            text_body=text_content
        )

        if success:
            logger.info(f"Auto-reply sent to {inquiry.email}")
        
        return success

    except Exception as e:
        logger.error(f"Failed to send auto-reply: {str(e)}", exc_info=True)
        return False






























































































































        




