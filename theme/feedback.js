document.addEventListener('DOMContentLoaded', function() {
  const feedbackButtons = document.querySelectorAll('.feedback-btn');
  const feedbackMessage = document.querySelector('.feedback-message');

  if (!feedbackButtons.length) return;

  const pageSlug = window.location.pathname.split('/').pop().replace('.html', '');
  const feedbackKey = `feedback_${pageSlug}`;

  feedbackButtons.forEach(button => {
    button.addEventListener('click', function() {
      const isHelpful = this.dataset.helpful === 'yes';

      feedbackButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');

      localStorage.setItem(feedbackKey, isHelpful ? 'yes' : 'no');

      if (feedbackMessage) {
        feedbackMessage.textContent = isHelpful
          ? 'Thank you! We\'re glad we could help.'
          : 'Thank you for the feedback. We\'ll work on improving this page.';
        feedbackMessage.classList.add('show');
      }

      setTimeout(() => {
        if (feedbackMessage) {
          feedbackMessage.classList.remove('show');
        }
      }, 4000);
    });
  });

  const savedFeedback = localStorage.getItem(feedbackKey);
  if (savedFeedback) {
    const savedButton = document.querySelector(`[data-helpful="${savedFeedback}"]`);
    if (savedButton) {
      savedButton.classList.add('selected');
    }
  }
});
