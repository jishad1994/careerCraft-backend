import { IResumeData, IResumeTemplate, ResumeTemplateId } from "../models/resume/resume.interface";

const templates: IResumeTemplate[] = [
    {
        id: "classic",
        name: "Classic",
        description:
            "Traditional resume layout with clear sections and serif typography. Ideal for corporate and formal roles.",
    },
    {
        id: "modern",
        name: "Modern",
        description:
            "Clean, contemporary design with a sidebar accent and sans-serif fonts. Great for tech and creative roles.",
    },
    {
        id: "minimal",
        name: "Minimal",
        description:
            "Ultra-clean layout with maximum whitespace and subtle typography. Perfect for senior-level professionals.",
    },
];

export function getAllTemplates(): IResumeTemplate[] {
    return templates;
}

export function getTemplateById(id: ResumeTemplateId): IResumeTemplate | undefined {
    return templates.find((t) => t.id === id);
}

// ---- Shared Helpers ----

function formatDate(dateStr: string | undefined, isCurrent: boolean): string {
    if (isCurrent) return "Present";
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---- Template Renderers ----

function renderClassicTemplate(data: IResumeData): string {
    const { personalInfo, summary, experience, education, skills } = data;

    const experienceHtml = experience
        .map(
            (exp) => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0;">
                    ${escapeHtml(exp.jobTitle)}
                </h3>
                <span style="font-size: 13px; color: #666; white-space: nowrap;">
                    ${formatDate(exp.startDate, false)} – ${formatDate(exp.endDate, exp.isCurrent)}
                </span>
            </div>
            <p style="font-size: 14px; color: #444; margin: 2px 0 6px 0; font-style: italic;">
                ${escapeHtml(exp.company)}
            </p>
            ${
                exp.description
                    ? `<p style="font-size: 13px; color: #333; margin: 0 0 6px 0; line-height: 1.5;">${escapeHtml(
                          exp.description,
                      )}</p>`
                    : ""
            }
            ${
                exp.achievements.length > 0
                    ? `<ul style="margin: 4px 0 0 0; padding-left: 18px;">
                    ${exp.achievements
                        .map(
                            (a) =>
                                `<li style="font-size: 13px; color: #333; margin-bottom: 3px; line-height: 1.4;">${escapeHtml(
                                    a,
                                )}</li>`,
                        )
                        .join("")}
                </ul>`
                    : ""
            }
        </div>
    `,
        )
        .join("");

    const educationHtml = education
        .map(
            (edu) => `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: 15px; font-weight: 600; color: #1a1a1a; margin: 0;">
                    ${escapeHtml(edu.degree)} in ${escapeHtml(edu.fieldOfStudy)}
                </h3>
                <span style="font-size: 13px; color: #666; white-space: nowrap;">
                    ${formatDate(edu.startDate, false)} – ${formatDate(edu.endDate, edu.isCurrent)}
                </span>
            </div>
            <p style="font-size: 14px; color: #444; margin: 2px 0 0 0;">${escapeHtml(edu.institution)}</p>
            ${
                edu.grade
                    ? `<p style="font-size: 13px; color: #555; margin: 2px 0 0 0;">Grade: ${escapeHtml(edu.grade)}</p>`
                    : ""
            }
        </div>
    `,
        )
        .join("");

    const skillsHtml = skills
        .map(
            (s) =>
                `<span style="display: inline-block; font-size: 13px; color: #333; margin: 0 12px 6px 0;">${escapeHtml(
                    s.name,
                )}</span>`,
        )
        .join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Source Sans 3', sans-serif;
                color: #333;
                background: #fff;
                padding: 40px 48px;
                max-width: 800px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px;">
            <h1 style="font-family: 'Merriweather', serif; font-size: 26px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">
                ${escapeHtml(personalInfo.fullName)}
            </h1>
            <p style="font-size: 13px; color: #555; line-height: 1.6;">
                ${[personalInfo.email, personalInfo.phone, personalInfo.location]
                    .filter(Boolean)
                    .map(escapeHtml)
                    .join(" &nbsp;|&nbsp; ")}
            </p>
            ${
                personalInfo.linkedIn || personalInfo.portfolio
                    ? `<p style="font-size: 13px; color: #555;">
                    ${[personalInfo.linkedIn, personalInfo.portfolio]
                        .filter((item): item is string => Boolean(item))
                        .map(escapeHtml)
                        .join(" &nbsp;|&nbsp; ")}
                </p>`
                    : ""
            }
        </div>

        <!-- Summary -->
        ${
            summary.text
                ? `
        <div style="margin-bottom: 20px;">
            <h2 style="font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
                Professional Summary
            </h2>
            <p style="font-size: 13px; color: #333; line-height: 1.6;">${escapeHtml(summary.text)}</p>
        </div>
        `
                : ""
        }

        <!-- Experience -->
        ${
            experience.length > 0
                ? `
        <div style="margin-bottom: 20px;">
            <h2 style="font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
                Experience
            </h2>
            ${experienceHtml}
        </div>
        `
                : ""
        }

        <!-- Education -->
        ${
            education.length > 0
                ? `
        <div style="margin-bottom: 20px;">
            <h2 style="font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
                Education
            </h2>
            ${educationHtml}
        </div>
        `
                : ""
        }

        <!-- Skills -->
        ${
            skills.length > 0
                ? `
        <div>
            <h2 style="font-family: 'Merriweather', serif; font-size: 16px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
                Skills
            </h2>
            <div>${skillsHtml}</div>
        </div>
        `
                : ""
        }
    </body>
    </html>
    `;
}

function renderModernTemplate(data: IResumeData): string {
    const { personalInfo, summary, experience, education, skills } = data;

    const experienceHtml = experience
        .map(
            (exp) => `
        <div style="margin-bottom: 18px; padding-left: 16px; border-left: 3px solid #2563eb;">
            <h3 style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">${escapeHtml(exp.jobTitle)}</h3>
            <p style="font-size: 14px; color: #2563eb; margin: 2px 0 4px 0;">${escapeHtml(exp.company)}</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">
                ${formatDate(exp.startDate, false)} – ${formatDate(exp.endDate, exp.isCurrent)}
            </p>
            ${
                exp.description
                    ? `<p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; line-height: 1.5;">${escapeHtml(
                          exp.description,
                      )}</p>`
                    : ""
            }
            ${
                exp.achievements.length > 0
                    ? `<ul style="margin: 4px 0 0 0; padding-left: 16px;">
                    ${exp.achievements
                        .map(
                            (a) =>
                                `<li style="font-size: 13px; color: #475569; margin-bottom: 3px; line-height: 1.4;">${escapeHtml(
                                    a,
                                )}</li>`,
                        )
                        .join("")}
                </ul>`
                    : ""
            }
        </div>
    `,
        )
        .join("");

    const educationHtml = education
        .map(
            (edu) => `
        <div style="margin-bottom: 14px; padding-left: 16px; border-left: 3px solid #2563eb;">
            <h3 style="font-size: 15px; font-weight: 600; color: #1e293b; margin: 0;">
                ${escapeHtml(edu.degree)} – ${escapeHtml(edu.fieldOfStudy)}
            </h3>
            <p style="font-size: 14px; color: #2563eb; margin: 2px 0;">${escapeHtml(edu.institution)}</p>
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                ${formatDate(edu.startDate, false)} – ${formatDate(edu.endDate, edu.isCurrent)}
            </p>
            ${
                edu.grade
                    ? `<p style="font-size: 13px; color: #64748b; margin: 2px 0 0 0;">Grade: ${escapeHtml(edu.grade)}</p>`
                    : ""
            }
        </div>
    `,
        )
        .join("");

    const skillsHtml = skills
        .map(
            (s) =>
                `<span style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; border-radius: 4px; font-size: 12px; font-weight: 500; margin: 0 8px 8px 0;">${escapeHtml(
                    s.name,
                )}</span>`,
        )
        .join("");

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
                padding: 40px 48px;
                max-width: 800px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div style="margin-bottom: 28px;">
            <h1 style="font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                ${escapeHtml(personalInfo.fullName)}
            </h1>
            <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #64748b;">
                ${personalInfo.email ? `<span>✉ ${escapeHtml(personalInfo.email)}</span>` : ""}
                ${personalInfo.phone ? `<span>☎ ${escapeHtml(personalInfo.phone)}</span>` : ""}
                ${personalInfo.location ? `<span>📍 ${escapeHtml(personalInfo.location)}</span>` : ""}
            </div>
            ${
                personalInfo.linkedIn || personalInfo.portfolio
                    ? `<div style="display: flex; gap: 16px; font-size: 13px; color: #2563eb; margin-top: 4px;">
                    ${personalInfo.linkedIn ? `<span>${escapeHtml(personalInfo.linkedIn)}</span>` : ""}
                    ${personalInfo.portfolio ? `<span>${escapeHtml(personalInfo.portfolio)}</span>` : ""}
                </div>`
                    : ""
            }
            <div style="height: 3px; background: linear-gradient(to right, #2563eb, #93c5fd); margin-top: 16px; border-radius: 2px;"></div>
        </div>

        <!-- Summary -->
        ${
            summary.text
                ? `
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Summary</h2>
            <p style="font-size: 13px; color: #475569; line-height: 1.6;">${escapeHtml(summary.text)}</p>
        </div>
        `
                : ""
        }

        <!-- Experience -->
        ${
            experience.length > 0
                ? `
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Experience</h2>
            ${experienceHtml}
        </div>
        `
                : ""
        }

        <!-- Education -->
        ${
            education.length > 0
                ? `
        <div style="margin-bottom: 24px;">
            <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px;">Education</h2>
            ${educationHtml}
        </div>
        `
                : ""
        }

        <!-- Skills -->
        ${
            skills.length > 0
                ? `
        <div>
            <h2 style="font-size: 14px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">Skills</h2>
            <div>${skillsHtml}</div>
        </div>
        `
                : ""
        }
    </body>
    </html>
    `;
}

function renderMinimalTemplate(data: IResumeData): string {
    const { personalInfo, summary, experience, education, skills } = data;

    const experienceHtml = experience
        .map(
            (exp) => `
        <div style="margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                <span style="font-size: 14px; font-weight: 600; color: #111;">${escapeHtml(exp.jobTitle)}</span>
                <span style="font-size: 12px; color: #999; letter-spacing: 0.5px;">
                    ${formatDate(exp.startDate, false)} – ${formatDate(exp.endDate, exp.isCurrent)}
                </span>
            </div>
            <p style="font-size: 13px; color: #666; margin-bottom: 6px;">${escapeHtml(exp.company)}</p>
            ${
                exp.description
                    ? `<p style="font-size: 13px; color: #444; line-height: 1.55; margin-bottom: 4px;">${escapeHtml(
                          exp.description,
                      )}</p>`
                    : ""
            }
            ${
                exp.achievements.length > 0
                    ? `<ul style="margin: 4px 0 0 0; padding-left: 16px;">
                    ${exp.achievements
                        .map(
                            (a) =>
                                `<li style="font-size: 13px; color: #444; margin-bottom: 2px; line-height: 1.4;">${escapeHtml(
                                    a,
                                )}</li>`,
                        )
                        .join("")}
                </ul>`
                    : ""
            }
        </div>
    `,
        )
        .join("");

    const educationHtml = education
        .map(
            (edu) => `
        <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 14px; font-weight: 600; color: #111;">
                    ${escapeHtml(edu.degree)} — ${escapeHtml(edu.fieldOfStudy)}
                </span>
                <span style="font-size: 12px; color: #999;">
                    ${formatDate(edu.startDate, false)} – ${formatDate(edu.endDate, edu.isCurrent)}
                </span>
            </div>
            <p style="font-size: 13px; color: #666;">${escapeHtml(edu.institution)}</p>
            ${edu.grade ? `<p style="font-size: 12px; color: #888;">Grade: ${escapeHtml(edu.grade)}</p>` : ""}
        </div>
    `,
        )
        .join("");

    const skillsHtml = skills.map((s) => escapeHtml(s.name)).join("  •  ");

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@400;600&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'IBM Plex Sans', sans-serif;
                color: #333;
                background: #fff;
                padding: 48px 56px;
                max-width: 800px;
                margin: 0 auto;
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div style="margin-bottom: 32px;">
            <h1 style="font-family: 'IBM Plex Serif', serif; font-size: 24px; font-weight: 600; color: #111; letter-spacing: -0.5px; margin-bottom: 10px;">
                ${escapeHtml(personalInfo.fullName)}
            </h1>
            <p style="font-size: 13px; color: #888; letter-spacing: 0.3px;">
                ${[personalInfo.email, personalInfo.phone, personalInfo.location]
                    .filter(Boolean)
                    .map(escapeHtml)
                    .join("  ·  ")}
            </p>
            ${
                personalInfo.linkedIn || personalInfo.portfolio
                    ? `<p style="font-size: 13px; color: #888; letter-spacing: 0.3px;">
                    ${[personalInfo.linkedIn, personalInfo.portfolio]
                        .filter((item): item is string => Boolean(item))
                        .map(escapeHtml)
                        .join("  ·  ")}
                </p>`
                    : ""
            }
        </div>

        <!-- Summary -->
        ${
            summary.text
                ? `
        <div style="margin-bottom: 28px;">
            <p style="font-size: 13px; color: #444; line-height: 1.65; border-left: 2px solid #ddd; padding-left: 16px;">
                ${escapeHtml(summary.text)}
            </p>
        </div>
        `
                : ""
        }

        <!-- Experience -->
        ${
            experience.length > 0
                ? `
        <div style="margin-bottom: 28px;">
            <h2 style="font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;">Experience</h2>
            ${experienceHtml}
        </div>
        `
                : ""
        }

        <!-- Education -->
        ${
            education.length > 0
                ? `
        <div style="margin-bottom: 28px;">
            <h2 style="font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;">Education</h2>
            ${educationHtml}
        </div>
        `
                : ""
        }

        <!-- Skills -->
        ${
            skills.length > 0
                ? `
        <div>
            <h2 style="font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Skills</h2>
            <p style="font-size: 13px; color: #555; line-height: 1.8;">${skillsHtml}</p>
        </div>
        `
                : ""
        }
    </body>
    </html>
    `;
}

// ---- Public Render Function ----

export function renderResumeHtml(data: IResumeData): string {
    switch (data.templateId) {
        case "modern":
            return renderModernTemplate(data);
        case "minimal":
            return renderMinimalTemplate(data);
        case "classic":
        default:
            return renderClassicTemplate(data);
    }
}
