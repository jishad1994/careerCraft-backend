import { IOfferLetterPopulated } from "../models/offer-letter/offerLetter.interface";



function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function renderOfferLetterHtml(offer: IOfferLetterPopulated): string {
    const candidateName = `${offer.candidate.firstName} ${offer.candidate.lastName}`.trim();
    const comp = offer.compensation;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Inter', sans-serif;
                color: #1e293b;
                background: #fff;
                padding: 56px 64px;
                max-width: 800px;
                margin: 0 auto;
                font-size: 14px;
                line-height: 1.7;
            }
            .header {
                border-bottom: 3px solid #1e40af;
                padding-bottom: 24px;
                margin-bottom: 32px;
            }
            .company-name {
                font-size: 22px;
                font-weight: 700;
                color: #1e40af;
                margin-bottom: 4px;
            }
            .company-details {
                font-size: 12px;
                color: #64748b;
            }
            .date-ref {
                margin-bottom: 28px;
                font-size: 13px;
                color: #475569;
            }
            .subject {
                font-size: 16px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 24px;
            }
            .greeting { margin-bottom: 16px; }
            .body-text { margin-bottom: 16px; }
            .details-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0 24px 0;
            }
            .details-table td {
                padding: 10px 16px;
                border: 1px solid #e2e8f0;
                font-size: 13px;
            }
            .details-table td:first-child {
                width: 200px;
                font-weight: 600;
                color: #334155;
                background: #f8fafc;
            }
            .details-table td:last-child {
                color: #1e293b;
            }
            .section-title {
                font-size: 14px;
                font-weight: 700;
                color: #1e40af;
                margin: 28px 0 12px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .terms { margin-bottom: 24px; white-space: pre-line; }
            .closing { margin-top: 40px; }
            .signature-block {
                margin-top: 48px;
            }
            .signature-line {
                width: 200px;
                border-top: 1px solid #94a3b8;
                padding-top: 8px;
                font-size: 13px;
                color: #475569;
            }
            .acceptance-block {
                margin-top: 56px;
                padding: 24px;
                border: 2px dashed #cbd5e1;
                border-radius: 8px;
            }
            .acceptance-block h3 {
                font-size: 14px;
                font-weight: 700;
                color: #334155;
                margin-bottom: 20px;
            }
            .acceptance-line {
                display: flex;
                justify-content: space-between;
                margin-top: 32px;
            }
            .acceptance-field {
                width: 45%;
                border-top: 1px solid #94a3b8;
                padding-top: 8px;
                font-size: 12px;
                color: #64748b;
            }
            .footer {
                margin-top: 48px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <div class="company-name">${escapeHtml(offer.company.name)}</div>
            <div class="company-details">
                ${offer.company.email ? escapeHtml(offer.company.email) : ""}
                ${offer.company.location ? ` | ${escapeHtml(offer.company.location)}` : ""}
            </div>
        </div>

        <!-- Date -->
        <div class="date-ref">
            <div>Date: ${formatDate(offer.offerDate)}</div>
            <div>Ref: OL-${String(offer._id).slice(-8).toUpperCase()}</div>
        </div>

        <!-- To -->
        <div class="body-text">
            <strong>To,</strong><br>
            ${escapeHtml(candidateName)}<br>
            ${escapeHtml(offer.candidate.email)}
            ${offer.candidate.phone ? `<br>${escapeHtml(offer.candidate.phone)}` : ""}
        </div>

        <!-- Subject -->
        <div class="subject">
            Subject: Offer of Employment – ${escapeHtml(offer.designation)}
        </div>

        <!-- Greeting -->
        <div class="greeting">
            Dear ${escapeHtml(offer.candidate.firstName)},
        </div>

        <!-- Body -->
        <div class="body-text">
            We are pleased to extend this offer of employment for the position of
            <strong>${escapeHtml(offer.designation)}</strong> in the
            <strong>${escapeHtml(offer.department)}</strong> department at
            <strong>${escapeHtml(offer.company.name)}</strong>.
            We were impressed with your qualifications and believe you will be a valuable
            addition to our team.
        </div>

        <!-- Details Table -->
        <div class="section-title">Employment Details</div>
        <table class="details-table">
            <tr>
                <td>Position</td>
                <td>${escapeHtml(offer.designation)}</td>
            </tr>
            <tr>
                <td>Department</td>
                <td>${escapeHtml(offer.department)}</td>
            </tr>
            <tr>
                <td>Employment Type</td>
                <td>${escapeHtml(offer.employmentType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()))}</td>
            </tr>
            <tr>
                <td>Work Mode</td>
                <td>${escapeHtml(offer.workMode.charAt(0).toUpperCase() + offer.workMode.slice(1))}</td>
            </tr>
            <tr>
                <td>Work Location</td>
                <td>${escapeHtml(offer.workLocation)}</td>
            </tr>
            <tr>
                <td>Joining Date</td>
                <td>${formatDate(offer.joiningDate)}</td>
            </tr>
            ${offer.probationPeriod ? `
            <tr>
                <td>Probation Period</td>
                <td>${offer.probationPeriod} month${offer.probationPeriod > 1 ? "s" : ""}</td>
            </tr>` : ""}
        </table>

        <!-- Compensation -->
        <div class="section-title">Compensation</div>
        <table class="details-table">
            <tr>
                <td>Base Salary</td>
                <td>${formatCurrency(comp.baseSalary, comp.currency)} per ${comp.period === "yearly" ? "annum" : "month"}</td>
            </tr>
            ${comp.bonus ? `
            <tr>
                <td>Bonus</td>
                <td>${escapeHtml(comp.bonus)}</td>
            </tr>` : ""}
            ${comp.otherBenefits ? `
            <tr>
                <td>Other Benefits</td>
                <td>${escapeHtml(comp.otherBenefits)}</td>
            </tr>` : ""}
        </table>

        ${offer.additionalTerms ? `
        <!-- Additional Terms -->
        <div class="section-title">Additional Terms & Conditions</div>
        <div class="terms">${escapeHtml(offer.additionalTerms)}</div>
        ` : ""}

        <!-- Expiry -->
        <div class="body-text">
            This offer is valid until <strong>${formatDate(offer.expiresAt)}</strong>.
            Please confirm your acceptance by signing and returning this letter before
            the expiry date.
        </div>

        <div class="body-text">
            We look forward to welcoming you to our team!
        </div>

        <!-- Closing -->
        <div class="closing">
            <div>Warm regards,</div>
            <div class="signature-block">
                <div class="signature-line">
                    <div>Authorized Signatory</div>
                    <div style="font-weight: 600; color: #1e293b; margin-top: 4px;">
                        ${escapeHtml(offer.company.name)}
                    </div>
                </div>
            </div>
        </div>

        <!-- Acceptance Block -->
        <div class="acceptance-block">
            <h3>Candidate Acceptance</h3>
            <div>
                I, ${escapeHtml(candidateName)}, hereby accept the terms and conditions
                of this offer of employment as outlined above.
            </div>
            <div class="acceptance-line">
                <div class="acceptance-field">Candidate Signature</div>
                <div class="acceptance-field">Date</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            This is a computer-generated document. Ref: OL-${String(offer._id).slice(-8).toUpperCase()}
        </div>
    </body>
    </html>
    `;
}