// Tabs component functionality

document.addEventListener('DOMContentLoaded', function() {
  // Find all tab containers
  const tabContainers = document.querySelectorAll('.tabs-container');

  tabContainers.forEach(container => {
    const tabsId = container.dataset.tabsId;
    const buttons = container.querySelectorAll('.tab-button');
    const panels = container.querySelectorAll('.tab-panel');

    // Add click handlers to all tab buttons
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTab = this.dataset.tab;

        // Remove active class from all buttons and panels in this container
        buttons.forEach(btn => btn.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        // Add active class to clicked button and corresponding panel
        this.classList.add('active');
        const targetPanel = container.querySelector(`.tab-panel[data-tab="${targetTab}"]`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  });
});
