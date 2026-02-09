# FigJam AI Visualization Prompt

Copy and paste the text below into the FigJam AI "Generate" box (or give it to a designer) to visualize the architecture.

---

### **Prompt:**

> Create a technical flowchart for a Vehicle Marketplace AI System divided into three horizontal swimlanes: **Tier 1 (Rule-Based & Free)**, **Tier 2 (AI-Enhanced & Paid)**, and **Database/Infrastructure**.
>
> **1. Tier 1 Swimlane (Top):**
> *   **Process A: Smart Search (Rules):** User types "Toyota Vitz" -> **Keyword Parser** (Circle) -> Checks `Make/Model Dictionary` -> Returns Filters.
> *   **Process B: Quality Check:** User submits Listing -> **Zod Validator** (Diamond) -> Checks `Missing Fields` & `Image Count` -> Returns "Quality Score / 10".
> *   **Process C: Duplicate Check:** Image Upload -> **MD5 Hasher** -> Checks DB -> Returns "Duplicate Warning".
>
> **2. Tier 2 Swimlane (Middle):**
> *   **Process A: Smart Search (Hybrid):** If **Keyword Parser** fails (Diamond) -> Send query to **Claude Haiku API** (Icon) -> AI Extracts JSON Filters -> Returns structured results.
> *   **Process B: Description Helper:** User clicks "Improve" -> Send text to **Claude Sonnet API** -> Returns "Polished Description".
>
> **3. Database Swimlane (Bottom):**
> *   Show a **Cylinder** named "Supabase (Postgres)".
> *   Show connection lines from all processes reading/writing key data (Listings table, Vector store).
> *   Show a **Bucket** named "Cloudflare R2" connected to the Image Upload.
>
> **Style:**
> *   Use **Green** for Tier 1 (Free) components.
> *   Use **Purple/Blue** for Tier 2 (AI API) components to signify cost/premium.
> *   Use **Grey** for Database items.
> *   Connect the logical flows with arrows.

---

### **Alternative Prompt (Simpler / High Level):**

> Draw a mindset map for "Autolist AI Strategy".
> Center node: **"Autolist AI"**.
> Three main branches:
> 1.  **Trust & Quality** (Green)
>     *   Listing Quality Score
>     *   Duplicate Detection
>     *   Price Transparency Labels
> 2.  **Discovery** (Blue)
>     *   Smart Search Bar
>     *   Natural Language Filters
>     *   Similar Vehicle Recommendations
> 3.  **Infrastructure** (Grey)
>     *   Supabase
>     *   Cloudflare R2
>     *   Rule-Based Logic (No Cost)
>     *   Claude API (Low Cost)
