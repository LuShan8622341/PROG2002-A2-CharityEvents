document.addEventListener('DOMContentLoaded', async () => {
  renderNavigation();

  const categorySelectEl = document.getElementById('categoryId');
  try {
    const categories = await fetchData('/categories');
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.category_id;
      option.textContent = category.category_name;
      categorySelectEl.appendChild(option);
    });
  } catch (err) {
    console.error('Failed to load categories:', err);
    categorySelectEl.innerHTML = '<option value="">Failed to load categories</option>';
  }

  const searchFormEl = document.getElementById('search-form');
  const resultsContainerEl = document.getElementById('results-container');

  searchFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const startDate = document.getElementById('startDate').value || undefined;
    const endDate = document.getElementById('endDate').value || undefined;
    const location = document.getElementById('location').value.trim() || undefined;
    const categoryId = document.getElementById('categoryId').value || undefined;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showErrorMsg('End date cannot be earlier than start date.');
      return;
    }

    resultsContainerEl.innerHTML = '<p>Searching events...</p>';

    try {
      const searchParams = {};
      if (startDate) searchParams.startDate = startDate;
      if (endDate) searchParams.endDate = endDate;
      if (location) searchParams.location = location;
      if (categoryId) searchParams.categoryId = categoryId;

      const events = await fetchData('/events/search', searchParams);

      if (events.length === 0) {
        resultsContainerEl.innerHTML = '<p>No events matched your search criteria. Please try different filters.</p>';
        return;
      }

      let resultsHtml = '';
      events.forEach(event => {
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

        resultsHtml += `
          <div class="event-card">
            <span class="event-category">${event.category_name}</span>
            <h3>${event.event_name}</h3>
            <div class="event-date">${formattedDate}</div>
            <div class="event-location">${event.location}</div>
            
            <div class="event-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
              </div>
              <div class="progress-text">
                <span>Raised: $${parseFloat(event.progress_amount).toFixed(2)}</span>
                <span>Goal: $${parseFloat(event.goal_amount).toFixed(2)}</span>
              </div>
            </div>

            <div class="event-ticket">
              <p><strong>Ticket Price:</strong> $${parseFloat(event.ticket_price).toFixed(2)}</p>
            </div>

            <a href="event-details.html?eventId=${event.event_id}" class="btn">View Details</a>
          </div>
        `;
      });

      resultsContainerEl.innerHTML = resultsHtml;

    } catch (err) {
      console.error('Search failed:', err);
      resultsContainerEl.innerHTML = '<p>Failed to search events. Please try again later.</p>';
    }
  });

  const clearFiltersBtn = document.getElementById('clear-filters');
  clearFiltersBtn.addEventListener('click', () => {
    searchFormEl.reset();
    resultsContainerEl.innerHTML = '<p>Please enter search criteria and click "Search Events".</p>';
  });
});
