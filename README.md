# ImpactHub
# Charity Donation Platform — Agile Project Plan

## Overview
This document outlines the plan to deliver a **Charity Donation Platform** within **5 sprints** (including Sprint 0) using **Agile Scrum principles**. The platform will focus on core MVP features:

- **Campaign Browsing**
- **Donation System**
- **Donation Tracking**
- **Impact Reports**
- **Social Sharing**

Additional, non-critical features will be deferred to post-MVP to ensure delivery within the timeline.

---

## 1. Feasibility and Constraints

### Timeline
- **Sprint Duration:** 1 week per sprint
- **Total Duration:** 5 weeks (Sprint 0 + 4 Development Sprints)

### Team
- **Size:** 4 members
- **Skills:** Frontend (React/Vue.js), Backend (Node.js), Database (MongoDB)

### Scope
- **MVP Focus:** Core donation and campaign features
- **Deferred Features:** Recurring donations, advanced analytics, multi-currency support

### Constraints
- Limited sprints → strict prioritization
- Avoiding technical debt
- Rapid feedback loops to validate progress

---

## 2. Sprint Plan

### **Sprint 0: Planning & Setup (1 week)**

**Goal:** Establish the foundation for development.

**Tasks:**
- Define **product vision**: A transparent, donor-trust-focused charity platform
- Create **initial product backlog** with high-priority user stories:
  - Browse campaigns
  - Donate securely
  - Track donations
  - View impact reports
  - Share campaigns on social media
- Prioritize backlog with **MoSCoW** method
- Set up **tech stack**:
  - Frontend: React
  - Backend: Node.js/Express
  - Database: PostgreSQL
  - Payments: Stripe
- Create **wireframes** for campaign listing and donation pages
- Configure **CI/CD pipeline** (GitHub Actions)
- Identify stakeholders (charities, test donors)

**Deliverables:**
- Product backlog
- Development environment
- Initial wireframes
- Stakeholder alignment

---

### **Sprint 1: Campaign Browsing & Basic Donation System (1 week)**

**Goal:** Implement campaign display and enable secure donations.

**User Stories:**
- As a donor, I want to browse campaigns to choose causes.
- As a donor, I want to donate securely to support a cause.

**Tasks:**
- Build **campaign listing page** (React)
- Create backend APIs (`GET /campaigns`)
- Design database schema for **campaigns** and **donations**
- Integrate **Stripe** for single donations
- Unit tests for APIs and payment flows
- Responsive UI for campaigns

**Deliverables:**
- Functional campaign listing
- Secure single donation flow

---

### **Sprint 2: Donation Tracking (1 week)**

**Goal:** Let donors view their donation history.

**User Story:**
- As a donor, I want to track my donations to see my history.

**Tasks:**
- Implement authentication (OAuth/JWT)
- Build **donor dashboard** (React)
- Backend API for donation history (`GET /donations/user`)
- Link donations to user accounts in DB
- Integration tests for authentication & APIs
- UI refinements based on Sprint 1 feedback

**Deliverables:**
- Donation history dashboard

---

### **Sprint 3: Impact Reports (1 week)**

**Goal:** Provide transparent reports on donation usage.

**User Story:**
- As a donor, I want to view impact reports to understand donation outcomes.

**Tasks:**
- Backend logic to process charity-reported data
- Frontend report page with metrics & simple visuals
- Integrate Chart.js for pie chart visualization
- Store impact report data in DB
- Unit tests for report generation

**Deliverables:**
- Impact report page with one visualization

---

### **Sprint 4: Social Sharing & MVP Polish (1 week)**

**Goal:** Finalize MVP and add sharing features.

**User Story:**
- As a user, I want to share campaigns on social media to promote causes.

**Tasks:**
- Integrate social sharing APIs (Twitter/X, Facebook)
- Add share buttons to campaign pages
- Tests for share functionality
- UX improvements from previous feedback (mobile responsive, trust badges)
- End-to-end testing of all features
- Deploy to production (AWS/Firebase)

**Deliverables:**
- Social sharing features
- Polished, production-ready MVP

---

## 3. Key Considerations

### Scope Management
- Focus on **MVP only**
- Use existing APIs to save time
- Simplify complex features

### Team Efficiency
- Parallel work across frontend & backend
- Use component libraries (Material-UI)
- Automate testing

### Stakeholder Feedback
- Early engagement with charities & donors
- Post-sprint feedback sessions

### Technical Simplicity
- Lean stack: React, Node.js/Express, PostgreSQL, Stripe
- HTTPS & JWT authentication for security

---

## 4. Risk Management

| **Risk** | **Impact** | **Mitigation** |
|----------|------------|----------------|
| Feature creep | Timeline delays | Strict backlog prioritization |
| Payment integration delays | Donation flow blocked | Early testing with Stripe |
| Poor UX trust | Lower donor retention | Frequent usability testing |

---

## 5. Sprint Timeline & Effort

**Total Duration:** 10 weeks

| **Sprint** | **Focus** | **Effort (Hours)** |
|------------|-----------|--------------------|
| Sprint 0 | Planning & Setup | ~20–30 |
| Sprint 1 | Campaigns + Donations | ~80–100 |
| Sprint 2 | Donation Tracking | ~80–100 |
| Sprint 3 | Impact Reports | ~80–100 |
| Sprint 4 | Sharing + Polish | ~80–100 |

---

## 6. Agile Practices

- **Daily Standups** — 15 minutes
- **Sprint Reviews** — Feature demos to stakeholders
- **Retrospectives** — Process improvements
- **Continuous Delivery** — CI/CD deployment after each sprint
- **User Testing** — At least 5 users per sprint

---

## 7. Conclusion

Delivering the **Charity Donation Platform** in 5 sprints is **feasible** with:
- Strict MVP focus
- Iterative development
- Regular stakeholder feedback
- Lean tech stack

By the end of Sprint 4, the platform will be **ready for production** with all core features operational.

---
