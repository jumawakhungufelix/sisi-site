
# Sisi Project Portal (National & County Projects Tracker)

A lightweight JavaScript application designed to model a civic platform where citizens can view national or county infrastructure projects, cast votes, and submit feedback. 

This project demonstrates advanced **Object-Oriented Programming (OOP)** architectures in JavaScript, focusing heavily on object composition, class inheritance, method overriding, and robust data structures.

---

## 🚀 Key OOP Principles Demonstrated

*   **Object Composition ("Has-A"):** The `Portal` class acts as the core orchestration framework. It aggregates lists of `Citizen` instances and `Project` instances without relying on parent-subclass tightly coupled hierarchies.
*   **Inheritance & Reusability ("Is-A"):** `CountyProject` extends the foundational `Project` class, gaining access to baseline functionality while avoiding manual copy-pasting of code block logic.
*   **Polymorphic Method Overriding:** `CountyProject` overrides the standard `acceptVote()` routine to inject locality constraints, while using `super.acceptVote()` to preserve baseline voter uniqueness restrictions.
*   **Encapsulation & Accessors:** Implementation of explicit property getters (`get level()`) to protect status properties and ensure read-only immutability outside execution blocks.

---

## 📋 Features & Validation Rules Enforced

### 1. Registration & Authentication (`Citizen` & `Portal`)
*   Automated sequence-driven ID assignment (sequential indexing starting at `100`).
*   Built-in geographical validation ensuring citizens only declare officially supported counties (`Nairobi`, `Mombasa`, `Kisumu`, `Kiambu`).
*   State tracking to monitor currently logged-in account identities.

### 2. Core Project Controls (`Project` & `CountyProject`)
*   **National Projects:** Multi-tenant entities accessible by any authenticated system citizen.
*   **County Projects:** Enforces regional verification rules—voting eligibility is restricted strictly to citizens matching the specific project's targeted county.
*   **The One-Vote Directive:** Enforces immutable state tracking via collection loops. Citizens may only register one binary choice per project ID; repeat attempts are safely intercepted and refused.
*   **Input Cleansing:** Rejects malformed values (votes must cleanly equal `support` or `oppose`, while text feedback strings are stripped of spaces and rejected if empty or blank).

### 3. Reporting Metrics
*   Dynamic tabular summaries calculating overall voter turnout, support ratios, and percentage conversions.
*   A highest-support analytical scanner processing cross-repository arrays to return current leading initiatives.

---

## 🛠️ Getting Started & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your machine to execute the JavaScript engine directly via your terminal.

### Project Setup
1. Clone your repository or navigate to your local working project space:
   ```bash
   cd path/to/your/projects/sisi-web-app
   ```

2. Run the main driver file via Node.js to evaluate system behaviors:
   ```bash
   node scripts/main.js
   ```

---

## 🧪 Fictional Seed Data Used for Evaluation

When initialized, the engine seeds the tracking database with the following core initiatives:
*   **National:** `Affordable Housing Phase 3` — KSh 5,000,000,000
*   **Nairobi County:** `Market Upgrade` — KSh 120,000,000
*   **Mombasa County:** `Ferry Walkway` — KSh 80,000,000
*   **Kisumu County:** `Lakefront Street Lights` — KSh 45,000,000

---

## 📁 Repository Structure
```text
├── scripts/
│   ├── main.js         # Test driver file initializing tracking datasets
│   └── classes.js      # Contains Citizen, Project, CountyProject, and Portal structures
└── README.md           # Documentation overview
```
