# ImpactHub: Charity Donation Platform

> A transparent, donor-trust-focused platform to support meaningful causes.

🚀 **Status:** In development (Agile Scrum, 5-sprint MVP plan)  
📅 **Timeline:** 5 weeks (Sprint 0 + 4 development sprints)  
🎯 **MVP Goal:** Deliver core donation features with production-ready quality

---

## 📋 Overview

ImpactHub is a lightweight charity donation platform built to empower donors with transparency, trust, and real-world impact. Using Agile Scrum, we are delivering a **Minimum Viable Product (MVP)** in **5 weeks** with a 4-member team.

### ✅ MVP Features
- Browse charitable campaigns
- Make secure one-time donations
- Track personal donation history
- View impact reports from charities
- Share campaigns on social media

### 🚫 Deferred (Post-MVP)
- Recurring donations
- Multi-currency support
- Advanced analytics dashboard
- Admin/content management system

---

## 🧩 Tech Stack

| Layer       | Technology               |
|------------|--------------------------|
| Frontend   | React (with Material-UI) |
| Backend    | Node.js + Express        |
| Database   | MongoDB                  |
| Auth       | JWT + OAuth (Google)     |
| Payments   | Stripe + PayPal SDK (TBD)|
| Testing    | Jest, React Testing Library |
| Hosting    | AWS / Firebase (TBD)     |

> 💡 **Note:** PayPal integration is under evaluation; Stripe is primary for MVP.

For team roles and sprint responsibilities, see [TEAM.md](TEAM.md)
---

## 🗓️ Agile Sprint Plan

We follow **Scrum methodology** with 1-week sprints, daily standups, sprint reviews, and retrospectives.

### 📆 Total Duration: 5 Weeks

| Sprint | Focus                     | Effort (per dev) |
|--------|----------------------------|------------------|
| Sprint 0 | Planning & Setup         | 20–30 hrs        |
| Sprint 1 | Campaigns + Donations    | 80–100 hrs       |
| Sprint 2 | Donation Tracking        | 80–100 hrs       |
| Sprint 3 | Impact Reports           | 80–100 hrs       |
| Sprint 4 | Social Sharing + Polish  | 80–100 hrs       |

> 💡 **Note:** Effort assumes ~16–20 hours/week per developer.

---

### **Sprint 0: Planning & Setup (Pre-Development Week)**

> *No user-facing features. Focus: Foundation & alignment.*

**Goal:** Prepare for rapid development with clear direction.

**Tasks:**
- Define product vision and stakeholder needs
- Create and prioritize product backlog (MoSCoW method)
- Design wireframes (campaign listing, donation flow)
- Set up tech stack: React, Express, MongoDB
- Configure development and staging environments
- Identify key stakeholders (charities, test donors)

**Deliverables:**
- Approved product backlog
- Development environment & repo structure
- Initial UI wireframes
- Stakeholder alignment document

---

### **Sprint 1: Campaign Browsing & Donation Flow**

**Goal:** Enable users to browse causes and donate securely.

**User Stories:**
- As a donor, I want to browse active campaigns.
- As a donor, I want to make a secure donation via Stripe (and evaluate PayPal).

**Tasks:**
- Build responsive campaign listing page (React)
- Implement `GET /campaigns` API
- Design MongoDB schema: `campaigns`, `donations`
- Integrate Stripe for one-time payments
- Begin evaluation of PayPal SDK (proof of concept)
- Write unit tests for backend APIs and payment logic
- Ensure mobile responsiveness

**Deliverables:**
- Functional campaign listing UI
- End-to-end donation flow (test mode via Stripe)

---

### **Sprint 2: Donation Tracking**

**Goal:** Allow donors to log in and view their donation history.

**User Stories:**
- As a donor, I want to create an account to track my donations.
- As a donor, I want to see my past donations in a dashboard.

**Tasks:**
- Implement authentication (JWT + OAuth)
- Build donor dashboard (React)
- Create `GET /donations/user` API
- Store and retrieve user donations in MongoDB
- Add integration tests for auth & data flow
- Refine UI based on Sprint 1 feedback

