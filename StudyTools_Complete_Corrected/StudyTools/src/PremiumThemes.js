import React from "react";
import "./PremiumThemes.css";

const THEMES = [
{
id: "classic",
name: "Classic",
description: "Original StudyTools colors",
colors: ["#5b5ce2", "#f5f7fb", "#ffffff"],
},
{
id: "ocean",
name: "Ocean Blue",
description: "Calm blue study space",
colors: ["#087ea4", "#edf8fc", "#ffffff"],
},
{
id: "forest",
name: "Forest Green",
description: "Natural green colors",
colors: ["#23845b", "#eff8f1", "#ffffff"],
},
{
id: "purple",
name: "Royal Purple",
description: "Rich purple accents",
colors: ["#8957d5", "#f6f0ff", "#ffffff"],
},
{
id: "sunset",
name: "Sunset",
description: "Warm orange and coral",
colors: ["#df6848", "#fff4ed", "#ffffff"],
},
];

export default function PremiumThemes({ selectedTheme = "classic", onSelectTheme }) {
return (
<section className="settings-section premium-themes">
<h3>Premium Themes</h3>

  <p className="premium-themes-description">
    Personalize your study space. Choose a color theme below.
  </p>

  <div className="premium-theme-grid">
    {THEMES.map((theme) => {
      const selected = selectedTheme === theme.id;

      return (
        <button
          key={theme.id}
          type="button"
          className={`premium-theme-option ${selected ? "selected" : ""}`}
          onClick={() => onSelectTheme(theme.id)}
          aria-pressed={selected}
          aria-label={`Choose ${theme.name} theme`}
        >
          <span className="premium-theme-preview" aria-hidden="true">
            {theme.colors.map((color, index) => (
              <span
                key={index}
                className="premium-theme-swatch"
                style={{ backgroundColor: color }}
              />
            ))}
          </span>

          <span className="premium-theme-name">{theme.name}</span>

          <span className="premium-theme-description">
            {theme.description}
          </span>

          {selected && (
            <span className="premium-theme-selected">
              ✓ Selected
            </span>
          )}
        </button>
      );
    })}
  </div>
</section>

);
            }
