document.addEventListener('DOMContentLoaded', async () => {
  renderNavigation();

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('eventId');

  if (!eventId || isNaN(eventId)) {
    showErrorMsg('Invalid event ID. Please select an event from the home or search page.');
    document.getElementById('event-details-container').innerHTML = '<p>Invalid event. Please return to the home page.</p>';
    return;
  }

  const eventDetailsContainerEl = document.getElementById('event-details-container');
  try {
    const event = await fetchData(`/events/${eventId}`);

    const progressPercent = event.goal_amount > 0 
      ? Math.min(Math.round((event.progress_amount / event.goal_amount) * 100), 100) 
      : 0;
    const formattedDate = new Date(event.event_date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const formattedTicketPrice = event.ticket_price > 0 
      ? `$${parseFloat(event.ticket_price).toFixed(2)}` 
      : 'Free (Donations Welcome)';

    eventDetailsContainerEl.innerHTML = `
      <div class="event-details">
        <div class="event-header">
          <span class="event-category">${event.category_name}</span>
          <h1>${event.event_name}</h1>
          <div class="event-meta">
            <div>
              <i>📅</i> ${formattedDate}
            </div>
            <div>
              <i>📍</i> ${event.location}
            </div>
            <div>
              <i>🏢</i> Hosted by ${event.org_name}
            </div>
          </div>
        </div>

        <div class="event-description">
          <h2>About This Event</h2>
          <p>${event.event_description}</p>
        </div>

        <div class="event-progress">
          <h2>Fundraising Progress</h2>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="progress-text">
            <span>Raised: $${parseFloat(event.progress_amount).toFixed(2)}</span>
            <span>Goal: $${parseFloat(event.goal_amount).toFixed(2)}</span>
            <span>Progress: ${progressPercent}%</span>
          </div>
        </div>

        <div class="event-ticket">
          <h2>Ticket Information</h2>
          <p><strong>Ticket Price:</strong> ${formattedTicketPrice}</p>
          <button id="register-btn" class="btn">Register for This Event</button>
        </div>

        <div class="event-org">
          <h2>About the Host</h2>
          <h3>${event.org_name}</h3>
          <p>${event.org_description}</p>
          <p><strong>Contact the Host:</strong> <a href="mailto:${event.contact_email}">${event.contact_email}</a></p>
        </div>
      </div>
    `;

    const registerBtn = document.getElementById('register-btn');
    const registerModal = document.getElementById('register-modal');
    const closeModalBtn = document.getElementById('close-modal');

    registerBtn.addEventListener('click', () => {
      registerModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
      registerModal.style.display = 'none';
    });
    registerModal.addEventListener('click', (e) => {
      if (e.target === registerModal) {
        registerModal.style.display = 'none';
      }
    });

  } catch (err) {
    console.error('Failed to load event details:', err);
    eventDetailsContainerEl.innerHTML = '<p>Failed to load event details. Please try again later.</p>';
  }
});