**Deliverables:**
- Login/registration flow
- Donation history dashboard

---

### **Sprint 3: Impact Reports**

**Goal:** Show donors how their contributions create change.

**User Story:**
- As a donor, I want to view impact reports to understand how donations are used.

**Tasks:**
- Design MongoDB collections for impact data (metrics, narratives, media)
- Build backend logic to serve report data
- Create frontend report page with visualizations (Chart.js)
- Display pie chart: "Funds Allocation" (e.g., 80% program, 15% ops, 5% admin)
- Unit tests for report generation
- Support basic image uploads for charity updates (optional)

**Deliverables:**
- Impact report page with one interactive visualization
- Sample data integration (simulated charity reports)

---

### **Sprint 4: Social Sharing & MVP Polish**

**Goal:** Finalize MVP and prepare for production.

**User Story:**
- As a user, I want to share campaigns on social media to spread awareness.

**Tasks:**
- Add social sharing buttons (Twitter/X, Facebook)
- Integrate client-side share functionality
- Finalize payment decision: Stripe (primary), PayPal (if time permits)
- Conduct end-to-end testing of all flows
- Apply UX improvements: trust badges, loading states, mobile fixes
- Run usability tests with 5+ users
- Deploy to production (AWS/Firebase)
- Final security audit (HTTPS, JWT, Stripe PCI compliance)

**Deliverables:**
- Social sharing functionality
- Polished, production-ready MVP
- Deployed staging and production environments

---

## 🛠️ Agile Practices

We follow core Scrum rituals and quality practices:

- **Daily Standups:** 15 mins, sync progress and blockers
- **Sprint Reviews:** Demo features to stakeholders
- **Retrospectives:** Reflect and improve team process
- **User Testing:** At least 5 test users per sprint
- **Backlog Grooming:** Weekly refinement using MoSCoW prioritization

### ✅ Definition of Done (DoD)
A feature is "Done" when:
- Code is peer-reviewed and merged
- Unit/integration tests pass
- Responsive and accessible UI
- Documented in project wiki
- Tested in staging environment

---

## 📌 Backlog & Scope Management

- **Strict MVP focus:** Only "Must-have" features included
- **Change control:** New requests go to backlog for post-MVP
- **Lean approach:** Use existing APIs and component libraries to reduce dev time

---

## 🔒 Key Technical Considerations

- **Security:** HTTPS, JWT auth, Stripe PCI compliance
- **Performance:** Optimized API responses, lazy loading
- **Trust:** Transparent impact reporting, verified charities (TBD post-MVP)
- **Scalability:** Schema design in MongoDB supports flexible reporting and growth

---

## ⚠️ Risk Management

| Risk | Impact | Mitigation |
|------|--------|----------|
| Feature creep | Timeline delays | Strict backlog control, MoSCoW prioritization |
| Payment integration delays | Blocked donation flow | Prioritize Stripe; PayPal as stretch goal |
| Poor donor trust | Low conversion | Usability testing, trust badges, clear impact data |
| Team bandwidth | Missed deadlines | Parallel frontend/backend work, reuse components |

---

## 🤝 Stakeholder Engagement

- **Charities:** Provide input on impact reporting format
- **Test Donors:** Participate in usability sessions
- **Sprint Reviews:** Bi-weekly demos starting Sprint 1
- **Feedback Loop:** Survey after each sprint

---

## 🎯 Conclusion

Delivering a functional, trustworthy charity donation platform in **5 sprints is feasible** with:
- Clear MVP scope
- Lean tech stack (MongoDB, React, Node.js)
- Iterative development
- Regular feedback

By the end of **Sprint 4**, ImpactHub will be **production-ready** with all core features live and tested.

---

## 📂 Project Resources

- [Figma Wireframes](https://figma.com/...) *(link when available)*
- [API Documentation](/docs/api.md) *(to be created)*
- [Contribution Guidelines](CONTRIBUTING.md) *(optional)*
- [Code of Conduct](CODE_OF_CONDUCT.md) *(optional)*

---

## 🚀 Let’s make an impact — one donation at a time.