import React from "react";

export default function EditionBanner() {
return (
<section
className="edition-banner"
aria-label="StudyTools Free Edition"
>
<div className="edition-banner-icon" aria-hidden="true">
📚
</div>

  <div className="edition-banner-content">
    <span className="edition-banner-label">
      FREE EDITION
    </span>

    <h3>Study smarter with StudyTools</h3>

    <p>
      Enjoy your study tools, notes and planner.
      Premium features are planned for a future update.
    </p>
  </div>
</section>

);
}