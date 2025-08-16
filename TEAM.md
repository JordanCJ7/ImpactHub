# ImpactHub: Team Roles & Sprint Responsibilities

> Clear accountability across roles in a 5-sprint Agile project

This document outlines the **roles and responsibilities** of each team member throughout the 5-sprint development of **ImpactHub**, a charity donation platform. The team follows **Scrum methodology**, with defined roles:

- **Product Owner (PO):** Janitha Gamage  
- **Scrum Master (SM):** Dewmini Navodya  
- **Full-Stack Developers:** Dulmi Kaushalya, Yoshini Lakna

While only two members are hands-on developers, all contribute critically to the success of the MVP.

---

## 🧩 Team Roles Overview

| Role | Responsibilities |
|------|------------------|
| **Product Owner** | Owns vision, backlog, stakeholder needs, and feature prioritization |
| **Scrum Master** | Facilitates Scrum events, removes blockers, ensures process adherence |
| **Full-Stack Developers** | Build, test, and deploy frontend (React) and backend (Node.js + MongoDB) features |

> 💡 **Note:** Developers handle both frontend and backend work. PO and SM support delivery but do not contribute code directly.

---

## 🗓️ Sprint 0: Planning & Setup

**Focus:** Project foundation, tooling, and alignment

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Janitha Gamage** | Product Owner | - Define product vision and donor-centric goals<br>- Identify key stakeholders (charities, donors)<br>- Create initial product backlog using MoSCoW method<br>- Prioritize MVP features |
| **Dewmini Navodya** | Scrum Master | - Set up sprint cadence and meeting schedule<br>- Configure GitHub project board (To Do, In Progress, Done)<br>- Facilitate Sprint 0 planning session<br>- Document team agreements and working norms |
| **Dulmi Kaushalya** | Full-Stack Developer | - Design wireframes for campaign listing and donation pages<br>- Research React component libraries (e.g., Material-UI)<br>- Draft API contract (`GET /campaigns`, `POST /donate`) |
| **Yoshini Lakna** | Full-Stack Developer | - Set up Node.js/Express backend structure<br>- Initialize MongoDB connection and test schema<br>- Research Stripe and PayPal SDKs for payment integration |

**Shared Outcomes:**
- Approved MVP backlog
- Wireframes and UI direction
- Backend/frontend boilerplate ready
- Payment gateway evaluation started

---

## 🏃 Sprint 1: Campaign Browsing & Donation Flow

**Focus:** Launch campaign listing and secure donation flow

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Janitha Gamage** | Product Owner | - Refine user stories for donation flow<br>- Validate UI mockups with donor personas<br>- Clarify acceptance criteria for `Donate` button and success screen |
| **Dewmini Navodya** | Scrum Master | - Facilitate daily standups<br>- Track sprint progress and blockers<br>- Organize mid-sprint review with PO |
| **Dulmi Kaushalya** | Full-Stack Developer | - Build React frontend: Campaign listing page<br>- Implement filtering, search, and responsive layout<br>- Connect to `GET /campaigns` API |
| **Yoshini Lakna** | Full-Stack Developer | - Develop `GET /campaigns` and `POST /create-payment-intent` APIs<br>- Integrate Stripe for one-time donations<br>- Handle success/failure callbacks and logging |

**Shared Outcomes:**
- Functional campaign listing UI
- End-to-end donation flow (Stripe test mode)
- UX feedback incorporated

---

## 🏃 Sprint 2: Donation Tracking

**Focus:** User authentication and donation history dashboard

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Janitha Gamage** | Product Owner | - Define user story: “As a donor, I want to see my donation history”<br>- Specify dashboard content (date, amount, campaign, status)<br>- Review dashboard mockup |
| **Dewmini Navodya** | Scrum Master | - Facilitate sprint review and retrospective<br>- Help resolve integration delays between frontend and backend<br>- Ensure team stays focused on sprint goal |
| **Dulmi Kaushalya** | Full-Stack Developer | - Implement JWT-based authentication (login/register)<br>- Build protected routes and session handling in backend |
| **Yoshini Lakna** | Full-Stack Developer | - Build donor dashboard UI (React)<br>- Fetch and display user’s donation history from `GET /donations/user`<br>- Add loading states and error handling |

**Shared Outcomes:**
- Secure authentication flow
- Donation history visible in dashboard
- Protected API routes implemented

---

## 🏃 Sprint 3: Impact Reports

**Focus:** Visualize how donations create real-world impact

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Janitha Gamage** | Product Owner | - Define what "impact" means to donors (metrics, photos, narratives)<br>- Provide sample impact data from charity partners<br>- Approve report layout and KPIs |
| **Dewmini Navodya** | Scrum Master | - Monitor team velocity and scope creep risk<br>- Facilitate feedback session with test users<br>- Ensure Definition of Done is met |
| **Dulmi Kaushalya** | Full-Stack Developer | - Design MongoDB schema for `ImpactReport` (title, description, metrics, images)<br>- Build `GET /campaigns/:id/report` API endpoint |
| **Yoshini Lakna** | Full-Stack Developer | - Create frontend impact report page<br>- Integrate Chart.js for fund allocation pie chart<br>- Display sample data and handle empty states |

**Shared Outcomes:**
- Impact report page with visualization
- Sample data from charities integrated
- Transparent, donor-friendly reporting

---

## 🏃 Sprint 4: Social Sharing & MVP Polish

**Focus:** Final features, UX polish, and production deployment

| Member | Role | Responsibilities |
|--------|------|------------------|
| **Janitha Gamage** | Product Owner | - Finalize MVP scope and approve "go-live" criteria<br>- Validate trust elements (badges, SSL, charity verification notes)<br>- Prepare launch message for stakeholders |
| **Dewmini Navodya** | Scrum Master | - Lead sprint review and retrospective<br>- Ensure all Agile ceremonies are completed<br>- Document lessons learned for future projects |
| **Dulmi Kaushalya** | Full-Stack Developer | - Implement social sharing buttons (Twitter/X, Facebook)<br>- Use Web Share API for native sharing where supported<br>- Fix UI bugs from usability testing |
| **Yoshini Lakna** | Full-Stack Developer | - Finalize PayPal SDK integration (if time permits) or defer to post-MVP<br>- Deploy application to production (AWS/Firebase)<br>- Run end-to-end tests and security checks |

**Shared Outcomes:**
- Social sharing enabled
- Production deployment completed
- MVP ready for launch
- Full team sign-off on deliverables

---

## 🔄 Collaboration Model

- **Daily Standups (15 mins):** Led by Scrum Master; all members attend
- **Sprint Reviews:** PO presents working features to stakeholders
- **Retrospectives:** Team reflects on process improvements
- **Code Reviews:** Both developers review each other’s PRs
- **Pair Programming:** Used for complex logic (e.g., payment flow, auth)

---

## ✅ Definition of Done (DoD)

A feature is “Done” when:
- Code is peer-reviewed and merged
- Unit/integration tests pass
- UI is responsive and accessible
- Feature is documented
- Tested in staging environment
- Approved by Product Owner

---

## 🎯 Conclusion

With clear Scrum roles and focused execution:
- **Janitha (PO)** ensures we build the *right product*
- **Dewmini (SM)** ensures we build it the *right way*
- **Dulmi and Yoshini (Developers)** deliver high-quality, full-stack features

This structure enables a **lean, agile team** to deliver a **production-ready MVP in just 5 sprints** — aligned with donor needs and technical excellence.