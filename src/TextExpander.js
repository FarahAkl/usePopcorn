import { useState } from "react";

export default function TextExpander({
  collapsedNumWords = 10,
  expandButtonText = "Show More",
  buttonColor = "blue",
  expanded = false,
  className = "",
  collapseButtonText = "Show Less",
  children,
}) {
  const textContent = children;
  const [isExpanded, setIsExpanded] = useState(expanded);

  const content = isExpanded
    ? children
    : textContent.split(" ").splice(0, collapsedNumWords).join(" ");

  function handleCollapsed() {
    setIsExpanded((c) => !c);
  }
  return (
    <div>
      {content}
      <Button
        expandButtonText={expandButtonText}
        buttonColor={buttonColor}
        collapseButtonText={collapseButtonText}
        collapsed={isExpanded}
        handleCollapsed={handleCollapsed}
      />
    </div>
  );
}

function Button({
  collapseButtonText,
  expandButtonText,
  collapsed,
  handleCollapsed,
  buttonColor,
}) {
  return (
    <button onClick={handleCollapsed} style={{ color: buttonColor }}>
      {!collapsed ? `...${expandButtonText}` : collapseButtonText}
    </button>
  );
}
