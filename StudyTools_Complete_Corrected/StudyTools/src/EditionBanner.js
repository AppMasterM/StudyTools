import React from "react";
import "./EditionBanner.css";

export default function EditionBanner() {
return (
<section
className="edition-banner"
aria-label="StudyTools Premium Edition"
>
<div className="edition-banner-icon" aria-hidden="true">
👑
</div>

  <div className="edition-banner-content">
    <span className="edition-banner-label">
      PREMIUM EDITION
    </span>

    <h3>Make every study session count</h3>

    <p>
      Your StudyTools Premium edition is being prepared.
      Your existing study tools, notes and planner are ready
      to help you stay organized while additional premium
      features are developed.
    </p>
  </div>
</section>

);
}
