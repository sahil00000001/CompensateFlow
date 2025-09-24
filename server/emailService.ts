import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from || 'noreply@company.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendReviewNotification(
  to: string,
  employeeName: string,
  action: string,
  deadline?: string
): Promise<boolean> {
  const subject = `Performance Review: ${action}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Performance Review Notification</h2>
      <p>Hello,</p>
      <p>This is a notification regarding the performance review for <strong>${employeeName}</strong>.</p>
      <p><strong>Action Required:</strong> ${action}</p>
      ${deadline ? `<p><strong>Deadline:</strong> ${deadline}</p>` : ''}
      <p>Please log in to the system to take the required action.</p>
      <br>
      <p>Best regards,<br>HR Team</p>
    </div>
  `;

  return await sendEmail({
    to,
    from: 'hr@company.com',
    subject,
    html,
  });
}

export async function sendMeetingInvitation(
  to: string,
  employeeName: string,
  managerName: string,
  meetingDate: string,
  meetingLink?: string
): Promise<boolean> {
  const subject = `1:1 Performance Review Meeting - ${employeeName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">1:1 Performance Review Meeting</h2>
      <p>Hello,</p>
      <p>You have a scheduled 1:1 performance review meeting.</p>
      <p><strong>Employee:</strong> ${employeeName}</p>
      <p><strong>Manager:</strong> ${managerName}</p>
      <p><strong>Date & Time:</strong> ${meetingDate}</p>
      ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      <p>Please ensure you are prepared for the meeting and have reviewed all relevant materials.</p>
      <br>
      <p>Best regards,<br>HR Team</p>
    </div>
  `;

  return await sendEmail({
    to,
    from: 'hr@company.com',
    subject,
    html,
  });
}

export async function sendAppealNotification(
  to: string,
  employeeName: string,
  managerName: string,
  reason: string
): Promise<boolean> {
  const subject = `Appeal Request - ${employeeName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F59E0B;">Appeal Request Submitted</h2>
      <p>Hello ${managerName},</p>
      <p>An appeal request has been submitted by <strong>${employeeName}</strong>.</p>
      <p><strong>Reason:</strong></p>
      <p style="background-color: #F3F4F6; padding: 15px; border-radius: 5px;">${reason}</p>
      <p>Please review this appeal and take appropriate action in the system.</p>
      <br>
      <p>Best regards,<br>HR Team</p>
    </div>
  `;

  return await sendEmail({
    to,
    from: 'hr@company.com',
    subject,
    html,
  });
}
